import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthContextType, User, Categories } from '../types';
import { authAPI, newsAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      checkAuthStatus(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async (authToken: string) => {
    try {
      const userData = await authAPI.getCurrentUser(authToken);
      const categoriesData = await newsAPI.getCategories();
      setUser(userData.user);
      setToken(authToken);
      setCategories(categoriesData as Categories[]);
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true);
      const response = await authAPI.register(email, password, confirmPassword);
      
      if (response.token) {
        // User Service повертає токен без префікса Bearer
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
        setToken(response.token);
        setUser(response.user);
        return {};
      } else {
        return { error: 'Registration successful but no token received' };
      }
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      // Видаляємо Bearer префікс якщо він є
      const cleanToken = response.token.replace('Bearer ', '');
      localStorage.setItem('auth_token', cleanToken);
      localStorage.setItem('user_id', response.user.id);
      setToken(cleanToken);
      setUser(response.user);
      return {};
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    categories,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
