import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('contributor' | 'ngo' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 1. Show loading state while auth context is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // 2. If no user is logged in, redirect to auth page
  if (!user) {
    if (location.pathname !== '/auth') { // Only navigate if not already on /auth
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>; // If already on /auth, render its children
  }

  // Determine the user's dashboard path
  const userDashboardPath = user.role === 'contributor'
    ? '/contributor'
    : (user.role === 'ngo' ? '/ngo' : '/admin');

  // 3. If user hasn't completed profile, redirect to profile completion page
  if (!user.profileCompleted) {
    if (location.pathname !== '/complete-profile') { // Only navigate if not already on /complete-profile
      return <Navigate to="/complete-profile" replace />;
    }
    return <>{children}</>; // If already on /complete-profile, render its children
  }

  // 4. If user's profile is completed but not verified, redirect to OTP verification page
  if (!user.isVerified) {
    if (location.pathname !== '/verify-otp') { // Only navigate if not already on /verify-otp
      return <Navigate to="/verify-otp" replace />;
    }
    return <>{children}</>; // If already on /verify-otp, render its children
  }

  // 5. If user is fully onboarded and trying to access an onboarding path (e.g., /complete-profile, /verify-otp)
  if (location.pathname === '/complete-profile' || location.pathname === '/verify-otp') {
    return <Navigate to={userDashboardPath} replace />;
  }

  // 6. Check role-based access for the current route
  // If allowedRoles are specified and the user's role is not included
  // And they are not already on their appropriate dashboard path (this is important to avoid endless redirects)
  if (allowedRoles && !allowedRoles.includes(user.role as any) && location.pathname !== userDashboardPath) {
    return <Navigate to={userDashboardPath} replace />;
  }

  // 7. If all checks pass and no redirection is needed, render the children component
  return <>{children}</>;
};

export default ProtectedRoute;