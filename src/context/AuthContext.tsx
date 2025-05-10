import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthContextType } from '../types/types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
            logout();
          } else {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'An error occurred during login');
    }
  };

  const signup = async (userData: Omit<User, 'id' | 'status'> & { password: string }) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear any residual questionnaire data (defensive cleanup)
    localStorage.removeItem('questionnaire_progress');
    localStorage.removeItem('questionnaire_answers');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await fetch(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup, 
        logout,
        refreshUser,
        isAuthenticated: !!token,
        isAdmin: user?.email.endsWith('@admin.com') || false,
        loading,
        token
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;