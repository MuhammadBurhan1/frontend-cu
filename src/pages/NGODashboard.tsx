import React, { useState, useEffect } from 'react';
import { Box, Users, Map, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NGODashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [acceptedDonations, setAcceptedDonations] = useState([]);
  const [totalPeopleServed, setTotalPeopleServed] = useState(0);

  // Load available and accepted donations from localStorage
  useEffect(() => {
    const loadDonations = () => {
      const storedDonations = JSON.parse(localStorage.getItem('availableDonations') || '[]');
      const storedAcceptedDonations = JSON.parse(localStorage.getItem('acceptedDonations') || '[]');
      
      // Filter out donations that have been accepted and only show available ones
      const availableDonations = storedDonations.filter(donation => 
        donation.status === 'Available' && 
        !storedAcceptedDonations.some(accepted => accepted.id === donation.id)
      );
      
      // Filter accepted donations by current NGO user
      const ngoAcceptedDonations = storedAcceptedDonations.filter(donation => 
        donation.acceptedBy === user?.id
      );
      
      setDonations(availableDonations);
      setAcceptedDonations(ngoAcceptedDonations);

      // Calculate total people served (assuming 1 meal = 1 person)
      const totalMeals = ngoAcceptedDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        return curr.quantity.includes('meals') ? acc + quantity : acc;
      }, 0);
      setTotalPeopleServed(totalMeals);
    };

    // Initial load
    loadDonations();

    // Set up interval to check for new donations
    const interval = setInterval(loadDonations, 2000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleAcceptDonation = (donationId) => {
    // Find the donation to accept
    const donationToAccept = donations.find(d => d.id === donationId);
    if (!donationToAccept) return;

    // Update the donation status
    const updatedDonation = { 
      ...donationToAccept, 
      status: 'Accepted',
      date: new Date().toISOString().split('T')[0], // Add acceptance date
      acceptedBy: user?.id,
      acceptedByName: user?.organizationName || user?.name
    };

    // Update accepted donations in state and localStorage
    const existingAcceptedDonations = JSON.parse(localStorage.getItem('acceptedDonations') || '[]');
    const newAcceptedDonations = [updatedDonation, ...existingAcceptedDonations];
    setAcceptedDonations([updatedDonation, ...acceptedDonations]);
    localStorage.setItem('acceptedDonations', JSON.stringify(newAcceptedDonations));

    // Update the status in availableDonations as well
    const availableDonations = JSON.parse(localStorage.getItem('availableDonations') || '[]');
    const updatedAvailableDonations = availableDonations.map(d => 
      d.id === donationId ? { ...d, status: 'Accepted' } : d
    );
    localStorage.setItem('availableDonations', JSON.stringify(updatedAvailableDonations));

    // Remove from available donations in state
    setDonations(prevDonations => prevDonations.filter(d => d.id !== donationId));

    // Update total people served if the donation is in meals
    if (donationToAccept.quantity.includes('meals')) {
      const mealCount = parseInt(donationToAccept.quantity);
      setTotalPeopleServed(prev => prev + mealCount);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome, {user?.organizationName || user?.name}!</p>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            {donations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {donations.length}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Box className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Available Donations</h3>
                <p className="text-2xl font-bold text-emerald-600">{donations.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">People Served</h3>
                <p className="text-2xl font-bold text-emerald-600">{totalPeopleServed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Map className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Service Area</h3>
                <p className="text-2xl font-bold text-emerald-600">10 km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Donations */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Donations Nearby</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.distance}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => handleAcceptDonation(donation.id)}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm hover:bg-emerald-200 transition-colors"
                      >
                        Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accepted Donations */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Accepted Donations</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {acceptedDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.donor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donation.distance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {donation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;