import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { emailService } from './emailService';

// Mock user data storage
const USERS_KEY = 'byte2bite_users';
const CURRENT_USER_KEY = 'byte2bite_current_user';

// Helper functions for localStorage
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateToken = (): string => {
  return 'mock_token_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(500); // Simulate network delay

    const users = getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email address before logging in. Check your email for a verification link to activate your account.');
    }

    // In a real app, you'd hash and compare passwords
    // For this mock, we'll just check if password matches stored password
    if (user.password !== credentials.password) {
      throw new Error('Invalid password');
    }

    const tokens = {
      accessToken: generateToken(),
      refreshToken: generateToken(),
    };

    // Store tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    // Remove password from returned user object
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  }

  async register(data: RegisterData): Promise<{ user?: User; tokens?: AuthTokens; requiresVerification: boolean }> {
    await delay(500); // Simulate network delay

    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User with this email already exists');
    }

    // Generate verification code for email (even though we're using link-based verification)
    const verificationCode = generateVerificationCode();
    
    // Create new user (unverified)
    const newUser: User & { password: string } = {
      _id: generateId(),
      fullName: data.fullName,
      email: data.email,
      password: data.password, // In real app, this would be hashed
      role: data.role,
      isEmailVerified: false, // Start as unverified
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(data.role === 'ngo' && {
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        registrationNumber: data.registrationNumber,
        contactPerson: data.contactPerson,
        phone: data.phone,
      }),
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Send verification email using the email service
    // This simulates sending a verification link (even though we log a code for development)
    try {
      await emailService.sendVerificationEmail(data.email, data.fullName, verificationCode);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email sending fails
    }

    // Return without tokens - user needs to verify via email link
    return {
      requiresVerification: true,
    };
  }

  async logout(): Promise<void> {
    await delay(200); // Simulate network delay
    
    // Clear tokens and current user
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  async getCurrentUser(): Promise<User> {
    await delay(200); // Simulate network delay

    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentUser) {
      throw new Error('No current user found');
    }

    const user = JSON.parse(currentUser);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async refreshToken(): Promise<AuthTokens> {
    await delay(200); // Simulate network delay

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokens = {
      accessToken: generateToken(),
      refreshToken: generateToken(),
    };

    // Store new tokens
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(email: string): Promise<void> {
    await delay(500); // Simulate network delay
    
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = generateToken();
    
    try {
      await emailService.sendPasswordResetEmail(email, user.fullName, resetToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email. Please try again.');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await delay(500); // Simulate network delay
    console.log(`Mock: Password reset for token ${token}`);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export const mockAuthService = new MockAuthService();