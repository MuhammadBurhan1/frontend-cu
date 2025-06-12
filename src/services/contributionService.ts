import { apiClient, handleApiError } from '../utils/api';
import type { Contribution, ContributionFormData } from '../types';

export interface ContributionFilters {
  status?: string;
  city?: string;
  category?: string;
  foodType?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ContributionResponse {
  contributions: Contribution[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export class ContributionService {
  async createContribution(data: ContributionFormData): Promise<Contribution> {
    try {
      // Based on your backend route: POST /api/v1/contributor/dashboard/addfood
      const response = await apiClient.post<Contribution>('/contributor/dashboard/addfood', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getContributions(filters?: ContributionFilters): Promise<ContributionResponse> {
    try {
      // Based on your backend route: POST /api/v1/contributor/dashboard/getfooditems
      const response = await apiClient.post<ContributionResponse>('/contributor/dashboard/getfooditems', filters || {});
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getAvailableContributions(filters?: ContributionFilters): Promise<ContributionResponse> {
    try {
      const availableFilters = { ...filters, status: 'available' };
      return this.getContributions(availableFilters);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getContributionById(id: string): Promise<Contribution> {
    try {
      // Based on your backend route: POST /api/v1/contributor/dashboard/getfooditem
      const response = await apiClient.post<Contribution>('/contributor/dashboard/getfooditem', { id });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getMyContributions(filters?: Omit<ContributionFilters, 'status'>): Promise<ContributionResponse> {
    try {
      const response = await apiClient.post<ContributionResponse>('/contributor/dashboard/getfooditems', {
        ...filters,
        myContributions: true
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async acceptContribution(id: string): Promise<Contribution> {
    try {
      // Based on your backend route: POST /api/v1/ngo/reservation_req
      const response = await apiClient.post<Contribution>('/ngo/reservation_req', { foodItemId: id });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateContributionStatus(id: string, status: string): Promise<Contribution> {
    try {
      // Based on your backend route: PATCH /api/v1/contributor/dashboard/update_status
      const response = await apiClient.patch<Contribution>('/contributor/dashboard/update_status', { 
        foodItemId: id, 
        status 
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateNGOStatus(id: string, status: string): Promise<Contribution> {
    try {
      // Based on your backend route: PATCH /api/v1/ngo/update_status
      const response = await apiClient.patch<Contribution>('/ngo/update_status', { 
        reservationId: id, 
        status 
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async completeContribution(id: string): Promise<Contribution> {
    try {
      return this.updateContributionStatus(id, 'completed');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async cancelContribution(id: string): Promise<Contribution> {
    try {
      return this.updateContributionStatus(id, 'cancelled');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async deleteContribution(id: string): Promise<void> {
    try {
      // This endpoint might not exist in your backend, adjust as needed
      await apiClient.delete(`/contributor/dashboard/deletefood/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // Analytics and statistics
  async getContributionStats(): Promise<{
    totalContributions: number;
    totalMealsProvided: number;
    totalFoodSaved: number;
    co2Reduced: number;
  }> {
    try {
      // Based on your backend route: GET /api/v1/contributor/dashboard/overview
      const response = await apiClient.get('/contributor/dashboard/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getContributionAnalytics(timeRange: 'week' | 'month' | 'year' = 'month'): Promise<{
    chartData: Array<{
      period: string;
      contributions: number;
      meals: number;
      foodSaved: number;
    }>;
    topContributors: Array<{
      name: string;
      contributions: number;
      meals: number;
    }>;
    foodTypeDistribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
  }> {
    try {
      const response = await apiClient.get(`/contributor/dashboard/analytics?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const contributionService = new ContributionService();