import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token and restore auth state
  const validateAndRestoreAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate token by making a protected API call
      const response = await apiService.request('/protected');
      
      if (response) {
        setIsAuthenticated(true);
        setUser(response.user || { username: 'user' });
      } else {
        // Invalid response, clear auth
        localStorage.removeItem('access_token');
        apiService.removeToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.log('Token validation failed:', error);
      // Clear invalid token
      localStorage.removeItem('access_token');
      apiService.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    validateAndRestoreAuth();
  }, [validateAndRestoreAuth]);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      setIsAuthenticated(true);
      setUser(response.user || { username });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    apiService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    validateAndRestoreAuth
  };
};

export default useAuth;