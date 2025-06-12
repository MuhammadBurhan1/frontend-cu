import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Utensils, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Shield,
  Key
} from 'lucide-react';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  // If there's a reset token in URL, go directly to reset step
  React.useEffect(() => {
    if (resetToken) {
      setStep('reset');
    }
  }, [resetToken]);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      await authService.forgotPassword(email);
      setSuccess('Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.');
      
    } catch (error: any) {
      setError(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!newPassword.trim()) {
        setError('Please enter a new password');
        return;
      }

      if (!validatePassword(newPassword)) {
        setError('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!resetToken) {
        setError('Invalid reset token. Please request a new password reset.');
        return;
      }

      await authService.resetPassword(resetToken, newPassword);
      setSuccess('Your password has been reset successfully! You can now sign in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/auth', { 
          state: { 
            message: 'Password reset successful! Please sign in with your new password.',
            email 
          } 
        });
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
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
                {step === 'request' ? (
                  <Mail className="h-8 w-8" />
                ) : (
                  <Key className="h-8 w-8" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {step === 'request' ? 'Reset Password' : 'Create New Password'}
            </h2>
            <p className="text-emerald-100">
              {step === 'request' 
                ? 'Enter your email to receive reset instructions'
                : 'Enter your new password below'
              }
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute -top-5 -left-5 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'request' ? (
            /* Request Reset Form */
            <form onSubmit={handleRequestReset}>
              <div className="mb-6">
                <div className="text-center mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Enter the email address associated with your account and we'll send you 
                      instructions to reset your password.
                    </p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your email address"
                    required
                  />
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Sending Instructions...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword}>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Shield className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-700">Secure Password Reset</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Create a strong password to protect your account
                    </p>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Password Strength:</div>
                    <div className="space-y-1">
                      <div className={`flex items-center text-xs ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        At least 8 characters
                      </div>
                      <div className={`flex items-center text-xs ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One uppercase letter
                      </div>
                      <div className={`flex items-center text-xs ${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One lowercase letter
                      </div>
                      <div className={`flex items-center text-xs ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        One number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start mt-6"
                >
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-start mt-6"
                >
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

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

          {/* Security Note */}
          <div className="mt-6 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-xs font-medium text-gray-700">Security Notice</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {step === 'request' 
                  ? 'Reset links expire after 24 hours for your security. If you don\'t receive an email, check your spam folder.'
                  : 'Your new password will be encrypted and stored securely. Make sure to use a unique password you haven\'t used elsewhere.'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;