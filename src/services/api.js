import axios from 'axios';

/**
 * API service configured to communicate with the Notes 2.0 backend
 */
const api = axios.create({
  // API base URL - will be switched to the actual domain in production
  baseURL: import.meta.env.VITE_API_URL || 'https://api.smartestnotes.com',
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization header if token exists in local storage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration and refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Update authorization header and retry the request
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token failure - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    telegram: '/auth/telegram',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  
  // User endpoints
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
    premium: '/user/premium',
  },
  
  // Notes endpoints
  notes: {
    list: '/notes',
    detail: (id) => `/notes/${id}`,
    create: '/notes',
    update: (id) => `/notes/${id}`,
    delete: (id) => `/notes/${id}`,
    search: '/notes/search',
    enrich: (id) => `/notes/${id}/enrich`,
  },
};

export default api;
