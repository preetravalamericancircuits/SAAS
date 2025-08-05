import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create axios instance with optimized defaults
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for performance monitoring
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with error handling and caching
api.interceptors.response.use(
  (response) => {
    const endTime = new Date();
    const duration = endTime.getTime() - response.config.metadata?.startTime.getTime();
    
    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Optimized API methods
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => 
    api.get<T>(url, config).then(res => res.data),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post<T>(url, data, config).then(res => res.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put<T>(url, data, config).then(res => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T>(url, config).then(res => res.data),
};

export default api;