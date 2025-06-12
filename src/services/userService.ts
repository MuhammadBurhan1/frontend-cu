import { apiClient, handleApiError } from '../utils/api';
import type { User, ProfileUpdateData } from '../types';

export interface UserFilters {
  role?: 'donor' | 'ngo';
  city?: string;
  state?: string;
  organizationType?: string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface ApiResponse<T> {
  data?: T;
  user?: T;
  message?: string;
}

export class UserService {
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      // Based on your backend route: PUT /api/v1/user/profile
      const response = await apiClient.put<User>('/user/profile', data);
      
      // Update stored user data
      const userData = response.data.data || response.data.user || response.data;
      localStorage.setItem('byte2bite_current_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadAvatar(file: File): Promise<User> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('accessToken');
      // Based on your backend route: POST /api/v1/user/upload/profile-picture
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://byte2bite-backend.onrender.com/api/v1'}/user/upload/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Avatar upload failed');
      }

      const data = await response.json();
      const userData = data.data || data.user || data;
      
      // Update stored user data
      localStorage.setItem('byte2bite_current_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      // Based on your backend route: GET /api/v1/user/profile
      const response = await apiClient.get<User>('/user/profile');
      const userData = response.data.data || response.data.user || response.data;
      return userData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async completeProfile(data: ProfileUpdateData): Promise<User> {
    try {
      // Based on your backend route: PUT /api/v1/user/profile
      const response = await apiClient.put<User>('/user/profile', data);
      
      // Update stored user data
      const userData = response.data.data || response.data.user || response.data;
      localStorage.setItem('byte2bite_current_user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async uploadCertificate(file: File): Promise<{ message: string }> {
    try {
      const formData = new FormData();
      formData.append('certificate', file);

      const token = localStorage.getItem('accessToken');
      // Based on your backend route: POST /api/v1/user/upload/certificate
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://byte2bite-backend.onrender.com/api/v1'}/user/upload/certificate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Certificate upload failed');
      }

      const data = await response.json();
      return { message: data.message || 'Certificate uploaded successfully' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getNotifications(): Promise<any[]> {
    try {
      // Based on your backend route: GET /api/v1/user/notifications
      const response = await apiClient.get('/user/notifications');
      return response.data.data || response.data.notifications || response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteAccount(): Promise<{ message: string }> {
    try {
      // Based on your backend route: DELETE /api/v1/user/del-account
      const response = await apiClient.delete<{ message: string }>('/user/del-account');
      
      // Clear local storage after deletion
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('byte2bite_current_user');
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getUserStats(): Promise<{
    totalContributions: number;
    totalMealsProvided: number;
    totalFoodSaved: number;
    impactScore: number;
    joinedDate: string;
  }> {
    try {
      // Based on your backend route: GET /api/v1/contributor/dashboard/overview
      const response = await apiClient.get('/contributor/dashboard/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateVerificationStatus(status: 'pending' | 'approved' | 'rejected'): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/user/verification-status', { status });
      const userData = response.data.data || response.data.user || response.data;
      if (!userData) {
        throw new Error('No user data received from server');
      }
      localStorage.setItem('byte2bite_current_user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const userService = new UserService();