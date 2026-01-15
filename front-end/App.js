import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import RootNavigation from './src/components/RootNavigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import * as SplashScreen from 'expo-splash-screen';

// Empêcher le splash screen de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

// Composant wrapper pour la logique des notifications
function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Initialiser les push notifications
  const {
    expoPushToken,
    notification,
    permissionStatus,
    registerForPushNotificationsAsync,
    sendLocalNotification,
  } = usePushNotifications();

  // Vérifier les permissions et préparer l'app
  useEffect(() => {
    async function prepare() {
      try {
        // Initialiser les notifications
        await registerForPushNotificationsAsync();
        
        // Simuler un chargement (optionnel)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn('Erreur lors de la préparation:', error);
      } finally {
        // Marquer l'app comme prête
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Gérer les notifications reçues
  useEffect(() => {
    if (notification) {
      console.log('📨 Notification reçue dans App:', notification);
      
      // Vous pouvez ajouter une logique globale de gestion des notifications ici
      // Par exemple : navigation vers un écran spécifique
      // ou affichage d'une alerte personnalisée
    }
  }, [notification]);

  // Afficher le splash screen pendant le chargement
  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return <RootNavigation />;
}

// Composant principal
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}