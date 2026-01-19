import authApi from "../APIS/authApi";
import { tokenService } from "./tokenService";

export const registerPushToken = async (expoPushToken) => {
  try {
    // Vérifier si un token d'authentification existe
    const authToken = await tokenService.getToken();
    if (!authToken) {
      console.log('⚠️ Not authenticated, skipping push token registration');
      return null;
    }
    
    const response = await authApi.post('/notifications/register-token', {
      pushToken: expoPushToken,
    });
    
    console.log('✅ Token enregistré côté backend:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️ Authentication required for push token registration');
    } else {
      console.error('❌ Erreur enregistrement token:', error);
    }
    throw error;
  }
};


export const unregisterPushToken = async (expoPushToken) => {
  try {
    await authApi.delete('/notifications/unregister-token', {
      data: { pushToken: expoPushToken },
    });
  } catch (error) {
    console.error('❌ Erreur désenregistrement token:', error);
  }
};