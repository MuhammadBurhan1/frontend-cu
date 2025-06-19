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

export interface Location {
  latitude: number;
  longitude: number;
}

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  expirationDate: string;
  location: Location;
  status: 'available' | 'accepted' | 'completed';
  contributor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddFoodRequest {
  foodId: string;
  name: string;
  description: string;
  quantity: number;
  expirationDate: string;
  location: Location;
}

export interface UpdateStatusRequest {
  contribution: string;
  status: 'available' | 'accepted' | 'completed';
}

export interface DashboardOverview {
  totalContributions: number;
  activeContributions: number;
  completedContributions: number;
  recentContributions: FoodItem[];
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

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      // GET request with no body parameters
      const response = await apiClient.get('/contributor/dashboard/overview');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async addFood(data: AddFoodRequest): Promise<FoodItem> {
    try {
      // POST request with JSON body
      const response = await apiClient.post('/contributor/dashboard/addfood', {
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        expirationDate: data.expirationDate,
        location: data.location
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFoodItem(foodItemId: string): Promise<FoodItem> {
    try {
      // POST request with x-www-form-urlencoded body
      const formData = new URLSearchParams();
      formData.append('foodItem', foodItemId);
      
      const response = await apiClient.post('/contributor/dashboard/getfooditem', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async getFoodItems(foodItemId: string): Promise<FoodItem[]> {
    try {
      // POST request with x-www-form-urlencoded body
      const formData = new URLSearchParams();
      formData.append('foodItem', foodItemId);
      
      const response = await apiClient.post('/contributor/dashboard/getfooditems', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  async updateStatus(data: UpdateStatusRequest): Promise<FoodItem> {
    try {
      // PATCH request with x-www-form-urlencoded body
      const formData = new URLSearchParams();
      formData.append('contribution', data.contribution);
      formData.append('status', data.status);
      
      const response = await apiClient.patch('/contributor/dashboard/update_status', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export const contributionService = new ContributionService();