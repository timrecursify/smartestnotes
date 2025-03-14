import { createContext, useState, useCallback, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../services/api';

// Create context
export const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    if (!token) return true;
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }, []);

  // Initialize auth state
  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if token exists in local storage
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && !isTokenExpired(storedToken)) {
        // Token is valid, set auth state
        setToken(storedToken);
        
        // Set authorization header for API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Get user info
        const response = await api.get('/user/profile');
        setUser(response.data);
      } else {
        // No token or expired token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, [isTokenExpired]);

  // Login with Telegram
  const loginWithTelegram = useCallback(async (telegramData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Attempting loginWithTelegram with data:', 
        JSON.stringify({
          ...telegramData,
          tg_init_data: telegramData.tg_init_data ? `${telegramData.tg_init_data.slice(0, 20)}...` : undefined
        })
      );
      
      const response = await api.post('/auth/telegram', telegramData);
      console.log('AuthContext: Login successful, received response:', JSON.stringify(response.data));
      
      const { token, user } = response.data;
      
      // Store token in local storage
      localStorage.setItem('token', token);
      
      // Set auth state
      setToken(token);
      setUser(user);
      
      // Set authorization header for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to log in with Telegram';
      console.error('AuthContext: Error logging in with Telegram:', errorMessage);
      
      // Log detailed error information
      if (error.response) {
        console.error('AuthContext: Error response data:', error.response.data);
        console.error('AuthContext: Error response status:', error.response.status);
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  }, []);

  // Provide auth context
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        isAuthenticated: !!token && !!user,
        loginWithTelegram,
        logout,
        initialize,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
