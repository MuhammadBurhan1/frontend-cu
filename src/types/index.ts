// Type definitions for the application

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'donor' | 'ngo';
  avatar?: string;
  isEmailVerified: boolean;
  organizationName?: string;
  organizationType?: string;
  registrationNumber?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  notificationSettings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    contributionAlerts: boolean;
    weeklyDigest: boolean;
  };
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profileCompleted: boolean;
  isVerified: boolean;
}

export interface FoodItem {
  _id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  description?: string;
  images?: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  allergens?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Contribution {
  _id: string;
  donor: User;
  foodItems: FoodItem[];
  pickupLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  availableFrom: string;
  availableUntil: string;
  status: 'available' | 'reserved' | 'picked_up' | 'completed' | 'cancelled' | 'expired';
  specialInstructions?: string;
  estimatedMeals: number;
  acceptedBy?: User;
  acceptedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: {
    score: number;
    comment?: string;
    ratedBy: string;
    ratedAt: string;
  };
  images?: string[];
  tags?: string[];
  isUrgent?: boolean;
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'both';
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: 'contribution_available' | 'contribution_accepted' | 'contribution_completed' | 'contribution_cancelled' | 'verification_approved' | 'verification_rejected' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedContribution?: string;
  relatedUser?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  readAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: 'donor' | 'ngo';
  organizationName?: string;
  organizationType?: string;
  registrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  description?: string;
}

export interface ContributionFormData {
  foodItems: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>[];
  pickupLocation: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  availableFrom: string;
  availableUntil: string;
  specialInstructions?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    preferredContactMethod: 'phone' | 'email' | 'both';
  };
  isUrgent?: boolean;
  tags?: string[];
}

export interface ProfileUpdateData {
  fullName?: string;
  organizationName?: string;
  organizationType?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  website?: string;
  description?: string;
  role?: 'donor' | 'ngo';
}

export interface ApiFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Analytics and Statistics Types
export interface ContributionStats {
  totalContributions: number;
  totalMealsProvided: number;
  totalFoodSaved: number; // in kg
  co2Reduced: number; // in kg
  activeContributions: number;
  completedContributions: number;
}

export interface UserStats {
  totalContributions: number;
  totalMealsProvided: number;
  totalFoodSaved: number;
  impactScore: number;
  joinedDate: string;
  lastActivity: string;
}

export interface AnalyticsData {
  chartData: Array<{
    period: string;
    contributions: number;
    meals: number;
    foodSaved: number;
  }>;
  topContributors: Array<{
    name: string;
    contributions: number;
    meals: number;
  }>;
  foodTypeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  geographicDistribution: Array<{
    city: string;
    state: string;
    contributions: number;
    meals: number;
  }>;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  success: false;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Location Types
export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// File Upload Types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  location?: {
    city?: string;
    state?: string;
    radius?: number; // in km
  };
  dateRange?: {
    from: string;
    to: string;
  };
  foodType?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isUrgent?: boolean;
}