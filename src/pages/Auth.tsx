import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Utensils, 
  Eye, 
  EyeOff, 
  User, 
  Building2, 
  AlertCircle, 
  Loader, 
  CheckCircle,
  Mail,
  Lock,
  Phone,
  FileText,
  Globe,
  MapPin,
  Shield,
  Send
} from 'lucide-react';
import type { LoginCredentials, RegisterData } from '../types';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'donor' | 'ngo'>('donor');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login, register, sendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for messages from navigation state
  React.useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Basic validation
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (!isLogin && !validatePassword(formData.password)) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (isLogin) {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password,
        };
        
        try {
          const user = await login(credentials);
          setIsRedirecting(true);
          
          // Check if profile is completed
          if (!user.profileCompleted) {
            // Redirect to profile completion page
            navigate('/complete-profile');
          } else {
            // Redirect to appropriate dashboard based on role
            const redirectPath = user.role === 'contributor' ? '/contributor' : '/ngo';
            navigate(redirectPath);
          }
        } catch (loginError: any) {
          setError(loginError.message || 'Login failed. Please check your credentials.');
        }
      } else {
        const registerData: RegisterData = {
          email: formData.email,
          password: formData.password,
        };

        try {
          const result = await register(registerData);
          setSuccess('Account created successfully! Please log in.');
          setIsLogin(true);
        } catch (registerError: any) {
          setError(registerError.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
    });
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      {isRedirecting ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting you to your dashboard...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 p-12 flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <Utensils className="h-12 w-12 text-white mr-4" />
                <span className="text-4xl font-bold text-white">Byte2Bite</span>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-6">
                {isLogin ? 'Welcome Back!' : 'Join Our Mission'}
              </h2>
              
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                {isLogin 
                  ? 'Continue your journey in reducing food waste and making a positive impact on communities worldwide.'
                  : 'Be part of the solution to food waste. Connect, share, and make a difference in your community.'
                }
              </p>

              {/* Feature highlights */}
              <div className="space-y-4">
                <div className="flex items-center text-emerald-100">
                  <Shield className="w-5 h-5 mr-3 text-emerald-300" />
                  <span>Secure & Verified Platform</span>
                </div>
                <div className="flex items-center text-emerald-100">
                  <MapPin className="w-5 h-5 mr-3 text-emerald-300" />
                  <span>Local Community Impact</span>
                </div>
                <div className="flex items-center text-emerald-100">
                  <Globe className="w-5 h-5 mr-3 text-emerald-300" />
                  <span>Environmental Sustainability</span>
                </div>
                {!isLogin && (
                  <div className="flex items-center text-emerald-100">
                    <Send className="w-5 h-5 mr-3 text-emerald-300" />
                    <span>Instant Email Verification</span>
                  </div>
                )}
              </div>

              {/* Background decoration */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Mobile header */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <Utensils className="h-8 w-8 text-emerald-600 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">Byte2Bite</span>
                </div>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                </h1>
                <p className="text-gray-600">
                  {isLogin 
                    ? 'Enter your credentials to access your account'
                    : 'Fill in your information to get started'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Enter your password"
                          required
                          minLength={isLogin ? 1 : 6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {!isLogin && (
                        <p className="text-xs text-gray-500 mt-2">
                          Password must be at least 6 characters long
                        </p>
                      )}
                    </div>

                    {/* Forgot Password Link */}
                    {isLogin && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Forgot your password?
                        </button>
                      </div>
                    )}

                    {/* Error/Success message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start"
                      >
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-start"
                      >
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{success}</span>
                      </motion.div>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
                    >
                      {isLoading ? (
                        <>
                          <Loader className="animate-spin h-5 w-5 mr-2" />
                          {isLogin ? 'Signing In...' : 'Creating Account...'}
                        </>
                      ) : (
                        <>
                          {isLogin ? (
                            'Sign In'
                          ) : (
                            'Create Account'
                          )}
                        </>
                      )}
                    </button>
                  </motion.div>
                </AnimatePresence>

                {/* Toggle between login/signup */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;