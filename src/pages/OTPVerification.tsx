import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { otpService } from '../services/otpService';
import { 
  Utensils, 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ArrowLeft,
  Shield,
  Clock,
  Smartphone
} from 'lucide-react';

export const OTPVerification: React.FC = () => {
  const { sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<string>('');

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const requestOTP = async () => {
    if (!email) return;
    
    try {
      setIsRequestingOTP(true);
      setError('');
      setMessage('');
      
      await sendOTP(email);
      setMessage('OTP sent successfully! Please check your email.');
      setCountdown(60); // Start countdown
      setOtp(Array(6).fill('')); // Clear existing OTP
    } catch (error: any) {
      console.error('Request OTP error:', error);
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      
      // If it's a rate limit error, set the countdown to 60 seconds
      if (errorMessage.includes('Rate limit exceeded') || errorMessage.includes('Service temporarily unavailable')) {
        setCountdown(60);
      } else {
        setCountdown(0); // Reset countdown on other errors
      }
    } finally {
      setIsRequestingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    if (!email) {
      setError('Email address not found. Please try logging in again.');
      navigate('/login');
      return;
    }
    await requestOTP();
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setMessage('');

      const result = await verifyOTP(email, otpString);
      
      if (result?.data?.user) {
        // Navigate based on user role
        const role = result.data.user.role.toLowerCase();
        switch (role) {
          case 'contributor':
            navigate('/contributor/dashboard', { replace: true });
            break;
          case 'ngo':
            navigate('/ngo/dashboard', { replace: true });
            break;
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      } else {
        throw new Error('No user data received after verification');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setOtp(Array(6).fill('')); // Clear OTP on error
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    handleVerification(e as unknown as React.FormEvent);
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the verification code sent to {email}
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
                    onPaste={handlePaste}
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

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Request new code in {formatTime(countdown)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isRequestingOTP}
                    className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequestingOTP ? 'Sending...' : 'Get OTP'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;