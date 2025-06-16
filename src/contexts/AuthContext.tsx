import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { otpService, type VerificationResponse } from '../services/otpService';
import type { User, LoginCredentials, RegisterData, ProfileData, UploadResponse, ProfileResponse } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  completeProfile: (profileData: ProfileData) => Promise<{ user: User; redirectPath: string }>;
  uploadProfilePicture: (file: File) => Promise<UploadResponse>;
  uploadCertificate: (file: File) => Promise<UploadResponse>;
  getProfile: () => Promise<ProfileResponse>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
  getDashboardOverview: () => Promise<any>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<VerificationResponse>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Move useAuth hook to a separate function to ensure consistent exports
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('byte2bite_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      setIsLoading(true);
      const result = await authService.login(credentials);
      setUser(result.user);
      localStorage.setItem('byte2bite_current_user', JSON.stringify(result.user));
      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const result = await authService.register(data);
      
      if (result.user) {
        setUser(result.user);
        localStorage.setItem('byte2bite_current_user', JSON.stringify(result.user));
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Log the full error details for debugging
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
  };

  const completeProfile = async (profileData: ProfileData): Promise<{ user: User; redirectPath: string }> => {
    try {
      const { user: updatedUser, redirectPath } = await authService.completeProfile(profileData);
      // Add profileCompleted flag to the user object
      const userWithProfileCompleted = { ...updatedUser, profileCompleted: true };
      setUser(userWithProfileCompleted);
      localStorage.setItem('byte2bite_current_user', JSON.stringify(userWithProfileCompleted));
      return { user: userWithProfileCompleted, redirectPath };
    } catch (error) {
      console.error('Complete profile failed:', error);
      throw error;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<UploadResponse> => {
    try {
      setIsLoading(true);
      const result = await authService.uploadProfilePicture(file);
      if (user) {
        const updatedUser = { ...user, avatar: result.url };
        setUser(updatedUser);
        localStorage.setItem('byte2bite_current_user', JSON.stringify(updatedUser));
      }
      return result;
    } catch (error) {
      console.error('Upload profile picture failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCertificate = async (file: File): Promise<UploadResponse> => {
    try {
      setIsLoading(true);
      return await authService.uploadCertificate(file);
    } catch (error) {
      console.error('Upload certificate failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async (): Promise<ProfileResponse> => {
    try {
      setIsLoading(true);
      return await authService.getProfile();
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      const result = await authService.deleteAccount();
      setUser(null);
      return result;
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardOverview = async (): Promise<any> => {
    try {
      return await authService.getDashboardOverview();
    } catch (error) {
      console.error('Get dashboard overview failed:', error);
      throw error;
    }
  };

  const sendOTP = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      await otpService.sendOTP({ email, method: 'email' });
    } catch (error: any) {
      console.error('Send OTP failed:', error);
      setError(error.message || 'Failed to send OTP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<VerificationResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await otpService.verifyOTP({ email, otp });
      
      if (result.data) {
        setUser(result.data.user);
        localStorage.setItem('accessToken', result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        localStorage.setItem('byte2bite_current_user', JSON.stringify(result.data.user));
      } else {
        throw new Error('No user data received after verification');
      }
      
      return result;
    } catch (error: any) {
      console.error('Verify OTP failed:', error);
      setError(error.message || 'Failed to verify OTP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    completeProfile,
    uploadProfilePicture,
    uploadCertificate,
    getProfile,
    deleteAccount,
    getDashboardOverview,
    sendOTP,
    verifyOTP,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth as a named export
export { useAuth };