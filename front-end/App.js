import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigation from './src/components/RootNavigation';
import store from './src/redux/store';
import { usePushNotifications } from './src/Hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);
  const { registerForPushNotificationsAsync } = usePushNotifications();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const start = Date.now();
      let trace = null;

      try {
        // Option : charger perf seulement si besoin
        if (!__DEV__) {
          try {
            const perf = require('@react-native-firebase/perf').default;
            trace = await perf().startTrace('tti_app_ready');
          } catch {}
        }

        // Tâche non bloquante
        registerForPushNotificationsAsync().catch(() => {});

        const elapsed = Date.now() - start;
        if (elapsed < 450) {
          await new Promise(r => setTimeout(r, 450 - elapsed));
        }
      } catch (err) {
        if (__DEV__) console.warn('App init error:', err);
      } finally {
        if (mounted) {
          setReady(true);
          if (trace) await trace.stop().catch(() => {});
          await SplashScreen.hideAsync().catch(() => {});
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return null; // clé : on garde le splash natif
  }

  return (
    <Provider store={store}>
      <RootNavigation />
    </Provider>
  );
}