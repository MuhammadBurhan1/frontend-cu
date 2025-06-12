import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Camera,
  Mail,
  Clock,
  Shield,
  Star,
  Award,
  Save,
  ArrowRight,
  ArrowLeft,
  Info,
  Target,
  Users,
  Heart
} from 'lucide-react';

interface ProfileData {
  role?: string;
  basicInfo: {
    name: string;
    profilePicture: string;
    contact: string;
    alternateContact: string;
  };
  address: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    fullAddress: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  additionalDetails: {
    description: string;
  };
}

interface FormData {
  basicInfo: {
    name: string;
    profilePicture: string;
    contact: string;
    alternateContact: string;
    role: string;
  };
  address: {
    country: string;
    state: string;
    city: string;
    zipCode: string;
    fullAddress: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  additionalDetails: {
    description: string;
    servingAreas: string[];
    operatingHours: {
      [key: string]: {
        open: string;
        close: string;
        closed: boolean;
      };
    };
  };
}

const ProfileCompletion = () => {
  const { user, completeProfile, uploadProfilePicture } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      name: user?.organizationName || user?.fullName || '',
      profilePicture: user?.avatar || '',
      contact: user?.phone || '',
      alternateContact: '',
      role: user?.role || 'donor'
    },
    address: {
      country: 'Pakistan',
      state: '',
      city: '',
      zipCode: '',
      fullAddress: '',
      coordinates: {
        latitude: 0,
        longitude: 0
      }
    },
    additionalDetails: {
      description: '',
      servingAreas: [],
      operatingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '09:00', close: '17:00', closed: true },
      }
    }
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalSteps = 3;

  const handleInputChange = <T extends keyof FormData, K extends keyof FormData[T]>(
    section: T,
    field: K,
    value: FormData[T][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setError('');
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...prev[section as keyof typeof prev][subsection as keyof any],
          [field]: value
        }
      }
    }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.basicInfo.name.trim()) {
          setError('Name is required');
          return false;
        }
        if (!formData.basicInfo.contact.trim()) {
          setError('Contact number is required');
          return false;
        }
        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(formData.basicInfo.contact.replace(/\s/g, ''))) {
          setError('Please enter a valid phone number');
          return false;
        }
        break;
      case 2:
        if (!formData.address.state.trim()) {
          setError('State is required');
          return false;
        }
        if (!formData.address.city.trim()) {
          setError('City is required');
          return false;
        }
        if (!formData.address.fullAddress.trim()) {
          setError('Full address is required');
          return false;
        }
        break;
      case 3:
        if (!formData.additionalDetails.description.trim()) {
          setError('Description is required');
          return false;
        }
        if (formData.additionalDetails.description.length < 50) {
          setError('Description must be at least 50 characters long');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    setError('');

    try {
      // Upload profile picture first if selected
      let profilePictureUrl = formData.basicInfo.profilePicture;
      if (profilePicture) {
        const uploadResult = await uploadProfilePicture(profilePicture);
        profilePictureUrl = uploadResult.profilePictureUrl;
      }

      // Prepare profile data according to API structure
      const profileData: ProfileData = {
        role: formData.basicInfo.role,
        basicInfo: {
          name: formData.basicInfo.name,
          profilePicture: profilePictureUrl,
          contact: formData.basicInfo.contact,
          alternateContact: formData.basicInfo.alternateContact
        },
        address: {
          country: formData.address.country,
          state: formData.address.state,
          city: formData.address.city,
          zipCode: formData.address.zipCode,
          fullAddress: formData.address.fullAddress,
          coordinates: formData.address.coordinates
        },
        additionalDetails: {
          description: formData.additionalDetails.description
        }
      };

      // Call the complete profile API
      const updatedUser = await completeProfile(profileData);
      
      setSuccess('Profile completed successfully! Redirecting to your dashboard...');
      
      // Redirect to the appropriate dashboard based on the updated user's role
      const redirectPath = updatedUser.role === 'donor' ? '/donor' : '/ngo';
      navigate(redirectPath, { replace: true });

    } catch (error: any) {
      console.error('Profile completion error:', error);
      setError(error.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-6 h-6" />;
      case 2: return <MapPin className="w-6 h-6" />;
      case 3: return <FileText className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Location Details';
      case 3: return 'Additional Information';
      default: return 'Basic Information';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Tell us about yourself and how to reach you';
      case 2: return 'Help us connect you with nearby partners';
      case 3: return 'Share your mission and build trust';
      default: return '';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-500">
                  {profilePicturePreview || formData.basicInfo.profilePicture ? (
                    <img
                      src={profilePicturePreview || formData.basicInfo.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 bg-emerald-500 text-white p-2 rounded-full cursor-pointer hover:bg-emerald-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a professional photo (max 5MB)
                </p>
                <div className="flex items-center justify-center text-xs text-gray-500">
                  <Info className="w-4 h-4 mr-1" />
                  JPG, PNG, or GIF formats supported
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Select Your Role *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('basicInfo', 'role', 'donor')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.basicInfo.role === 'donor'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Heart className={`w-6 h-6 ${
                      formData.basicInfo.role === 'donor' ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">Donor</span>
                    <p className="text-xs text-center text-gray-500">
                      I want to donate food and make a difference
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('basicInfo', 'role', 'ngo')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.basicInfo.role === 'ngo'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Users className={`w-6 h-6 ${
                      formData.basicInfo.role === 'ngo' ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">NGO</span>
                    <p className="text-xs text-center text-gray-500">
                      I represent an organization that helps distribute food
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                {formData.basicInfo.role === 'ngo' ? 'Organization Name' : 'Full Name'} *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.basicInfo.name}
                  onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                  placeholder={formData.basicInfo.role === 'ngo' ? 'Enter organization name' : 'Enter your full name'}
                  required
                />
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Primary Contact Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.basicInfo.contact}
                    onChange={(e) => handleInputChange('basicInfo', 'contact', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                    placeholder="Enter your contact number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Alternate Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.basicInfo.alternateContact}
                    onChange={(e) => handleInputChange('basicInfo', 'alternateContact', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                    placeholder="Enter alternate contact number (optional)"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Country and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Country *
                </label>
                <select
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  State/Province *
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="e.g., Punjab, Sindh, KPK"
                  required
                />
              </div>
            </div>

            {/* City and ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="e.g., Lahore, Karachi, Islamabad"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="54000"
                />
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Complete Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.address.fullAddress}
                  onChange={(e) => handleInputChange('address', 'fullAddress', e.target.value)}
                  rows={4}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                  placeholder="Enter complete address including street, area, landmarks, and any special instructions for finding your location..."
                  required
                />
              </div>
            </div>

            {/* Location benefits */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 rounded-xl p-6">
              <div className="flex items-start">
                <Target className="w-6 h-6 text-emerald-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-emerald-900 mb-2">Location Benefits</h4>
                  <p className="text-emerald-700 leading-relaxed mb-3">
                    Accurate location information helps us connect you with nearby {formData.basicInfo.role === 'donor' ? 'NGOs' : 'food donors'} 
                    for faster and more efficient food distribution.
                  </p>
                  <ul className="text-sm text-emerald-600 space-y-1">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Faster pickup and delivery coordination
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Reduced transportation costs and time
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Better matching with local partners
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                {formData.basicInfo.role === 'ngo' ? 'Organization Description' : 'Business Description'} *
              </label>
              <textarea
                value={formData.additionalDetails.description}
                onChange={(e) => handleInputChange('additionalDetails', 'description', e.target.value)}
                rows={6}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                placeholder={formData.basicInfo.role === 'ngo' 
                  ? 'Describe your organization, mission, and the communities you serve. Include information about your programs, target beneficiaries, impact areas, and how you distribute food to those in need...'
                  : 'Describe your business, type of food you typically donate, and your commitment to reducing food waste. Include details about your operation hours, food safety practices, and why you want to contribute to this cause...'
                }
                required
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Minimum 50 characters required for a meaningful description
                </p>
                <p className={`text-xs font-medium ${formData.additionalDetails.description.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.additionalDetails.description.length}/50
                </p>
              </div>
            </div>

            {/* Service Areas for NGOs - Keep UI but don't send to API */}
            {formData.basicInfo.role === 'ngo' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Service Areas
                </label>
                <input
                  type="text"
                  placeholder="Enter areas you serve (press Enter to add)"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !formData.additionalDetails.servingAreas.includes(value)) {
                        handleInputChange('additionalDetails', 'servingAreas', [...formData.additionalDetails.servingAreas, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.additionalDetails.servingAreas.map((area, index) => (
                    <span key={index} className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm flex items-center font-medium">
                      <MapPin className="w-3 h-3 mr-1" />
                      {area}
                      <button
                        type="button"
                        onClick={() => {
                          const newAreas = formData.additionalDetails.servingAreas.filter((_, i) => i !== index);
                          handleInputChange('additionalDetails', 'servingAreas', newAreas);
                        }}
                        className="ml-2 text-emerald-500 hover:text-emerald-700 font-bold text-lg"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Profile completion benefits */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-xl p-6">
              <div className="flex items-start">
                <Award className="w-6 h-6 text-purple-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 mb-3">Complete Profile Benefits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center text-purple-700">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm">Higher visibility in search results</span>
                    </div>
                    <div className="flex items-center text-purple-700">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm">Build trust with detailed information</span>
                    </div>
                    <div className="flex items-center text-purple-700">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm">Better matching with {formData.basicInfo.role === 'donor' ? 'NGOs' : 'donors'}</span>
                    </div>
                    <div className="flex items-center text-purple-700">
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      <span className="text-sm">Increased donation opportunities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-600 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                {formData.basicInfo.role === 'ngo' ? (
                  <Building2 className="h-10 w-10" />
                ) : (
                  <User className="h-10 w-10" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-3">Complete Your Profile</h1>
            <p className="text-emerald-100 text-center mb-8 text-lg">
              Help us create the perfect profile for your {formData.basicInfo.role === 'ngo' ? 'organization' : 'business'}
            </p>
            
            {/* Progress Steps */}
            <div className="flex justify-center items-center space-x-8 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-white text-emerald-600 shadow-lg' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {step < currentStep ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      getStepIcon(step)
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${step <= currentStep ? 'text-white' : 'text-emerald-200'}`}>
                      {getStepTitle(step)}
                    </div>
                    <div className="text-xs text-emerald-200 mt-1 max-w-24">
                      {getStepDescription(step)}
                    </div>
                  </div>
                  {step < 3 && (
                    <div className={`hidden md:block absolute w-16 h-1 mt-6 transition-all duration-300 ${
                      step < currentStep ? 'bg-white' : 'bg-white/20'
                    }`} style={{ left: `${step * 33.33}%`, transform: 'translateX(-50%)' }} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 mb-4 backdrop-blur-sm">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            
            <div className="text-center">
              <p className="text-emerald-100 text-sm">
                Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-10 w-6 h-6 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-4 h-4 bg-white/30 rounded-full"></div>
        </div>

        {/* Form Content */}
        <div className="p-8 lg:p-12">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>

          {/* Error/Success Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl text-sm flex items-start mt-8"
            >
              <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-xl text-sm flex items-start mt-8"
            >
              <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Takes about 5 minutes</span>
            </div>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Need help?</strong> Your profile information helps us connect you with the right partners. 
                All information is secure and will only be shared with verified {formData.basicInfo.role === 'donor' ? 'NGOs' : 'food donors'} 
                for coordination purposes.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCompletion;