import axios from 'axios';

// Use the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://byte2bite-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for deployed backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-tokens`, {
            refreshToken: refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
          
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('byte2bite_current_user');
      
      // Only redirect if not already on auth page
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    // Handle validation errors
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((err: any) => err.message || err).join(', ');
    }
    
    // Default status-based messages
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. Resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${status}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection and try again.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

// Helper function for file uploads
export const uploadFile = async (endpoint: string, formData: FormData): Promise<any> => {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(handleApiError(error));
  }
};

export default apiClient;