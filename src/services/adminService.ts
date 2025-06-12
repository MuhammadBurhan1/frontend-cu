import { apiClient, handleApiError } from '../utils/api';
import type { User } from '../types';

export interface VerificationRequest {
  _id: string;
  user: User;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: {
    registrationCertificate?: string;
    taxExemptionCertificate?: string;
    identityProof?: string;
    addressProof?: string;
  };
  reviewNotes?: string;
}

export class AdminService {
  async getVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const response = await apiClient.get<{ data: VerificationRequest[] }>('/admin/verification-requests');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateVerificationStatus(requestId: string, status: 'approved' | 'rejected', reviewNotes?: string): Promise<VerificationRequest> {
    try {
      const response = await apiClient.patch<{ data: VerificationRequest }>(`/admin/verification-requests/${requestId}`, {
        status,
        reviewNotes
      });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeNGOs: number;
    pendingVerifications: number;
    monthlyDonations: number;
  }> {
    try {
      const response = await apiClient.get<{ data: any }>('/admin/dashboard-stats');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const adminService = new AdminService(); 