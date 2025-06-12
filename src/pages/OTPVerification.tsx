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

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);

  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state
  const email = location.state?.email || '';
  const userRole = location.state?.role || 'donor';

  useEffect(() => {
    if (!email) {
      navigate('/auth');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    
    if (otpToVerify.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await otpService.verifyOTP({
        email,
        otp: otpToVerify
      });

      if (response.success) {
        setSuccess('Email verified successfully! Redirecting...');
        
        // If verification returns user data and tokens, update auth state
        if (response.data) {
          const { user, accessToken, refreshToken } = response.data;
          
          // Store tokens
          localStorage.setItem('accessToken', accessToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          localStorage.setItem('byte2bite_current_user', JSON.stringify(user));
          
          // Update auth context
          updateUser(user);
          
          // Redirect to appropriate dashboard or profile completion
          setTimeout(() => {
            if (user.profileCompleted) {
              const redirectPath = user.role === 'donor' ? '/donor' : '/ngo';
              navigate(redirectPath);
            } else {
              navigate('/complete-profile');
            }
          }, 2000);
        } else {
          // If no user data returned, redirect to login
          setTimeout(() => {
            navigate('/auth', { 
              state: { 
                message: 'Email verified successfully! Please log in to continue.',
                email 
              } 
            });
          }, 2000);
        }
      }
    } catch (error: any) {
      setError(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await otpService.sendOTP({
        email,
        method: 'email'
      });

      setSuccess('Verification code sent successfully!');
      setTimeLeft(300); // Reset timer
      setCanResend(false);
      setOtp(['', '', '', '', '', '']); // Clear current OTP

      // Restart countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      setError(error.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-3 rounded-full">
                <Mail className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
            <p className="text-emerald-100">
              We've sent a 6-digit verification code to your email address
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute -top-5 -left-5 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Email Display */}
          <div className="text-center mb-8">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Smartphone className="w-5 h-5 text-emerald-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Verification code sent to:</span>
              </div>
              <p className="font-semibold text-gray-900 break-all">{email}</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              Enter 6-digit verification code
            </label>
            <div className="flex justify-center space-x-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  disabled={isLoading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              You can paste the code directly into any field
            </p>
          </div>

          {/* Timer and Status */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-600">
                  Code expires in: <span className="font-semibold text-emerald-600">{formatTime(timeLeft)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-600 font-medium">
                  Verification code has expired
                </p>
              )}
            </div>
            
            {/* Security note */}
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              <span>Your information is secure and encrypted</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start mb-6"
            >
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-start mb-6"
            >
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleVerifyOTP()}
              disabled={isLoading || otp.some(digit => digit === '')}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={!canResend || isResending}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isResending ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Back to Auth */}
          <div className="mt-8 text-center">
            <button
              onClick={handleBackToAuth}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center justify-center mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Didn't receive the code?</strong><br />
                Check your spam/junk folder or try resending the code. 
                Make sure the email address is correct.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;