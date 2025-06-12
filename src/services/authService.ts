import { apiClient, handleApiError } from '../utils/api';
import type { User, AuthTokens, LoginCredentials, RegisterData, ProfileUpdateData, ProfileData, UploadResponse, ProfileResponse } from '../types';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface VerificationResponse {
  message: string;
  user?: User;
  accessToken?: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const responseData = response.data;
      
      const user = responseData.user || responseData.data?.user;
      const accessToken = responseData.accessToken || responseData.data?.accessToken;
      const refreshToken = responseData.refreshToken || responseData.data?.refreshToken;

      if (!user || !accessToken) {
        throw new Error('Invalid response from server');
      }

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('byte2bite_current_user', JSON.stringify(user));

      return {
        user,
        accessToken,
        refreshToken: refreshToken || ''
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(handleApiError(error));
    }
  }

  async register(data: RegisterData): Promise<{ user?: User; tokens?: AuthTokens; message?: string }> {
    try {
      const requestData = {
        email: data.email,
        password: data.password,
      };

      const response = await apiClient.post('/auth/register', requestData);
      const responseData = response.data;
      
      if (responseData.user || responseData.data?.user) {
        const user = responseData.user || responseData.data?.user;
        const accessToken = responseData.accessToken || responseData.data?.accessToken;
        const refreshToken = responseData.refreshToken || responseData.data?.refreshToken;
        
        if (accessToken) {
          // Store tokens
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('byte2bite_current_user', JSON.stringify(user));

          return {
            user,
            tokens: {
              accessToken,
              refreshToken: refreshToken || '',
            },
          };
        }
      }

      throw new Error('Registration failed. Please try again.');
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(handleApiError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint if available
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          await apiClient.post('/auth/logout', {
            refreshToken: refreshToken
          });
        } catch (error) {
          // Continue with local logout even if API call fails
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('byte2bite_current_user');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // First try to get from localStorage
      const storedUser = localStorage.getItem('byte2bite_current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Verify token is still valid by making an API call
        try {
          const token = localStorage.getItem('accessToken');
          if (token) {
            const response = await apiClient.get('/user/profile');
            const updatedUser = response.data.data || response.data.user || response.data;
            
            // Update stored user if API returns updated data
            localStorage.setItem('byte2bite_current_user', JSON.stringify(updatedUser));
            return updatedUser;
          }
        } catch (error) {
          // If API call fails but we have stored user, return stored user
          console.warn('Failed to fetch updated user data:', error);
        }
        
        return user;
      }
      
      throw new Error('No current user found');
    } catch (error) {
      // Clear invalid tokens
      this.clearAuthData();
      throw new Error('Please log in again');
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh-tokens', {
        refreshToken: refreshToken,
      });

      const data = response.data;
      const accessToken = data.accessToken || data.data?.accessToken;
      const newRefreshToken = data.refreshToken || data.data?.refreshToken;
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      // Store new tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      return {
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
      };
    } catch (error: any) {
      // Clear invalid tokens
      this.clearAuthData();
      throw new Error(handleApiError(error));
    }
  }

  async completeProfile(profileData: ProfileData): Promise<User> {
    try {
      console.log('Sending profile data:', profileData); // Debug log
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Complete profile failed:', error);
      if (error.response) {
        console.error('Error response:', error.response.data); // Debug log
      }
      throw error;
    }
  }

  async uploadProfilePicture(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await apiClient.post('/user/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Profile picture upload failed:', error);
      throw error;
    }
  }

  async uploadCertificate(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const response = await apiClient.post('/user/upload/certificate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('Certificate upload failed:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete('/user/del-account');
      return response.data;
    } catch (error: any) {
      console.error('Delete account failed:', error);
      throw error;
    }
  }

  async getDashboardOverview(): Promise<any> {
    try {
      const response = await apiClient.get('/contributor/dashboard/overview');
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Get dashboard overview error:', error);
      throw new Error(handleApiError(error));
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/req-reset-password', { email });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error: any) {
      throw new Error(handleApiError(error));
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      // Basic token validation
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('byte2bite_current_user');
  }
}

export const authService = new AuthService();