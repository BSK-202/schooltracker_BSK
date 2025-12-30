import * as SecureStore from 'expo-secure-store';
import loginApi from '../APIS/loginAPI';

const TOKEN_KEY = 'acces_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
//const USER_DATA_KEY = 'user_data';

export const tokenService = {

  setToken: async (token) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
      throw new Error('Impossible de stocker le token');
    }
  },


  getToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  
  setRefreshToken: async (reftoken) => {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, reftoken);
      console.log('reftoken stored successfully');
    } catch (error) {
      console.error('Error storing reftoken:', error);
      throw new Error('Impossible de stocker le reftoken');
    }
  },
   getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

   clearAll: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      console.log('All authentication data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
  refreshAccessToken:async () => {
  try {
    const refreshToken = await tokenService.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await loginApi.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token } = response.data;

    // Stocker les nouveaux tokens
    await tokenService.setToken(access_token);
        await tokenService.getRefreshToken(refresh_token);


    return access_token;
  } catch (error) {
    console.error('Refresh token failed:', error);
    // Si échec => logout
    await tokenService.clearAll();
    return null;
  }
  },

};