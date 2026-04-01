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

  // Cargar usuarios desde localStorage al iniciar
  useEffect(() => {
    const storedUsers = loadUsersFromStorage();
    setUsers(storedUsers);

    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing saved user:', e);
      }
    }
    setLoading(false);
  }, []);

  // Guardar usuario actual en localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Sincronizar con Supabase en segundo plano (no bloquea la app)
  useEffect(() => {
    const syncToSupabase = async () => {
      try {
        // Intentar cargar usuarios de Supabase
        const { data, error } = await supabase
          .from('clients')
          .select('id, name, email, role, password')
          .order('name');

        if (error) {
          console.log('Supabase no disponible, usando almacenamiento local');
          return;
        }

        if (data && data.length > 0) {
          // Fusionar usuarios de Supabase con locales
          const supabaseUsers: User[] = data.map((c: any) => ({
            id: c.id,
            name: c.name || c.username || '',
            email: c.email || '',
            role: (c.role as UserRole) || 'collaborator',
            password: c.password || '',
            createdAt: c.created_at,
          }));

          // Combinar con locales (prioridad para locales)
          const localIds = users.map(u => u.id);
          const newFromSupabase = supabaseUsers.filter(u => !localIds.includes(u.id));

          if (newFromSupabase.length > 0) {
            const mergedUsers = [...users, ...newFromSupabase];
            setUsers(mergedUsers);
            saveUsersToStorage(mergedUsers);
          }
        }
      } catch (e) {
        console.log('Sincronización con Supabase no disponible');
      }
    };

    // Solo sincronizar si hay usuarios en Supabase potenciales
    syncToSupabase();
  }, []);

  // Login - verifica contra usuarios locales (siempre funciona)
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Normalizar nombre de usuario
      const normalizedUsername = username.trim().toLowerCase();

      // Buscar en usuarios locales
      const user = users.find(u => u.name.toLowerCase() === normalizedUsername);

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      setCurrentUser(user);

      // Intentar sincronizar en segundo plano
      syncUserToSupabase(user);

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
      // Verificar si ya existe
      const exists = users.find(u => u.name.toLowerCase() === userData.name.toLowerCase());
      if (exists) {
        return { success: false, error: 'El nombre de usuario ya existe' };
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

      // Guardar en localStorage (siempre funciona)
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      saveUsersToStorage(updatedUsers);

      // Intentar sincronizar con Supabase en segundo plano
      syncUserToSupabase(newUser);

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
