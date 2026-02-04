
import authApi from '../APIS/authApi';
import loginApi from '../APIS/loginAPI'; // Note: vérifiez le nom du fichier

const authService = {
  login: async (phone, password) => {
    try {
      console.log('Login attempt for:', phone);
      const response = await loginApi.post('/auth/login', { phone, password });
      
      return {
        success: true,
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        message: response.data.message,
        user: response.data.user,
        data: response.data,
      };
    } catch (error) {
      console.error('Auth Service - Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // IMPORTANT: Cette méthode doit exister !
  profile: async () => {
    try {
      console.log('Fetching profile from /auth/profile...');
      const response = await authApi.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Auth Service - Profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Ajouter aussi ces méthodes si besoin
  refresh: async (refreshToken) => {
    try {
      const response = await loginApi.post('/auth/refresh', { refresh_token: refreshToken });
      return response.data;
    } catch (error) {
      console.error('Auth Service - Refresh error:', error);
      throw error;
    }
  }
};

// EXPORT par défaut (vérifiez que c'est bien ça)
export default authService;