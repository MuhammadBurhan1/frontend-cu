import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, BarChart, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Prepared Food',
    quantity: '',
    unit: 'meals',
    description: '',
    expiryTime: '',
    ngo: 'Food Bank NYC',
  });

  // List of available NGOs
  const availableNGOs = [
    'Food Bank NYC',
    'Helping Hands',
    'Community Kitchen',
    'Local Food Pantry',
    'Meals on Wheels',
  ];

  // Load all donations and update status
  useEffect(() => {
    const updateDonations = () => {
      const availableDonations = JSON.parse(localStorage.getItem('availableDonations') || '[]');
      const acceptedDonations = JSON.parse(localStorage.getItem('acceptedDonations') || '[]');

      // Filter donations by current user
      const userDonations = availableDonations.filter(donation => 
        donation.donorId === user?.id
      );

      // Combine and update donations with correct status
      const allDonations = userDonations.map(donation => {
        const isAccepted = acceptedDonations.some(ad => ad.id === donation.id);
        return {
          ...donation,
          status: isAccepted ? 'Accepted' : donation.status
        };
      });

      setDonations(allDonations);
    };

    // Initial update
    updateDonations();

    // Set up interval to check for updates
    const interval = setInterval(updateDonations, 2000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new donation object
    const newDonation = {
      id: Date.now(),
      type: formData.type,
      quantity: `${formData.quantity} ${formData.unit}`,
      status: 'Available',
      ngo: formData.ngo,
      date: new Date().toISOString().split('T')[0],
      donor: user?.name || 'Your Restaurant',
      donorId: user?.id,
      distance: '2.5 km',
      time: 'Just now',
      description: formData.description,
      expiryTime: formData.expiryTime,
    };

    // Add to local state
    setDonations([newDonation, ...donations]);

    // Add to localStorage for NGO dashboard to access
    const existingDonations = JSON.parse(localStorage.getItem('availableDonations') || '[]');
    localStorage.setItem('availableDonations', JSON.stringify([newDonation, ...existingDonations]));

    // Reset form and close modal
    setIsModalOpen(false);
    setFormData({
      type: 'Prepared Food',
      quantity: '',
      unit: 'meals',
      description: '',
      expiryTime: '',
      ngo: 'Food Bank NYC',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate statistics
  const availableDonations = donations.filter(d => d.status === 'Available').length;
  const acceptedDonations = donations.filter(d => d.status === 'Accepted').length;
  const totalMeals = donations.reduce((acc, curr) => {
    const quantity = parseInt(curr.quantity);
    return curr.quantity.includes('meals') ? acc + quantity : acc;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Donation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Available Donations</h3>
                <p className="text-2xl font-bold text-emerald-600">{availableDonations}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Total Impact</h3>
                <p className="text-2xl font-bold text-emerald-600">{totalMeals} meals</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Accepted Donations</h3>
                <p className="text-2xl font-bold text-emerald-600">{acceptedDonations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Donations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGO</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.ngo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        donation.status === 'Available' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : donation.status === 'Accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Donation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">New Donation</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    >
                      <option value="Prepared Food">Prepared Food</option>
                      <option value="Fresh Produce">Fresh Produce</option>
                      <option value="Packaged Food">Packaged Food</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      >
                        <option value="meals">Meals</option>
                        <option value="kg">Kilograms</option>
                        <option value="items">Items</option>
                        <option value="liters">Liters</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select NGO
                    </label>
                    <select
                      name="ngo"
                      value={formData.ngo}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    >
                      {availableNGOs.map((ngo) => (
                        <option key={ngo} value={ngo}>
                          {ngo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Describe the food items..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Best Before
                    </label>
                    <input
                      type="datetime-local"
                      name="expiryTime"
                      value={formData.expiryTime}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Submit Donation
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonorDashboard;