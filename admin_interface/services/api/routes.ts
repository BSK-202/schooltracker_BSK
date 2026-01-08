// services/api/routes.ts
import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl';

export interface RouteStop {
  stopId: number;
  scheduled_time: string;
}

export interface CreateRouteData {
  busId: number;
  nom: string;
  type: 'PICKUP' | 'DROPOFF';
  heure_debut: string;
  heure_fin: string;
  is_actif: boolean;
  stops: RouteStop[];
}

export interface UpdateRouteData {
  busId?: number;
  nom?: string;
  type?: 'PICKUP' | 'DROPOFF';
  heure_debut?: string;
  heure_fin?: string;
  is_actif?: boolean;
  stops?: RouteStop[];
}

export interface Route {
  id: number;
  nom: string;
  type: 'PICKUP' | 'DROPOFF';
  is_actif: boolean;
  heure_debut: string;
  heure_fin: string;
  created_at: string;
  bus: {
    capacity: number;
    id: number;
    licence_plate: string;
    school: {
      address: string;
      id: number;
      nom: string;
    };
  };
  nombre_arrets: number;
  duree_estimee: string;
}

export interface RouteDetail extends Route {
  stops: Array<{
    geom: any;
    id: number;
    address: string;
    stop_order: number;
    scheduled_time: string;
  }>;
}

export interface RoutesResponse {
  success: boolean;
  data: Route[];
  meta?: {
    total: number;
    page: number;
    perPage: number;
  };
}

export interface RouteResponse {
  success: boolean;
  message: string;
  data: RouteDetail;
}

class RouteService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/routes`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  constructor() {
    // Intercepteur pour ajouter le token
    /* this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour les réponses
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    ); */
  }

  /**
   * Récupérer toutes les routes
   */
  async getAllRoutes(page = 1, perPage = 10): Promise<RoutesResponse> {
    const response = await this.api.get('', {
      params: { page, perPage }
    });
    return response.data;
  }

  /**
   * Récupérer une route par son ID
   */
  async getRouteById(id: number): Promise<RouteResponse> {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  /**
   * Créer une nouvelle route
   */
  async createRoute(data: CreateRouteData): Promise<RouteResponse> {
    const response = await this.api.post('', data);
    return response.data;
  }

  /**
   * Mettre à jour une route
   */
  async updateRoute(id: number, data: UpdateRouteData): Promise<RouteResponse> {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer une route
   */
  async deleteRoute(id: number): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  /**
   * Activer/Désactiver une route
   */
  async toggleRouteStatus(id: number, isActive: boolean): Promise<RouteResponse> {
    const response = await this.api.patch(`/${id}/status`, { is_actif: isActive });
    return response.data;
  }
}

export default new RouteService();