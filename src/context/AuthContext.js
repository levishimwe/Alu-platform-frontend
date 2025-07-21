// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI, handleAPIError } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Check authentication status on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await userAPI.getProfile();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
const register = async (userData) => {
  try {
    setError(null);
    setIsLoading(true);
    
    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...backendData } = userData;
    
    console.log('🚀 Sending registration data:', backendData);
    
    const response = await authAPI.register(backendData);
    
    // Registration includes auto-login (backend returns token)
    if (response.data.token) {
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
    }
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Registration error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorInfo = handleAPIError(error);
    setError(errorInfo.message);
    return { success: false, error: errorInfo.message };
  } finally {
    setIsLoading(false);
  }
};

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await userAPI.updateProfile(profileData);
      setUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Clear error manually
  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,

    logout,
    updateProfile,
    
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};