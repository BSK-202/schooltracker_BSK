import authService from '../services/authService';

authApi.interceptors.response.use(
    response => response, // Tout est OK, on renvoie la réponse
    async error => {
        const originalRequest = error.config;

        // Si status 401 = token expiré
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // pour éviter boucle infinie

            try {
                // 1 Récupérer le refresh token stocké
                const refreshToken = await SecureStore.getItemAsync('refresh_token');
                if (!refreshToken) throw new Error('No refresh token');

                // 2️ Appeler l'endpoint /auth/refresh pour obtenir un nouveau access token
                const response = await authApi.post('/auth/refresh', { refresh_token: refreshToken });
                const { access_token, refresh_token } = response.data;

                // 3️ Stocker les nouveaux tokens
                await SecureStore.setItemAsync('access_token', access_token);
                await SecureStore.setItemAsync('refresh_token', refresh_token);
                console.log("access_token: " + access_token)
                console.log("refresh_token: " + refresh_token)

                // 4️ Mettre à jour l’Authorization header et réessayer la requête originale
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return authApi(originalRequest);

            } catch (err) {
                console.error('Refresh token failed', err);
                // Si échec → logout ou suppression des tokens
                await SecureStore.deleteItemAsync('access_token');
                await SecureStore.deleteItemAsync('refresh_token');
                return Promise.reject(err);
            }
        }

        // Si ce n’est pas un 401 ou si déjà retry → rejet
        return Promise.reject(error);
    }
);
