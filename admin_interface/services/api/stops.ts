// services/api/stops.ts
import axios from 'axios';
import API_BASE_URL from '../../config/baseUrl';

export interface StopCoordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Stop {
  id: number;
  address: string;
  geom: StopCoordinates;
  created_at: string;
}

export interface StopsResponse {
  success: boolean;
  data: Stop[];
  meta?: {
    total: number;
  };
}

export interface CreateStopData {
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface UpdateStopData {
  address?: string;
  coordinates?: [number, number];
}

class StopService {
  private api = axios.create({
    baseURL: `${API_BASE_URL}/admin/stops`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  constructor() {
    // Intercepteur pour ajouter le token si nécessaire
   /*  this.api.interceptors.request.use(
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
   * Récupérer tous les arrêts
   */
  async getAllStops(page = 1, perPage = 100): Promise<StopsResponse> {
    const response = await this.api.get('', {
      params: { page, perPage }
    });
    return response.data;
  }

  /**
   * Récupérer un arrêt par son ID
   */
  async getStopById(id: number) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  /**
   * Créer un nouvel arrêt
   */
  async createStop(data: CreateStopData) {
    const response = await this.api.post('', data);
    return response.data;
  }

  /**
   * Mettre à jour un arrêt
   */
  async updateStop(id: number, data: UpdateStopData) {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }

  /**
   * Supprimer un arrêt
   */
  async deleteStop(id: number) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  /**
   * Obtenir les coordonnées d'une adresse (geocoding)
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      // Utilisation de l'API Nominatim d'OpenStreetMap (gratuite)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      }

      throw new Error('Adresse non trouvée');
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw new Error('Impossible de géocoder l\'adresse');
    }
  }

  /**
   * Obtenir l'adresse à partir de coordonnées (reverse geocoding)
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json'
        }
      });

      return response.data.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Erreur de géocodage inversé:', error);
      return `${lat}, ${lng}`;
    }
  }
}

export default new StopService();