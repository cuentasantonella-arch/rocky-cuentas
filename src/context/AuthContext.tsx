import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';
import { generateId } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'rocky_users';
const CURRENT_USER_KEY = 'rocky_current_user';

const DEFAULT_ADMIN: User = {
  id: 'admin',
  name: 'admin',
  email: 'admin@localhost',
  role: 'admin',
  password: 'admin123',
  createdAt: new Date().toISOString(),
};

// Helper para cargar usuarios de localStorage
const loadUsersFromStorage = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const users = JSON.parse(stored);
      // Asegurar que admin siempre existe
      if (!users.find((u: User) => u.id === 'admin')) {
        users.unshift(DEFAULT_ADMIN);
      }
      return users;
    }
  } catch (e) {
    console.error('Error loading users from storage:', e);
  }
  return [DEFAULT_ADMIN];
};

// Helper para guardar usuarios en localStorage
const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage:', e);
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'pending' | 'syncing' | 'done' | 'error'>('pending');

  // Función para sincronizar con Supabase
  const syncFromSupabase = async () => {
    setSyncStatus('syncing');
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, role, password, created_at')
        .order('name');

      if (error) {
        console.log('Supabase error:', error.message);
        setSyncStatus('error');
        return;
      }

      if (data && data.length > 0) {
        const supabaseUsers: User[] = data.map((c: any) => ({
          id: c.id,
          name: c.name || c.username || '',
          email: c.email || '',
          role: (c.role as UserRole) || 'collaborator',
          password: c.password || '',
          createdAt: c.created_at,
        }));

        // Fusionar: actualizar locales Y agregar nuevos de Supabase
        const localIds = users.map(u => u.id);
        const newFromSupabase = supabaseUsers.filter(u => !localIds.includes(u.id));

        let mergedUsers = [...users];

        // Agregar usuarios nuevos de Supabase
        if (newFromSupabase.length > 0) {
          mergedUsers = [...mergedUsers, ...newFromSupabase];
          console.log('Agregados', newFromSupabase.length, 'usuarios de Supabase');
        }

        // Actualizar usuarios existentes si tienen datos diferentes
        supabaseUsers.forEach(supabaseUser => {
          const localIndex = mergedUsers.findIndex(u => u.id === supabaseUser.id);
          if (localIndex >= 0) {
            // Actualizar datos del usuario local con datos de Supabase
            mergedUsers[localIndex] = {
              ...mergedUsers[localIndex],
              name: supabaseUser.name,
              email: supabaseUser.email,
              role: supabaseUser.role,
              password: supabaseUser.password,
            };
          }
        });

        setUsers(mergedUsers);
        saveUsersToStorage(mergedUsers);
        console.log('Sincronizados', newFromSupabase.length, 'usuarios nuevos de Supabase');
      }
      setSyncStatus('done');
    } catch (e) {
      console.log('Error de sincronización:', e);
      setSyncStatus('error');
    }
  };

  // Cargar usuarios desde localStorage Y sincronizar con Supabase al iniciar
  useEffect(() => {
    const init = async () => {
      // 1. Cargar de localStorage inmediatamente
      const storedUsers = loadUsersFromStorage();
      setUsers(storedUsers);

      // 2. Verificar si hay sesión guardada
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        } catch (e) {
          console.error('Error parsing saved user:', e);
        }
      }

      // 3. Sincronizar con Supabase
      await syncFromSupabase();

      setLoading(false);
    };

    init();
  }, []);

  // Login - verifica contra Supabase Y usuarios locales
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Normalizar nombre de usuario
      const normalizedUsername = username.trim().toLowerCase();

      console.log('Intentando login con:', normalizedUsername);

      // 1. PRIMERO: Verificar en Supabase (fuente de verdad)
      try {
        const { data: supabaseUser, error: supabaseError } = await supabase
          .from('clients')
          .select('id, name, email, role, password, created_at')
          .eq('name', normalizedUsername)
          .single();

        // Si NO hay error y SI hay datos, el usuario existe en Supabase
        if (!supabaseError && supabaseUser) {
          console.log('Usuario encontrado en Supabase:', supabaseUser);

          if (supabaseUser.password !== password) {
            console.log('Contraseña incorrecta (Supabase)');
            return { success: false, error: 'Contraseña incorrecta' };
          }

          // Crear usuario del estado desde Supabase
          const userFromSupabase: User = {
            id: supabaseUser.id,
            name: supabaseUser.name,
            email: supabaseUser.email || '',
            role: (supabaseUser.role as UserRole) || 'collaborator',
            password: supabaseUser.password,
            createdAt: supabaseUser.created_at,
          };

          console.log('Login exitoso (desde Supabase)');
          setCurrentUser(userFromSupabase);

          // Guardar en localStorage para persistencia de sesión
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userFromSupabase));

          // Actualizar lista local si el usuario no existe
          if (!users.find(u => u.id === supabaseUser.id)) {
            const updatedUsers = [...users, userFromSupabase];
            setUsers(updatedUsers);
            saveUsersToStorage(updatedUsers);
          }

          return { success: true };
        } else if (supabaseError && supabaseError.code !== 'PGRST116') {
          // Error real (no solo "no encontrado")
          console.log('Error de Supabase:', supabaseError.message);
          // Supabase tiene un error real, continuar a usuarios locales
        } else {
          console.log('Usuario no encontrado en Supabase (continuando a locales)');
        }
      } catch (e) {
        console.log('Excepción al buscar en Supabase:', e);
        // Continuar a usuarios locales
      }

      // 2. SEGUNDO: Verificar en usuarios locales (fallback para admin y usuarios locales)
      const localUser = users.find(u => u.name.toLowerCase() === normalizedUsername);

      if (!localUser) {
        console.log('Usuario no encontrado');
        return { success: false, error: 'Usuario no encontrado' };
      }

      console.log('Usuario encontrado localmente:', localUser);

      if (localUser.password !== password) {
        console.log('Contraseña incorrecta');
        return { success: false, error: 'Contraseña incorrecta' };
      }

      console.log('Login exitoso (local)');
      setCurrentUser(localUser);

      // Guardar en localStorage para persistencia de sesión
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localUser));

      // Sincronizar en segundo plano con Supabase
      syncUserToSupabase(localUser);

      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  // Sincronizar usuario individual a Supabase
  const syncUserToSupabase = async (user: User) => {
    try {
      // Verificar si ya existe en Supabase
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', user.name)
        .single();

      if (existing) {
        // Actualizar
        await supabase
          .from('clients')
          .update({
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
      } else {
        // Crear
        await supabase
          .from('clients')
          .insert([{
            id: user.id,
            name: user.name,
            email: user.email || '',
            role: user.role,
            password: user.password,
            created_at: user.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
      }
    } catch (e) {
      console.log('No se pudo sincronizar usuario con Supabase');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Normalizar nombre
      const normalizedName = userData.name.trim().toLowerCase();

      // Verificar si ya existe en locales
      const existsLocal = users.find(u => u.name.toLowerCase() === normalizedName);
      if (existsLocal) {
        return { success: false, error: 'El nombre de usuario ya existe' };
      }

      // Verificar si ya existe en Supabase
      try {
        const { data: existingSupabase } = await supabase
          .from('clients')
          .select('id')
          .eq('name', normalizedName)
          .single();

        if (existingSupabase) {
          return { success: false, error: 'El nombre de usuario ya existe en el servidor' };
        }
      } catch (e) {
        // Si hay error, significa que no existe, continuamos
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: generateId(),
        name: userData.name.trim(),
        email: userData.email || '',
        role: userData.role || 'collaborator',
        password: userData.password,
        createdAt: new Date().toISOString(),
      };

      console.log('Creando usuario:', newUser);

      // 1. PRIMERO: Guardar en Supabase (fuente principal)
      let savedToSupabase = false;
      try {
        const { error: supabaseError } = await supabase
          .from('clients')
          .insert([{
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            password: newUser.password,
            created_at: newUser.createdAt,
            updated_at: new Date().toISOString(),
          }]);

        if (supabaseError) {
          console.error('Error guardando en Supabase:', supabaseError);
          // Verificar si es error de RLS
          if (supabaseError.code === '42501' || supabaseError.code === 'PGRST116') {
            return { success: false, error: 'Error de permisos en Supabase. Verifica las políticas RLS de la tabla clients.' };
          }
          // No fallamos por ahora, guardamos localmente al menos
        } else {
          console.log('Usuario guardado en Supabase exitosamente');
          savedToSupabase = true;
        }
      } catch (e: any) {
        console.error('Error al conectar con Supabase:', e);
        return { success: false, error: 'No se pudo conectar con Supabase: ' + (e?.message || 'Error desconocido') };
      }

      // 2. SEGUNDO: Guardar en localStorage
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      console.log('Usuario creado:', newUser.name, '| Guardado en Supabase:', savedToSupabase);
      return { success: true };
    } catch (e) {
      console.error('Error adding user:', e);
      return { success: false, error: 'Error al crear usuario' };
    }
  };

  const updateUser = async (user: User) => {
    try {
      // Actualizar en localStorage
      const updatedUsers = users.map(u => u.id === user.id ? user : u);
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      // Actualizar usuario actual si es el mismo
      if (currentUser?.id === user.id) {
        setCurrentUser(user);
      }

      // Intentar sincronizar con Supabase
      syncUserToSupabase(user);
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (id === 'admin') {
        throw new Error('No se puede eliminar el usuario administrador');
      }

      // Eliminar de localStorage
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      if (currentUser?.id === id) {
        setCurrentUser(null);
      }

      // Intentar eliminar de Supabase
      try {
        await supabase
          .from('clients')
          .delete()
          .eq('id', id);
      } catch (e) {
        console.log('No se pudo eliminar usuario de Supabase');
      }
    } catch (e) {
      console.error('Error deleting user:', e);
      throw e;
    }
  };

  const value: AuthContextType = {
    currentUser,
    users,
    isAuthenticated: !!currentUser,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAdmin: currentUser?.role === 'admin' || currentUser?.name === 'admin',
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
