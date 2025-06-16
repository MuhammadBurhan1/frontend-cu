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

// Rate limiting helper
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // Maximum requests per window
let requestCount = 0;
let lastRequestTime = 0;

export class OTPService {
  private checkRateLimit(): boolean {
    const now = Date.now();
    if (now - lastRequestTime > RATE_LIMIT_WINDOW) {
      // Reset counter if window has passed
      requestCount = 0;
      lastRequestTime = now;
    }
    
    if (requestCount >= MAX_REQUESTS) {
      return false; // Rate limit exceeded
    }
    
    requestCount++;
    return true;
  }

  async sendOTP(data: OTPRequest, currentRetry = 0): Promise<OTPResponse> {
    const MAX_SEND_OTP_RETRIES = 2; // Max retries for 503 errors

    try {
      if (!this.checkRateLimit()) {
        throw new Error('Rate limit exceeded. Please wait 1 minute before requesting another OTP.');
      }

      // Using Axios's proper way of sending GET parameters
      const response = await apiClient.get('/verify/otp', {
        params: {
          method: 'email'
        }
      });

      const responseData = response.data;
      return {
        message: responseData.message || 'OTP sent successfully',
        success: true
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 60;
        const waitTime = parseInt(retryAfter, 10);
        const minutes = Math.ceil(waitTime / 60);
        throw new Error(`Too many requests. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`);
      } else if (error.response?.status === 503) {
        if (currentRetry < MAX_SEND_OTP_RETRIES) {
          console.warn(`Server not ready (503). Retrying sendOTP in 3 seconds... (Attempt ${currentRetry + 1}/${MAX_SEND_OTP_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return this.sendOTP(data, currentRetry + 1); // Recursive retry
        } else {
          throw new Error('OTP service is currently unavailable after multiple retries. Please try again later.');
        }
      } else if (error.response?.status === 404) {
        throw new Error('The OTP service endpoint is not available. Please contact support.');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  async verifyOTP(data: OTPVerification): Promise<VerificationResponse> {
    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(data.otp)) {
        throw new Error('OTP must be a 6-digit number');
      }

      // Using POST method for verifying OTP to /verify/otp with otp in x-www-form-urlencoded body
      const response = await apiClient.post(
        '/verify/otp',
        new URLSearchParams({
          otp: data.otp
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

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
      
      // Handle specific error cases
      if (error.response?.status === 503) {
        throw new Error('Service temporarily unavailable. Please try again in a few moments.');
      }
      
      throw new Error(handleApiError(error));
    }
  }
}

export const otpService = new OTPService();