import axios from "axios";
import API_BASE_URL from "../config/baseUrl";
import { tokenService } from "../services/tokenService";

const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Augmenté à 15s pour plus de stabilité
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor de requête
authApi.interceptors.request.use(
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

// Interceptor de réponse pour gérer le refresh token
authApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Si erreur 401 (non autorisé) et pas déjà retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                console.log('Token expired, attempting refresh...');
                
                // Récupérer le refresh token
                const refreshToken = await tokenService.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                
                // Appeler l'endpoint de refresh
                const refreshResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    { refresh_token: refreshToken },
                    { 
                        timeout: 10000,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                
                const { access_token, refresh_token } = refreshResponse.data;
                
                // Stocker les nouveaux tokens
                await tokenService.setToken(access_token);
                await tokenService.setRefreshToken(refresh_token);
                
                console.log('Tokens refreshed successfully');
                
                // Mettre à jour l'en-tête et réessayer
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return authApi(originalRequest);
                
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
                
                // En cas d'échec, nettoyer et rediriger vers login
                await tokenService.clearAll();
                
                // Émettre un événement pour notifier l'app de la déconnexion
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth:logout'));
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // Pour les autres erreurs
        return Promise.reject(error);
    }
);

export default authApi;