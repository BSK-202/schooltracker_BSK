
import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl';

export interface Driver {
  id: number;
  full_name: string;
  phone: string;
  created_at: string;
  assignedBus?: {
    id: number;
    licence_plate: string;
    school?: {
      id: number;
      name: string;
    };
  };
  stats?: {
    totalTripsCompleted: number;
    totalStudentsTransported: number;
    averageRating: number;
  };
  // Ajoutez cette propriété
  school_id?: number;
  school?: {
    id: number;
    name: string;
    address: string;
  };
}

export interface DriversResponse {
  success: boolean;
  data: Driver[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    availableDrivers?: number;
  };
}

export interface CreateDriverData {
  full_name: string;
  phone: string;
  school_id?: number; // Ajoutez cette ligne
}

// Ajoutez cette interface pour les écoles
export interface School {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

class DriverService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/drivers`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });


  async getAllDrivers(
    page = 1, 
    perPage = 10, 
    hasAssignedBus?: boolean
  ): Promise<DriversResponse> {
    const params: any = { page, perPage };
    if (hasAssignedBus !== undefined) {
      params.hasAssignedBus = hasAssignedBus;
    }
    
    const response = await this.api.get('', { params });
    return response.data;
  }

  async getDriverById(id: number) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async createDriver(data: CreateDriverData) {
    const response = await this.api.post('', data);
    return response.data;
  }

  async updateDriver(id: number, data: Partial<CreateDriverData>) {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  async deleteDriver(id: number) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async assignBus(driverId: number, busId: number) {
    const response = await this.api.post(`/${driverId}/assign-bus`, { 
      bus_id: busId 
    });
    return response.data;
  }

  async unassignBus(driverId: number) {
    const response = await this.api.post(`/${driverId}/unassign-bus`);
    return response.data;
  }

  // Ajoutez cette méthode pour récupérer les écoles
  async getSchools(): Promise<{ success: boolean; data: School[] }> {
    const response = await axios.get(`${API_BASE_URL}/admin/schools`);
    return response.data;
  }
}

export default new DriverService();