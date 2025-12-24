import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { authApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { accessToken } = await authApi.login(username, password);

      // Persist authenticated session
      localStorage.setItem('accessToken', accessToken);

      const newUser: User = {
        id: username,
        email: username,
        name: username,
        avatar: undefined,
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erreur de connexion",
        description: error.response?.data?.message || "Email ou mot de passe incorrect",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
