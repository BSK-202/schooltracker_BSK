import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { registerPushToken } from '../services/notificationService';

// Configuration du comportement des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  
  const notificationListener = useRef();
  const responseListener = useRef();

  // 1. Demander les permissions et récupérer le token
  const registerForPushNotificationsAsync = async () => {
    let token;
    
    // Vérifier si c'est un appareil physique
    if (!Device.isDevice) {
      console.log('⚠️ Les notifications ne fonctionnent que sur des appareils physiques');
      return null;
    }

    // Vérifier les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permission refusée pour les notifications');
      return null;
    }
    
    setPermissionStatus(finalStatus);

    // Configuration Android (Channel)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    // Récupérer le token Expo
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'votre-project-id', // Trouvable dans app.json
      });
      
      token = tokenData.data;
      console.log('✅ Expo Push Token:', token);
      setExpoPushToken(token);
      
      // Enregistrer le token côté backend
      if (token) {
        await registerPushToken(token);
      }
      
      return token;
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  };

  // 2. Initialiser les notifications
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Écouter les notifications reçues (app en avant-plan)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📨 Notification reçue (foreground):', notification);
        setNotification(notification);
      }
    );

    // Écouter les clics sur notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification cliquée:', response);
        
        // Navigation vers l'écran approprié
        const data = response.notification.request.content.data;
        if (data?.screen) {
          // Ici, vous pouvez utiliser votre système de navigation
          console.log(`Naviguer vers: ${data.screen}`);
        }
      }
    );

    // Nettoyage
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 3. Fonction pour envoyer une notification locale
  const sendLocalNotification = async (title, body, data = {}) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Immédiatement
    });
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    registerForPushNotificationsAsync,
    sendLocalNotification,
  };
};