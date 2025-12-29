
import authApi from '../APIS/authApi';
import loginApi from '../APIS/loginApi'
import { logout } from '../redux/Authslice';
const authService = {

  login: async (phone, password) => {
    try {
      const response = await loginApi.post('/auth/login', { phone, password });
      
      if (response.data.message !== "Connexion reussie") {
        throw new Error(response.data.message || 'Erreur de connexion');
      }
      
      return {
        success: true,
        token: response.data.acces_token,
        message: response.data.message,
        data: response.data,
      };
    } catch (error) {
      console.error('Auth Service - Login error:', error);
      throw error;
    }
  },

   profile: async () => {
    try {
      const response = await authApi.get('/auth/profil');
      return response;
    } catch (error) {
      console.error('auth Service - profil error:', error);
      throw error;
    }
  },



};
export default authService;