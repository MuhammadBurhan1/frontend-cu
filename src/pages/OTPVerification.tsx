import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { otpService } from '../services/otpService';

export const OTPVerification: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Countdown timer effect
  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleGetOTP = async () => {
    if (!user?.email) return;

    try {
      setIsSendingOTP(true);
      setError('');
      setMessage('');

      const response = await otpService.sendOTP({
        email: user.email,
        method: 'email'
      });

      if (response.success) {
        setMessage('OTP sent successfully! Please check your email.');
        setCountdown(60); // Start 60-second countdown
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      // Use the actual OTP verification service
      const response = await otpService.verifyOTP({
        email: user.email,
        otp: otpString
      });

      // Check if verification was successful
      if (response.success) {
        // Update user data with verification status and new tokens
        const updatedUser = {
          ...user,
          isVerified: true,
          verificationStatus: 'verified',
          verifiedAt: new Date().toISOString()
        };

        // Update user in context and localStorage
        updateUser(updatedUser);
        localStorage.setItem('byte2bite_current_user', JSON.stringify(updatedUser));

        // Store new tokens if provided
        if (response.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
        }
        if (response.data?.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }

        setMessage('Verification successful! Redirecting...');

        // Navigate based on user role
        const role = user.role?.toLowerCase();
        switch (role) {
          case 'contributor':
            navigate('/contributor', { replace: true });
            break;
          case 'ngo':
            navigate('/ngo', { replace: true });
            break;
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      } else {
        setError(response.message || 'Verification failed');
        setOtp(Array(6).fill('')); // Clear OTP on error
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setOtp(Array(6).fill('')); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      const formEvent = new Event('submit') as unknown as React.FormEvent;
      handleVerification(formEvent);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the 6-digit code sent to your email ({user?.email})
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-3 rounded-md bg-green-50 text-green-700 text-sm">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleVerification}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter Verification Code
              </label>
              <div className="mt-1 flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    name={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading || otp.some(digit => !digit)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={handleGetOTP}
                disabled={isSendingOTP || countdown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Get OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;