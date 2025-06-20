import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import ProfileCompletion from './pages/ProfileCompletion';
import ContributorDashboard from './pages/ContributorDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';
import ImpactTracking from './pages/ImpactTracking';
import OTPVerification from './pages/OTPVerification';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-otp" element={<OTPVerification />} />
              <Route 
                path="/complete-profile" 
                element={
                  <ProtectedRoute>
                    <ProfileCompletion />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/contributor" 
                element={
                  <ProtectedRoute allowedRoles={['contributor']}>
                    <ContributorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ngo" 
                element={
                  <ProtectedRoute allowedRoles={['ngo']}>
                    <NGODashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/impact" 
                element={
                  <ProtectedRoute>
                    <ImpactTracking />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </motion.div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;