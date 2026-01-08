
import authApi from '../APIS/authApi';
import loginApi from '../APIS/loginAPI'
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

};
export default authService;