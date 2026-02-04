import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import RootNavigation from './src/components/RootNavigation';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { usePushNotifications } from './src/Hooks/usePushNotifications';
import * as SplashScreen from 'expo-splash-screen';

// ──────────────────────────────────────────────────────────────
// IMPORT IMPORTANT pour Firebase Performance
// ──────────────────────────────────────────────────────────────
import '@react-native-firebase/app';
import perf from '@react-native-firebase/perf';

// Empecher le splash screen de se cacher automatiquement
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

  useEffect(() => {
    async function prepare() {
      // ──────────────────────────────────────────────────────────────
      // DÉBUT DE LA MESURE DU TTI
      // ──────────────────────────────────────────────────────────────
      const ttiTrace = await perf().startTrace('tti_app_ready'); // ← On commence la trace

      try {
        // 1. Initialiser les notifications
        await registerForPushNotificationsAsync();

        // 2. (Optionnel) Simuler un petit chargement ou attendre d'autres promesses
        //    Ex : chargement fonts, vérification auth, fetch initial...
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ──────────────────────────────────────────────────────────────
        // Ici tu peux ajouter d'autres await importants pour ton app
        // Exemples :
        // await loadFontsAsync();
        // await checkAuthAndRedirect();
        // await fetchInitialData();
        // ──────────────────────────────────────────────────────────────

      } catch (error) {
        console.warn('Erreur lors de la préparation:', error);
      } finally {
        // Tout est prêt → on marque l'app comme prête
        setAppIsReady(true);

        // ──────────────────────────────────────────────────────────────
        // FIN DE LA MESURE DU TTI
        // ──────────────────────────────────────────────────────────────
        await ttiTrace.stop(); // ← On arrête la trace ici = TTI mesuré !

        console.log('✅ TTI trace envoyée à Firebase !');

        // Cacher le splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Gérer les notifications reçues
  useEffect(() => {
    if (notification) {
      console.log('📨 Notification reçue dans App:', notification);
      // Tu peux ajouter une logique de navigation ici si besoin
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