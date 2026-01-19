import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerPushToken } from '../services/notificationService';
import { tokenService } from '../services/tokenService';

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  
  const notificationListener = useRef();
  const responseListener = useRef();

  // 1. Configuration initiale des notifications
  useEffect(() => {
    // Configurer le handler des notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  // 2. Fonction pour enregistrer les notifications (MAIS NE PAS L'APPELER AUTOMATIQUEMENT)
  const registerForPushNotificationsAsync = async () => {
    let token;
    
    // Vérifier les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Demander la permission si pas déjà accordée
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Si permission refusée
    if (finalStatus !== 'granted') {
      console.log('❌ Permission refusée pour les notifications push');
      setPermissionStatus('denied');
      return null;
    }
    
    setPermissionStatus(finalStatus);
    console.log('✅ Permission accordée pour les notifications');

    // Configuration spécifique Android
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
        console.log('✅ Canal de notification Android configuré');
      } catch (error) {
        console.error('❌ Erreur configuration canal Android:', error);
      }
    }

    // Récupérer le token Expo Push
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '91db13a3-7b59-4caf-ade3-38d707fb627a', // Ton projectId de app.json
      });
      
      token = tokenData.data;
      console.log('✅ Expo Push Token récupéré:', token.substring(0, 20) + '...');
      setExpoPushToken(token);
      
      // Enregistrer le token côté backend
      if (token && registerPushToken) {
        try {
          await registerPushToken(token);
          console.log('✅ Token enregistré côté backend');
        } catch (backendError) {
          console.warn('⚠️ Impossible d\'enregistrer le token côté backend:', backendError.message);
        }
      }
      
      return token;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  // 3. SEULEMENT configurer les écouteurs locaux (pas d'enregistrement automatique)
  useEffect(() => {
    console.log('🔔 Configuration des écouteurs de notifications locales...');
    
    // Écouteur pour les notifications reçues (app en avant-plan)
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        console.log('📨 Notification reçue (foreground):', receivedNotification.request.content.title);
        setNotification(receivedNotification);
      }
    );

    // Écouteur pour les interactions avec les notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification cliquée:', response.notification.request.content.title);
        
        // Extraire les données de navigation
        const data = response.notification.request.content.data;
        if (data && data.screen) {
          console.log(`📍 Navigation vers: ${data.screen}`);
          // Ici, vous pouvez naviguer vers l'écran spécifié
          // Exemple: navigation.navigate(data.screen);
        }
      }
    );

    console.log('✅ Écouteurs de notifications configurés');

    // Nettoyage à la destruction du composant
    return () => {
      console.log('🧹 Nettoyage des listeners de notifications...');
      
      try {
        if (Notifications.removeNotificationSubscription) {
          if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
            console.log('✅ notificationListener supprimé');
          }
          if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
            console.log('✅ responseListener supprimé');
          }
        } 
        // Méthode 2: Si les listeners ont une méthode remove()
        else if (notificationListener.current && typeof notificationListener.current.remove === 'function') {
          notificationListener.current.remove();
          console.log('✅ notificationListener supprimé (méthode remove)');
        }
        if (responseListener.current && typeof responseListener.current.remove === 'function') {
          responseListener.current.remove();
          console.log('✅ responseListener supprimé (méthode remove)');
        }
        
        console.log('✅ Listeners de notifications nettoyés avec succès');
      } catch (cleanupError) {
        console.warn('⚠️ Erreur lors du nettoyage des listeners:', cleanupError);
      }
    };
  }, []);

  // 4. Fonction pour envoyer une notification locale
  const sendLocalNotification = async (title, body, data = {}) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Notification immédiate
      });
      console.log(`📤 Notification locale envoyée: ${title}`);
    } catch (error) {
      console.error('❌ Erreur envoi notification locale:', error);
    }
  };

  // 5. Fonction pour obtenir les permissions manuellement
  const requestPermissions = async () => {
    return await registerForPushNotificationsAsync();
  };

  // 6. NOUVELLE FONCTION : Enregistrer le token push APRÈS authentification
  const registerPushTokenAfterLogin = async () => {
    try {
      console.log('🔔 Vérification pour enregistrement push après login...');
      
      // Vérifier si l'utilisateur est authentifié
      const authToken = await tokenService.getToken();
      if (!authToken) {
        console.log('⚠️ Pas de token d\'authentification, on ne fait rien');
        return null;
      }
      
      // Vérifier si on a déjà un token push
      if (expoPushToken) {
        console.log('✅ Token push déjà enregistré:', expoPushToken.substring(0, 20) + '...');
        return expoPushToken;
      }
      
      console.log('✅ Utilisateur authentifié, enregistrement du token push...');
      return await registerForPushNotificationsAsync();
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement push après login:', error);
      return null;
    }
  };

  return {
    expoPushToken,
    notification,
    permissionStatus,
    requestPermissions,
    sendLocalNotification,
    registerForPushNotificationsAsync,
    registerPushTokenAfterLogin, // <-- IMPORTANT: Fonction à appeler APRÈS la connexion
  };
};