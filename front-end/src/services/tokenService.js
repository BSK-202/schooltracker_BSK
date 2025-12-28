import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'acces_token';
//const REFRESH_TOKEN_KEY = 'refresh_token';
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
  
};