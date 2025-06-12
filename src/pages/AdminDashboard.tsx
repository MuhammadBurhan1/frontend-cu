import React, { useState, useEffect } from 'react';
import { Users, Building2, ShieldCheck, Activity, Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { adminService, type VerificationRequest } from '../services/adminService';

const AdminDashboard = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeNGOs: 0,
    pendingVerifications: 0,
    monthlyDonations: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [requests, dashboardStats] = await Promise.all([
        adminService.getVerificationRequests(),
        adminService.getDashboardStats()
      ]);
      setVerificationRequests(requests);
      setStats(dashboardStats);
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      setError('');
      setSuccess('');
      await adminService.updateVerificationStatus(requestId, status, reviewNotes);
      setSuccess(`Verification ${status} successfully`);
      setSelectedRequest(null);
      setReviewNotes('');
      loadDashboardData(); // Reload data
    } catch (error: any) {
      setError(error.message || `Failed to ${status} verification`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Total Users</h3>
                <p className="text-2xl font-bold text-emerald-600">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Active NGOs</h3>
                <p className="text-2xl font-bold text-emerald-600">{stats.activeNGOs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Pending Verifications</h3>
                <p className="text-2xl font-bold text-emerald-600">{stats.pendingVerifications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-emerald-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Monthly Donations</h3>
                <p className="text-2xl font-bold text-emerald-600">{stats.monthlyDonations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {verificationRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.user.organizationName || request.user.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.user.role.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        Object.keys(request.documents).length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {Object.keys(request.documents).length > 0 ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 mr-2"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Review Verification Request</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Organization/User Details</h4>
                <p className="text-gray-600">
                  Name: {selectedRequest.user.organizationName || selectedRequest.user.fullName}<br />
                  Email: {selectedRequest.user.email}<br />
                  Type: {selectedRequest.user.role.toUpperCase()}<br />
                  Submitted: {formatDate(selectedRequest.submittedAt)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Documents</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Object.entries(selectedRequest.documents).map(([key, value]) => (
                    value && (
                      <a
                        key={key}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 text-sm"
                      >
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </a>
                    )
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={4}
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerification(selectedRequest._id, 'rejected')}
                  className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 flex items-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleVerification(selectedRequest._id, 'approved')}
                  className="px-4 py-2 text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 flex items-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;