import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Heart, Users, BarChart, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-emerald-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center space-x-2">
              <Utensils className="h-8 w-8" />
              <span className="text-xl font-bold">Byte2Bite</span>
            </Link>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Navigation based on user role */}
                {user.role === 'donor' && (
                  <Link to="/donor" className="flex items-center space-x-1 hover:text-emerald-200">
                    <Heart className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                
                {user.role === 'ngo' && (
                  <Link to="/ngo" className="flex items-center space-x-1 hover:text-emerald-200">
                    <Users className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                )}

                <Link to="/impact" className="flex items-center space-x-1 hover:text-emerald-200">
                  <BarChart className="h-5 w-5" />
                  <span>Impact</span>
                </Link>

                {/* User info and logout */}
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-emerald-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <div className="text-sm">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-emerald-200 text-xs capitalize">{user.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:text-emerald-200 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/impact" className="flex items-center space-x-1 hover:text-emerald-200">
                  <BarChart className="h-5 w-5" />
                  <span>Impact</span>
                </Link>
                <Link 
                  to="/auth" 
                  className="bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;