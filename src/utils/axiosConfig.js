import axios from 'axios';

// Global response interceptor for default axios instance to handle 401 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authUser');
      localStorage.removeItem('authTokens');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_type');
      
      // Notify other components about auth change
      window.dispatchEvent(new Event('auth-changed'));
      
      // Show alert message
      alert('Your session has expired. Please login again.');
      
      // Redirect to home/login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && !currentPath.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Create axios instance with base URL (optional, for future use)
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
});

// Request interceptor to add auth token to instance
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for instance (same as global)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authUser');
      localStorage.removeItem('authTokens');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_type');
      
      // Notify other components about auth change
      window.dispatchEvent(new Event('auth-changed'));
      
      // Show alert message
      alert('Your session has expired. Please login again.');
      
      // Redirect to home/login page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && !currentPath.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { axios };
