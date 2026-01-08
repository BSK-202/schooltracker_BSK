import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl';


export interface Bus {
  id: number;
  licence_plate: string;
  model: string;
  capacity: number;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  school_id?: number;
  school?: {
    id: number;
    name: string;
  };
  driver?: {
    id: number;
    full_name: string;
    phone: string;
  };
}

export interface BusesResponse {
  success: boolean;
  data: Bus[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    filters?: any;
  };
}
export interface CreateBusData {
  licence_plate: string;
  model: string;
  capacity: number;
  school_id?: number;
  driver_id?: number; // Ajoutez cette ligne
  is_active?: boolean;
  photo?: File;
}


class BusService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/buses`,
    timeout: 10000, // Timeout de 10 secondes
    headers: {
      'Content-Type': 'application/json',
    }
  });

  constructor() {
    // Interceptor pour ajouter le token
    /* this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor pour les réponses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Rediriger vers la page de login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    ); */
  }

  async getAllBuses(page = 1, perPage = 10): Promise<BusesResponse> {
    const response = await this.api.get('', {
      params: { page, perPage }
    });
    return response.data;
  }

  async createBus(data: CreateBusData) {
    // Si une photo est présente, utiliser FormData
    if (data.photo) {
      const formData = new FormData();

      // Ajouter tous les champs au FormData
      formData.append('licence_plate', data.licence_plate);
      formData.append('model', data.model);
      formData.append('capacity', data.capacity.toString());

      if (data.school_id) {
        formData.append('school_id', data.school_id.toString());
      }

      if (data.driver_id) { // Ajoutez cette condition
        formData.append('driver_id', data.driver_id.toString());
      }

      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      // Ajouter la photo
      formData.append('photo', data.photo);

      const response = await this.api.post('', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sinon, envoyer normalement en JSON
      const response = await this.api.post('', data);
      return response.data;
    }
  }

  async updateBus(id: number, data: Partial<CreateBusData>) {
    // Si une photo est présente, utiliser FormData
    if (data.photo) {
      const formData = new FormData();

      // Ajouter tous les champs au FormData
      if (data.licence_plate) formData.append('licence_plate', data.licence_plate);
      if (data.model) formData.append('model', data.model);
      if (data.capacity) formData.append('capacity', data.capacity.toString());

      if (data.school_id !== undefined) {
        formData.append('school_id', data.school_id.toString());
      }

      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
      }

      // Ajouter la photo
      formData.append('photo', data.photo);

      const response = await this.api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Sinon, envoyer normalement en JSON
      const response = await this.api.put(`/${id}`, data);
      return response.data;
    }
  }

  async deleteBus(id: number) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async assignToSchool(busId: number, schoolId: number) {
    const response = await this.api.post(`/${busId}/assign-school`, {
      school_id: schoolId
    });
    return response.data;
  }

  // Nouvelle méthode pour désaffecter d'une école
  async unassignFromSchool(busId: number) {
    const response = await this.api.post(`/${busId}/unassign-school`);
    return response.data;
  }

  // Nouvelle méthode pour récupérer un bus spécifique
  async getBusById(id: number) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  // Nouvelle méthode pour changer le statut
  async updateStatus(busId: number, status: 'active' | 'maintenance' | 'inactive') {
    const response = await this.api.patch(`/${busId}/status`, { status });
    return response.data;
  }
}

export default new BusService();