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
  Heart,
  FileCheck
} from 'lucide-react';
import type { ProfileData } from '../types';

interface FormData {
  role: 'contributor' | 'ngo';
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
  ngoSpecific?: {
    ngoDetails: {
      registrationNumber: string;
      ntnNumber: string;
      certificateURL: string;
    };
  };
}

const ProfileCompletion: React.FC = () => {
  const { user, completeProfile, uploadProfilePicture, uploadCertificate } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>('');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    role: (user?.role === 'ngo' ? 'ngo' : 'contributor') as 'contributor' | 'ngo',
    basicInfo: {
      name: user?.organizationName || user?.fullName || '',
      profilePicture: user?.avatar || '',
      contact: user?.phone || '',
      alternateContact: '',
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
    },
    ngoSpecific: user?.role === 'ngo' ? {
      ngoDetails: {
        registrationNumber: '',
        ntnNumber: '',
        certificateURL: ''
      }
    } : undefined
  });

  const handleRoleChange = (role: 'contributor' | 'ngo') => {
    setFormData(prev => ({
      ...prev,
      role,
      ngoSpecific: role === 'ngo' ? {
        ngoDetails: {
          registrationNumber: '',
          ntnNumber: '',
          certificateURL: ''
        }
      } : undefined
    }));
  };

  const handleInputChange = <T extends keyof FormData>(
    section: T,
    field: keyof FormData[T],
    value: FormData[T][keyof FormData[T]]
  ) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (section === 'ngoSpecific' && prev.ngoSpecific) {
        newData.ngoSpecific = {
          ...prev.ngoSpecific,
          ngoDetails: {
            ...prev.ngoSpecific.ngoDetails,
            [field as keyof typeof prev.ngoSpecific.ngoDetails]: value
          }
        };
      } else {
        const sectionData = { ...(prev[section] as Record<string, unknown>) };
        sectionData[field as string] = value;
        newData[section] = sectionData as FormData[T];
      }
      return newData;
    });
    setError('');
  };

  const handleNgoDetailsChange = (
    field: keyof NonNullable<FormData['ngoSpecific']>['ngoDetails'],
    value: string
  ) => {
    if (formData.ngoSpecific) {
      setFormData(prev => ({
        ...prev,
        ngoSpecific: {
          ...prev.ngoSpecific!,
          ngoDetails: {
            ...prev.ngoSpecific!.ngoDetails,
            [field]: value
          }
        }
      }));
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Certificate size should be less than 5MB');
        return;
      }
      setCertificate(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificatePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let profilePictureUrl = formData.basicInfo.profilePicture;
      let certificateUrl = formData.ngoSpecific?.ngoDetails.certificateURL;

      if (profilePicture) {
        const response = await uploadProfilePicture(profilePicture);
        profilePictureUrl = response.url;
      }

      if (certificate && formData.role === 'ngo') {
        const response = await uploadCertificate(certificate);
        certificateUrl = response.url;
      }

      const profileData: ProfileData = {
        role: formData.role,
        basicInfo: {
          ...formData.basicInfo,
          profilePicture: profilePictureUrl
        },
        address: formData.address,
        additionalDetails: formData.additionalDetails,
        ngoSpecific: formData.role === 'ngo' ? {
          ngoDetails: {
            ...formData.ngoSpecific!.ngoDetails,
            certificateURL: certificateUrl || ''
          }
        } : undefined
      };

      await completeProfile(profileData);
      // Redirect to OTP verification page
      navigate('/verify-otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="mt-2 text-gray-600">Tell us more about yourself to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Select Your Role</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('contributor')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'contributor'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Heart className={`w-6 h-6 ${
                      formData.role === 'contributor' ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">Contributor</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('ngo')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'ngo'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Users className={`w-6 h-6 ${
                      formData.role === 'ngo' ? 'text-emerald-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">NGO</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.name}
                    onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Profile Picture
                  </label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture-upload"
                    />
                    <label
                      htmlFor="profile-picture-upload"
                      className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 transition-all duration-200"
                    >
                      <div className="text-center">
                        <User className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {profilePicture ? 'Change Picture' : 'Upload Profile Picture'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {profilePicture ? profilePicture.name : 'PNG, JPG up to 5MB'}
                        </p>
                      </div>
                    </label>
                  </div>
                  {profilePicturePreview && (
                    <div className="mt-4">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.basicInfo.contact}
                    onChange={(e) => handleInputChange('basicInfo', 'contact', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your contact number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Alternate Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.basicInfo.alternateContact}
                    onChange={(e) => handleInputChange('basicInfo', 'alternateContact', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter alternate contact number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Address Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address', 'country', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your country"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your state/province"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your ZIP/postal code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Full Address *
                  </label>
                  <textarea
                    value={formData.address.fullAddress}
                    onChange={(e) => handleInputChange('address', 'fullAddress', e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    placeholder="Enter your full address"
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Additional Details</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800">
                  Description
                </label>
                <textarea
                  value={formData.additionalDetails.description}
                  onChange={(e) => handleInputChange('additionalDetails', 'description', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                  placeholder="Tell us about yourself or your organization"
                  rows={4}
                />
              </div>
            </div>

            {/* NGO Details Section */}
            {formData.role === 'ngo' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">NGO Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      value={formData.ngoSpecific?.ngoDetails.registrationNumber || ''}
                      onChange={(e) => handleNgoDetailsChange('registrationNumber', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your NGO registration number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      NTN Number *
                    </label>
                    <input
                      type="text"
                      value={formData.ngoSpecific?.ngoDetails.ntnNumber || ''}
                      onChange={(e) => handleNgoDetailsChange('ntnNumber', e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter your NTN number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Certificate *
                    </label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleCertificateChange}
                        className="hidden"
                        id="certificate-upload"
                      />
                      <label
                        htmlFor="certificate-upload"
                        className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 transition-all duration-200"
                      >
                        <div className="text-center">
                          <FileCheck className="w-8 h-8 mx-auto text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            {certificate ? 'Change Certificate' : 'Upload NGO Certificate'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {certificate ? certificate.name : 'PDF, DOC up to 5MB'}
                          </p>
                        </div>
                      </label>
                    </div>
                    {certificatePreview && (
                      <div className="mt-4">
                        <a
                          href={certificatePreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700"
                        >
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Completing Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;