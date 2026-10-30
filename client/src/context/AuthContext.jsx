import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response?.data?.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // Not authenticated or session expired - guest state
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  /**
   * Authenticate user with credentials
   */
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const authenticatedUser = response?.data?.user;
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new student account
   */
  const register = async (studentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', studentData);
      const newUser = response?.data?.user;
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out user and clear auth cookies
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
    }
  };

  /**
   * Reload current user profile data
   */
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
