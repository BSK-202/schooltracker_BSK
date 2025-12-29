
import authApi from '../APIS/authApi';
import loginApi from '../APIS/loginApi'
import { logout } from '../redux/Authslice';
const authService = {

  login: async (phone, password) => {
    try {
      const response = await loginApi.post('/auth/login', { phone, password });

      
      return {
        success: true,
        access_token: response.data.access_token,
        refresh_token:response.data.refresh_token,
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