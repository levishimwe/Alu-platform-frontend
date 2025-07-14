// === src/context/AuthContext.js ===
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI, tokenManager, handleAPIError } from '../services/api';

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
    const token = tokenManager.getToken();
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearTokens();
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
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      tokenManager.setTokens(token, refreshToken);
      
      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      // If registration includes auto-login (backend returns token)
      if (response.data.token) {
        const { token, refreshToken, user } = response.data;
        tokenManager.setTokens(token, refreshToken);
        setUser(user);
        setIsAuthenticated(true);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Google OAuth login
  const googleLogin = async (googleToken) => {
    try {
      setError(null);
      const response = await authAPI.googleAuth(googleToken);
      const { token, refreshToken, user } = response.data;
      
      tokenManager.setTokens(token, refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // LinkedIn OAuth login
  const linkedinLogin = async (linkedinToken) => {
    try {
      setError(null);
      const response = await authAPI.linkedinAuth(linkedinToken);
      const { token, refreshToken, user } = response.data;
      
      tokenManager.setTokens(token, refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true, user };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await userAPI.updateProfile(profileData);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Upload profile avatar
  const uploadAvatar = async (file) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await userAPI.uploadAvatar(formData);
      setUser(prev => ({ ...prev, profileImage: response.data.imageUrl }));
      return { success: true, imageUrl: response.data.imageUrl };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Upload ALU degree (for graduates)
  const uploadDegree = async (file) => {
    try {
      setError(null);
      const formData = new FormData();
      formData.append('degree', file);
      
      const response = await userAPI.uploadDegree(formData);
      setUser(prev => ({ ...prev, aluDegreeDocument: response.data.documentUrl }));
      return { success: true, documentUrl: response.data.documentUrl };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      setError(null);
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      await authAPI.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      return { success: false, error: errorInfo.message };
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    try {
      setError(null);
      await authAPI.verifyEmail(token);
      return { success: true };
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
    googleLogin,
    linkedinLogin,
    logout,
    updateProfile,
    uploadAvatar,
    uploadDegree,
    forgotPassword,
    resetPassword,
    verifyEmail,
    clearError,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );};
