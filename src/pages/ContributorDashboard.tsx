import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader, AlertCircle, Plus } from 'lucide-react';
import { contributionService, type FoodItem, type AddFoodRequest } from '../services/contributionService';
import DashboardOverview from '../components/DashboardOverview';

const ContributorDashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AddFoodRequest>({
    foodId: '',
    name: '',
    description: '',
    quantity: 0,
    expirationDate: '',
    location: {
      latitude: 0,
      longitude: 0
    }
  });
  const [stats, setStats] = useState({
    totalContributions: 0,
    activeContributions: 0,
    completedContributions: 0
  });

  useEffect(() => {
    if (authLoading) return;

    // The ProtectedRoute already handles redirects based on user, profile completion, and verification.
    // If we reach here, it means the user is authenticated, profile completed, and verified.
    loadDashboardData();
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get overview data
      const overview = await contributionService.getDashboardOverview();
      console.log('Dashboard Overview Data:', overview);
      
      // Get recent contributions
      const contributions = await contributionService.getFoodItems('');
      
      setStats({
        totalContributions: overview.totalContributions || 0,
        activeContributions: overview.activeContributions || 0,
        completedContributions: overview.completedContributions || 0
      });
      
      setFoodItems(contributions || []);
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
      // Set default values in case of error
      setStats({
        totalContributions: 0,
        activeContributions: 0,
        completedContributions: 0
      });
      setFoodItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFoodItem = await contributionService.addFood(formData);
      // Removed direct state update to prevent race condition. Data will be refreshed by loadDashboardData().
      // setFoodItems(prev => [newFoodItem, ...prev]); 
      setIsModalOpen(false);
      setFormData({
        foodId: '',
        name: '',
        description: '',
        quantity: 0,
        expirationDate: '',
        location: {
          latitude: 0,
          longitude: 0
        }
      });
      // Refresh dashboard data
      loadDashboardData();
    } catch (error: any) {
      setError(error.message || 'Failed to add food item');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: parseFloat(value) || 0
        }
      }));
    } else if (name === 'quantity') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleStatusUpdate = async (foodItemId: string, newStatus: 'available' | 'accepted' | 'completed') => {
    try {
      await contributionService.updateStatus({
        contribution: foodItemId,
        status: newStatus
      });
      // Refresh dashboard data
      loadDashboardData();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contributor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Food Item
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DashboardOverview stats={stats} recentContributions={foodItems} />

        {/* Add Food Item Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl max-w-2xl w-full p-6"
              >
                <h3 className="text-xl font-semibold mb-4">Add New Food Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food ID
                    </label>
                    <input
                      type="text"
                      name="foodId"
                      value={formData.foodId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="datetime-local"
                      name="expirationDate"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.location.latitude}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.location.longitude}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                        step="any"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Add Food Item
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContributorDashboard; 