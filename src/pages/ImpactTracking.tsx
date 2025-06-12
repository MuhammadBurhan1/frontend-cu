import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Leaf, Users, Scale, TrendingUp, Calendar, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';

const ImpactTracking = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedChart, setSelectedChart] = useState('all');
  const [impactStats, setImpactStats] = useState({
    foodSaved: 0,
    peopleFed: 0,
    co2Reduced: 0,
    monthlyGrowth: '0%'
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [foodTypeData, setFoodTypeData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [ngoDistribution, setNgoDistribution] = useState([]);

  useEffect(() => {
    const updateImpactData = () => {
      const acceptedDonations = JSON.parse(localStorage.getItem('acceptedDonations') || '[]');
      const availableDonations = JSON.parse(localStorage.getItem('availableDonations') || '[]');
      const allDonations = [...acceptedDonations, ...availableDonations];

      // Filter donations based on time range
      const now = new Date();
      const filteredDonations = acceptedDonations.filter(donation => {
        const donationDate = new Date(donation.date);
        const diffTime = Math.abs(now - donationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (timeRange) {
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'year':
            return diffDays <= 365;
          default:
            return true;
        }
      });

      // Calculate total meals and kg for filtered donations
      const totalMeals = filteredDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        return curr.quantity.includes('meals') ? acc + quantity : acc;
      }, 0);

      const totalKg = filteredDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        return curr.quantity.includes('kg') ? acc + quantity : acc;
      }, 0);

      // Calculate growth rate
      const previousPeriodStart = new Date(now);
      const currentPeriodStart = new Date(now);
      
      switch (timeRange) {
        case 'week':
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
          currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
          break;
        case 'month':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
          currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
          break;
        case 'year':
          previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 2);
          currentPeriodStart.setFullYear(currentPeriodStart.getFullYear() - 1);
          break;
      }

      const currentPeriodDonations = acceptedDonations.filter(donation => {
        const donationDate = new Date(donation.date);
        return donationDate >= currentPeriodStart && donationDate <= now;
      });

      const previousPeriodDonations = acceptedDonations.filter(donation => {
        const donationDate = new Date(donation.date);
        return donationDate >= previousPeriodStart && donationDate < currentPeriodStart;
      });

      const currentValue = currentPeriodDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        return curr.quantity.includes('kg') ? acc + quantity : acc + (quantity * 0.5); // Convert meals to approximate kg
      }, 0);

      const previousValue = previousPeriodDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        return curr.quantity.includes('kg') ? acc + quantity : acc + (quantity * 0.5); // Convert meals to approximate kg
      }, 0);

      const growthRate = previousValue === 0 
        ? currentValue > 0 ? '100' : '0'
        : ((currentValue - previousValue) / previousValue * 100).toFixed(1);

      // Update impact stats
      setImpactStats({
        foodSaved: totalKg,
        peopleFed: totalMeals,
        co2Reduced: Math.round(totalKg * 2.5), // Approximate CO2 reduction based on food waste
        monthlyGrowth: `${growthRate}%`
      });

      // Update food type distribution for filtered donations
      const typeCount = filteredDonations.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});

      setFoodTypeData(Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      })));

      // Update top contributors for filtered donations
      const donorCount = filteredDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        const value = curr.quantity.includes('kg') ? quantity : quantity * 0.5;
        acc[curr.donor] = (acc[curr.donor] || 0) + value;
        return acc;
      }, {});

      setTopContributors(
        Object.entries(donorCount)
          .map(([name, donations]) => ({ name, donations }))
          .sort((a, b) => b.donations - a.donations)
          .slice(0, 5)
      );

      // Update NGO distribution for filtered donations
      const ngoCount = filteredDonations.reduce((acc, curr) => {
        const quantity = parseInt(curr.quantity);
        acc[curr.ngo] = (acc[curr.ngo] || 0) + quantity;
        return acc;
      }, {});

      setNgoDistribution(
        Object.entries(ngoCount)
          .map(([name, meals]) => ({ name, meals }))
          .sort((a, b) => b.meals - a.meals)
          .slice(0, 5)
      );

      // Group data by appropriate time intervals based on selected range
      const groupData = () => {
        const groups = {};
        
        filteredDonations.forEach(donation => {
          const date = new Date(donation.date);
          let key;
          
          switch (timeRange) {
            case 'week':
              key = date.toLocaleDateString('en-US', { weekday: 'short' });
              break;
            case 'month':
              key = date.toLocaleDateString('en-US', { day: 'numeric' });
              break;
            case 'year':
              key = date.toLocaleDateString('en-US', { month: 'short' });
              break;
            default:
              key = date.toLocaleDateString('en-US', { month: 'short' });
          }

          if (!groups[key]) {
            groups[key] = { meals: 0, waste: 0 };
          }

          const quantity = parseInt(donation.quantity);
          if (donation.quantity.includes('meals')) {
            groups[key].meals += quantity;
          } else if (donation.quantity.includes('kg')) {
            groups[key].waste += quantity;
          }
        });

        return Object.entries(groups).map(([key, data]) => ({
          period: key,
          ...data
        }));
      };

      setMonthlyData(groupData());
    };

    // Initial update
    updateImpactData();

    // Set up interval to update data
    const interval = setInterval(updateImpactData, 2000);

    return () => clearInterval(interval);
  }, [timeRange]); // Add timeRange as dependency

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7'];

  const renderTimeRangeButton = (range: string, label: string) => (
    <button
      onClick={() => setTimeRange(range)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        timeRange === range
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  const renderChartTypeButton = (type: string, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setSelectedChart(type)}
      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        selectedChart === type || selectedChart === 'all'
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Impact Tracking</h1>
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
              {renderTimeRangeButton('week', 'Week')}
              {renderTimeRangeButton('month', 'Month')}
              {renderTimeRangeButton('year', 'Year')}
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-emerald-50 p-3 rounded-full">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Food Saved</h3>
                  <p className="text-2xl font-bold text-emerald-600">{impactStats.foodSaved} kg</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-emerald-50 p-3 rounded-full">
                  <Users className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">People Fed</h3>
                  <p className="text-2xl font-bold text-emerald-600">{impactStats.peopleFed}+</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-emerald-50 p-3 rounded-full">
                  <Scale className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">CO₂ Reduced</h3>
                  <p className="text-2xl font-bold text-emerald-600">{impactStats.co2Reduced} kg</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center">
                <div className="bg-emerald-50 p-3 rounded-full">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Growth Rate</h3>
                  <p className="text-2xl font-bold text-emerald-600">{impactStats.monthlyGrowth}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Chart Type Selection */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedChart('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedChart === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Charts
            </button>
            {renderChartTypeButton('progress', 'Progress', <Calendar className="w-4 h-4" />)}
            {renderChartTypeButton('distribution', 'Distribution', <PieChartIcon className="w-4 h-4" />)}
            {renderChartTypeButton('contributors', 'Contributors', <BarChartIcon className="w-4 h-4" />)}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(selectedChart === 'all' || selectedChart === 'progress') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold mb-6">
                  {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Progress
                </h2>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="meals" stroke="#059669" strokeWidth={2} dot={{ fill: '#059669' }} name="Meals Provided" />
                      <Line type="monotone" dataKey="waste" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626' }} name="Waste Reduced (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {(selectedChart === 'all' || selectedChart === 'distribution') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold mb-6">Food Type Distribution</h2>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={foodTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {foodTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {(selectedChart === 'all' || selectedChart === 'contributors') && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">Top Contributors</h2>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer>
                      <BarChart data={topContributors}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="donations" fill="#059669" radius={[4, 4, 0, 0]} name="Total Donations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <h2 className="text-xl font-semibold mb-6">NGO Distribution</h2>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer>
                      <BarChart data={ngoDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="meals" fill="#059669" radius={[4, 4, 0, 0]} name="Meals Distributed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ImpactTracking;