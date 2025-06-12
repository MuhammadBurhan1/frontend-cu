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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName: '',
    organizationType: '',
    registrationNumber: '',
    contactPerson: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
          await login(credentials);
          
          // Redirect based on role after successful login
          const user = JSON.parse(localStorage.getItem('byte2bite_current_user') || '{}');
          if (user.profileCompleted) {
            const redirectPath = user.role === 'donor' ? '/donor' : '/ngo';
            navigate(redirectPath);
          } else {
            navigate('/complete-profile');
          }
        } catch (loginError: any) {
          // Handle specific login errors
          if (loginError.message.includes('verify') || loginError.message.includes('email')) {
            setError('Your email address is not verified yet. Please check your email for a verification code to activate your account before logging in.');
          } else {
            setError(loginError.message || 'Login failed. Please check your credentials.');
          }
        }
      } else {
        // Validation for registration
        if (!formData.fullName.trim()) {
          setError('Full name is required');
          return;
        }

        if (role === 'ngo') {
          if (!formData.organizationName.trim()) {
            setError('Organization name is required for NGOs');
            return;
          }
        }

        const registerData: RegisterData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'ngo' && {
            organizationName: formData.organizationName,
            organizationType: formData.organizationType,
            registrationNumber: formData.registrationNumber,
            contactPerson: formData.contactPerson,
            phone: formData.phone,
          }),
        };

        try {
          // Step 1: Register the user
          const result = await register(registerData);
          
          if (result.requiresVerification) {
            // Step 2: Send OTP to the registered email
            try {
              await sendOTP(formData.email);
              
              // Show success message and redirect to OTP verification
              setSuccess('Account created successfully! Sending verification code to your email...');
              
              setTimeout(() => {
                navigate('/verify-otp', { 
                  state: { 
                    email: formData.email,
                    role: role,
                    message: 'Please check your email for a verification code to activate your account.'
                  } 
                });
              }, 2000);
              
            } catch (otpError: any) {
              console.error('OTP sending failed:', otpError);
              // Even if OTP fails, still redirect to verification page
              navigate('/verify-otp', { 
                state: { 
                  email: formData.email,
                  role: role,
                  message: 'Account created! Please check your email for a verification code. If you don\'t receive it, you can request a new one.'
                } 
              });
            }
          } else if (result.user) {
            // If no verification required, redirect to profile completion or dashboard
            if (result.user.profileCompleted) {
              const redirectPath = role === 'donor' ? '/donor' : '/ngo';
              navigate(redirectPath);
            } else {
              navigate('/complete-profile');
            }
          }
        } catch (registerError: any) {
          setError(registerError.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      fullName: '',
      email: '',
      password: '',
      organizationName: '',
      organizationType: '',
      registrationNumber: '',
      contactPerson: '',
      phone: ''
    });
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
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
              {!isLogin && (
                <div className="mt-3 flex items-center justify-center text-sm text-emerald-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>We'll send a verification code to your email</span>
                </div>
              )}
            </div>

            {/* Role Selection for Registration */}
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('donor')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      role === 'donor'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">Food Donor</div>
                    <div className="text-xs mt-1">Restaurant, Cafe, Business</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ngo')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      role === 'ngo'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">NGO</div>
                    <div className="text-xs mt-1">Non-Profit Organization</div>
                  </button>
                </div>
              </div>
            )}

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
                  {/* Full Name field for signup */}
                  {!isLogin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Organization fields for NGO signup */}
                  {!isLogin && role === 'ngo' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="Enter organization name"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organization Type
                          </label>
                          <select
                            name="organizationType"
                            value={formData.organizationType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                          >
                            <option value="">Select type</option>
                            <option value="food_bank">Food Bank</option>
                            <option value="shelter">Shelter</option>
                            <option value="community_kitchen">Community Kitchen</option>
                            <option value="charity">Charity</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Registration Number
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              name="registrationNumber"
                              value={formData.registrationNumber}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="e.g., 1234/2021"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contact Person
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="text"
                              name="contactPerson"
                              value={formData.contactPerson}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="Contact person"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="Phone number"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

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
                    {!isLogin && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Send className="w-3 h-3 mr-1" />
                        We'll send a verification code to this email
                      </p>
                    )}
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

                  {/* Email Verification Notice for Registration */}
                  {!isLogin && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Email Verification Required</h4>
                          <p className="text-sm text-blue-700">
                            After creating your account, we'll automatically send a verification code to your email. 
                            You'll need to verify your email before you can start using the platform.
                          </p>
                        </div>
                      </div>
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
                        {isLogin ? 'Signing In...' : 'Creating Account & Sending Code...'}
                      </>
                    ) : (
                      <>
                        {isLogin ? (
                          'Sign In'
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Create Account & Send Code
                          </>
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
    </div>
  );
};

export default Auth;