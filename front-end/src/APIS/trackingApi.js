// front-end/src/APIS/trackingApi.js
import axios from 'axios';
import { tokenService } from '../services/tokenService';
import API_BASE_URL from '../config/baseUrl';
// Créer une instance axios pour les requêtes tracking
const trackingApi = axios.create({
  baseURL: API_BASE_URL, // Ajuster selon votre configuration
  timeout: 10000,
});

// Intercepteur pour ajouter le token
trackingApi.interceptors.request.use(
  async (config) => {
    const token = await tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour rafraîchir le token si expiré
trackingApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await tokenService.refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return trackingApi(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default trackingApi;