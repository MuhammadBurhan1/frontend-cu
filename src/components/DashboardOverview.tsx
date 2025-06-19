import React from 'react';
import { Package, Users, CheckCircle, TrendingUp, Clock, MapPin } from 'lucide-react';
import type { FoodItem } from '../services/contributionService';

interface DashboardOverviewProps {
  stats: {
    totalContributions: number;
    activeContributions: number;
    completedContributions: number;
  };
  recentContributions: FoodItem[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, recentContributions = [] }) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Package className="w-8 h-8 text-emerald-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Total Contributions</h3>
              <p className="text-2xl font-bold text-emerald-600">{stats.totalContributions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-emerald-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Active Contributions</h3>
              <p className="text-2xl font-bold text-emerald-600">{stats.activeContributions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold text-emerald-600">{stats.completedContributions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentContributions && recentContributions.length > 0 ? (
            recentContributions.map((contribution) => (
              <div key={contribution._id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{contribution.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{contribution.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Expires: {new Date(contribution.expirationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>
                            {contribution.location.latitude.toFixed(4)}, {contribution.location.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      contribution.status === 'available' ? 'bg-green-100 text-green-800' :
                      contribution.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {contribution.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent contributions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 