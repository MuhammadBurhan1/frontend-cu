import { apiClient, handleApiError } from '../utils/api';
import type { User } from '../types';

export interface OTPRequest {
  email: string;
  method: 'email' | 'sms';
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface OTPResponse {
  message: string;
  success: boolean;
}

export interface VerificationResponse {
  message: string;
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken?: string;
  };
}

export class OTPService {
  async sendOTP(data: OTPRequest): Promise<OTPResponse> {
    try {
      // Based on your backend route: GET /api/v1/verify/otp
      // Note: Your backend requires authentication for OTP, which might need adjustment
      const response = await apiClient.get('/verify/otp', {
        params: {
          method: data.method
        }
      });

      const responseData = response.data;
      return {
        message: responseData.message || 'OTP sent successfully',
        success: true
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw new Error(handleApiError(error));
    }
  }

  async verifyOTP(data: OTPVerification): Promise<VerificationResponse> {
    try {
      // Based on your backend route: POST /api/v1/verify/otp
      const response = await apiClient.post('/verify/otp', {
        otp: data.otp
      });

      const responseData = response.data;
      
      // Handle different response formats
      let user, accessToken, refreshToken;
      
      if (responseData.data) {
        user = responseData.data.user;
        accessToken = responseData.data.accessToken || responseData.data.token;
        refreshToken = responseData.data.refreshToken;
      } else {
        user = responseData.user;
        accessToken = responseData.accessToken || responseData.token;
        refreshToken = responseData.refreshToken;
      }

      return {
        message: responseData.message || 'OTP verified successfully',
        success: true,
        data: user && accessToken ? {
          user,
          accessToken,
          refreshToken
        } : undefined
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(handleApiError(error));
    }
  }
}

export const otpService = new OTPService();