import authApi from "../APIS/authApi";


export const registerPushToken = async (expoPushToken) => {
  try {
    const response = await authApi.post('/notifications/register-token', {
      pushToken: expoPushToken,
      deviceId: 'device-id', // À récupérer avec expo-device
      platform: Platform.OS,
    });
    
    console.log('✅ Token enregistré côté backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur enregistrement token:', error);
    throw error;
  }
};

export const unregisterPushToken = async (expoPushToken) => {
  try {
    await API.delete('/notifications/unregister-token', {
      data: { pushToken: expoPushToken },
    });
  } catch (error) {
    console.error('❌ Erreur désenregistrement token:', error);
  }
};