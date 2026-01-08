// services/api/admin/schools.ts
import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl'

export interface School {
  id: number;
  name: string;
  address: string;
  geom: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
  stats?: {
    busCount: number;
    studentCount: number;
    activeTripsCount: number;
  };
  buses?: Array<{
    id: number;
    licence_plate: string;
    capacity: number;
    driver?: {
      id: number;
      full_name: string;
    };
  }>;
  activeRoutes?: number;
  totalStudents?: number;
}

export interface SchoolsResponse {
  success: boolean;
  data: School[];
  meta: {
    total: number;
    page: number;
    perPage: number;
  };
}

export interface SchoolResponse {
  success: boolean;
  data: School;
}

export interface CreateSchoolData {
  name: string;
  address: string;
  geom: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UpdateSchoolData {
  name?: string;
  address?: string;
  geom?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

class SchoolService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/schools`,
  });

  constructor() {
    // Interceptor pour ajouter le token JWT
   /*  this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }); */
  }

  async getAllSchools(page = 1, perPage = 10): Promise<SchoolsResponse> {
    try {
      const response = await this.api.get('', {
        params: { page, perPage }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }
  }

  async getSchoolById(id: number): Promise<SchoolResponse> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school ${id}:`, error);
      throw error;
    }
  }

  async createSchool(data: CreateSchoolData): Promise<SchoolResponse> {
    try {
      const response = await this.api.post('', data);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  async updateSchool(id: number, data: UpdateSchoolData): Promise<SchoolResponse> {
    try {
      const response = await this.api.put(`/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating school ${id}:`, error);
      throw error;
    }
  }

  async deleteSchool(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting school ${id}:`, error);
      throw error;
    }
  }
}

export default new SchoolService();