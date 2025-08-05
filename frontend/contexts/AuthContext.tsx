import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { makeSecureRequest, clearCSRFToken } from '@/lib/csrf';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios to include credentials for HTTP-only cookies
  useEffect(() => {
    axios.defaults.withCredentials = true;
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await makeSecureRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me/`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await makeSecureRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await makeSecureRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearCSRFToken();
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 