import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('donor' | 'ngo')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user hasn't completed profile and not already on profile completion page
  if (!user.profileCompleted && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // If user has completed profile but not verified, and not on OTP verification page
  if (user.profileCompleted && !user.isVerified && location.pathname !== '/otp-verification') {
    // Pass email to OTP verification page if available
    return <Navigate to="/otp-verification" state={{ email: user.email }} replace />;
  }

  // If user has completed profile AND is verified, and trying to access profile completion or OTP verification page
  if (user.profileCompleted && user.isVerified && 
      (location.pathname === '/complete-profile' || location.pathname === '/otp-verification')) {
    const redirectPath = user.role === 'donor' ? '/donor' : '/ngo';
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'donor' ? '/donor' : '/ngo';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;