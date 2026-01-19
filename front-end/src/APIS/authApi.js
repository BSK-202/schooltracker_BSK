
import axios from "axios";
import API_BASE_URL from "../config/baseUrl";
import { tokenService } from "../services/tokenService";
import { DeviceEventEmitter } from 'react-native';

const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor de requête
authApi.interceptors.request.use(
    async (config) => {
        // NE PAS ajouter de token pour les endpoints publics
        const publicEndpoints = [
            '/auth/login',
            '/auth/refresh'
        ];
        
        const isPublicEndpoint = publicEndpoints.some(endpoint => 
            config.url?.includes(endpoint)
        );
        
        if (!isPublicEndpoint) {
            const token = await tokenService.getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de réponse pour gérer le refresh token
authApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Vérifier si c'est une erreur 401 (token expiré) et pas déjà retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // NE PAS tenter de refresh pour les endpoints publics
            const publicEndpoints = [
                '/auth/login',
                '/auth/refresh'
            ];
            
            const isPublicEndpoint = publicEndpoints.some(endpoint => 
                originalRequest.url?.includes(endpoint)
            );
            
            if (isPublicEndpoint) {
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            
            try {
                console.log('Token expired, attempting refresh...');
                
                // Vérifier si un refresh token existe
                const refreshToken = await tokenService.getRefreshToken();
                if (!refreshToken) {
                    console.log('No refresh token found, redirecting to login');
                    throw new Error('No refresh token available');
                }
                
                // Vérifier si le refresh token n'est pas expiré
                // Note: Vous devriez implémenter une vérification côté client
                // Pour l'instant, on essaie simplement
                
                console.log('Attempting refresh with token:', refreshToken.substring(0, 20) + '...');
                
                // Appeler l'endpoint de refresh
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { 
                        timeout: 10000,
                        headers: { 
                            'Content-Type': 'application/json',
                            // IMPORTANT: Pas d'Authorization header pour le refresh
                        }
                    }
                );
                
                const { access_token, refresh_token } = refreshResponse.data;
                
                // Stocker les nouveaux tokens
                await tokenService.setToken(access_token);
                if (refresh_token) {
                    await tokenService.setRefreshToken(refresh_token);
                }
                
                console.log('Tokens refreshed successfully');
                
                // Mettre à jour l'en-tête et réessayer
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return authApi(originalRequest);
                
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError.message || refreshError);
                
                // Nettoyer les tokens
                await tokenService.clearAll();
                
                // Émettre un événement pour forcer la déconnexion
                DeviceEventEmitter.emit('auth:logout');
                
                // Rejeter avec une erreur spécifique
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }
        
        // Pour les autres erreurs
        return Promise.reject(error);
    }
);

export default authApi;
