import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

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

const DEFAULT_ADMIN: User = {
  id: 'admin',
  name: 'admin',
  email: 'admin@localhost',
  role: 'admin',
  password: 'admin123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuarios desde Supabase al iniciar
  useEffect(() => {
    loadUsers();
  }, []);

  // Verificar si hay sesión guardada
  useEffect(() => {
    const savedUser = localStorage.getItem('rocky_current_user');
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
      localStorage.setItem('rocky_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rocky_current_user');
    }
  }, [currentUser]);

  // Cargar usuarios desde Supabase
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, role, password')
        .order('name');

      if (error) {
        console.error('Error loading users:', error);
        // Si falla, usar admin por defecto
        setUsers([DEFAULT_ADMIN]);
        return;
      }

      if (data && data.length > 0) {
        const mappedUsers: User[] = data.map((c: any) => ({
          id: c.id,
          name: c.name || c.username || '',
          email: c.email || '',
          role: c.role || 'user',
          password: c.password || '',
        }));
        setUsers(mappedUsers);
      } else {
        // No hay usuarios en Supabase, usar admin local
        setUsers([DEFAULT_ADMIN]);
      }
    } catch (e) {
      console.error('Error loading users:', e);
      // Fallback a admin local
      setUsers([DEFAULT_ADMIN]);
    }
  };

  // Crear admin por defecto en Supabase
  const createDefaultAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: 'admin',
          email: 'admin@localhost',
          role: 'admin',
          password: 'admin123',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (!error && data) {
        setUsers([{
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          password: data.password,
        }]);
      } else {
        setUsers([DEFAULT_ADMIN]);
      }
    } catch (e) {
      console.error('Error creating default admin:', e);
      setUsers([DEFAULT_ADMIN]);
    }
  };

  // Login - verifica contra Supabase con fallback local
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Primero verificar con el default admin local
      if (username.toLowerCase() === 'admin' && password === 'admin123') {
        setCurrentUser(DEFAULT_ADMIN);
        return { success: true };
      }

      // Buscar en Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, role, password')
        .eq('name', username)
        .single();

      if (error || !data) {
        // Si no existe en Supabase, verificar en usuarios locales
        const localUser = users.find(u => u.name.toLowerCase() === username.toLowerCase());
        if (localUser && localUser.password === password) {
          setCurrentUser(localUser);
          return { success: true };
        }
        return { success: false, error: 'Usuario no encontrado' };
      }

      if (data.password !== password) {
        return { success: false, error: 'Contraseña incorrecta' };
      }

      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role || 'user',
        password: data.password,
      };

      setCurrentUser(user);
      return { success: true };
    } catch (e) {
      console.error('Login error:', e);
      // Fallback total - buscar en usuarios locales cargados
      if (username.toLowerCase() === 'admin' && password === 'admin123') {
        setCurrentUser(DEFAULT_ADMIN);
        return { success: true };
      }
      const localUser = users.find(u => u.name.toLowerCase() === username.toLowerCase());
      if (localUser && localUser.password === password) {
        setCurrentUser(localUser);
        return { success: true };
      }
      return { success: false, error: 'Error al conectar con servidor' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rocky_current_user');
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('name', userData.name)
        .single();

      if (existing) {
        return { success: false, error: 'El nombre de usuario ya existe' };
      }

      // Crear en Supabase
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user',
          password: userData.password,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        return { success: false, error: 'Error al crear usuario' };
      }

      // Recargar usuarios
      await loadUsers();

      return { success: true };
    } catch (e) {
      console.error('Error adding user:', e);
      return { success: false, error: 'Error al crear usuario' };
    }
  };

  const updateUser = async (user: User) => {
    try {
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

      // Actualizar usuario actual si es el mismo
      if (currentUser?.id === user.id) {
        setCurrentUser(user);
      }

      // Recargar usuarios
      await loadUsers();
    } catch (e) {
      console.error('Error updating user:', e);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      if (id === 'admin') {
        throw new Error('No se puede eliminar el usuario administrador');
      }

      await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (currentUser?.id === id) {
        setCurrentUser(null);
      }

      // Recargar usuarios
      await loadUsers();
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
