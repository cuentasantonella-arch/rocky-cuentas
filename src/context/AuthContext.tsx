import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DEFAULT_ADMIN_USER, generateId } from '../types';

const STORAGE_KEY = 'streamguard_users';
const CURRENT_USER_KEY = 'streamguard_current_user';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inicializar usuarios por defecto
const initializeUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [DEFAULT_ADMIN_USER];
    }
  }
  return [DEFAULT_ADMIN_USER];
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => initializeUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Guardar usuarios en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Guardar usuario actual en localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Actualizar último login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }) => {
    // Verificar si el username ya existe
    if (users.some((u) => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error('El nombre de usuario ya existe');
    }

    const newUser: User = {
      ...userData,
      id: generateId(),
      passwordHash: userData.password,
      createdAt: new Date().toISOString(),
    };

    // Eliminar la propiedad password antes de guardar (solo guardamos passwordHash)
    const userToSave: User = {
      id: newUser.id,
      username: newUser.username,
      passwordHash: newUser.passwordHash,
      role: newUser.role,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };
    setUsers((prev) => [...prev, userToSave]);
  };

  const updateUser = (user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));

    // Actualizar usuario actual si es el mismo
    if (currentUser?.id === user.id) {
      setCurrentUser(user);
    }
  };

  const deleteUser = (id: string) => {
    // No permitir eliminar al admin
    if (id === 'admin') {
      throw new Error('No se puede eliminar el usuario administrador');
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    // Si el usuario actual es el eliminado, hacer logout
    if (currentUser?.id === id) {
      setCurrentUser(null);
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
    isAdmin: currentUser?.role === 'admin',
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
