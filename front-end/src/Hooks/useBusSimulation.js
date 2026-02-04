// front-end/src/hooks/useBusSimulation.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { io } from 'socket.io-client';
import API_BASE_URL from "../config/baseUrl";
import { getRealisticRoute } from '../services/routeService';
import * as Notifications from 'expo-notifications';

export const useBusSimulation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [busPosition, setBusPosition] = useState(null);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [nextStopInfo, setNextStopInfo] = useState(null); // AJOUTER CET ÉTAT
  
  const socketRef = useRef(null);
  const currentBusIdRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Connexion WebSocket
  const connect = useCallback(() => {
    // Nettoyer la connexion existante
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const wsUrl = `${API_BASE_URL}`;
    console.log(`🔗 Tentative de connexion WebSocket à: ${wsUrl}/simulation`);

    try {
      socketRef.current = io(`${wsUrl}/simulation`, {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
      });

      // Événements
      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket connecté avec succès');
        console.log('📡 Socket ID:', socketRef.current?.id);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket déconnecté. Raison:', reason);
        setIsConnected(false);
        setIsSimulationActive(false);
        
        if (reason === 'io server disconnect') {
          setTimeout(() => {
            console.log('🔄 Tentative de reconnexion...');
            connect();
          }, 1000);
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Erreur connexion WebSocket:', error.message);
        console.error('❌ Détails:', error);
        reconnectAttemptsRef.current += 1;
        
        if (reconnectAttemptsRef.current >= 5) {
          setError(`Impossible de se connecter après ${reconnectAttemptsRef.current} tentatives`);
        } else {
          setError(`Connexion échouée (tentative ${reconnectAttemptsRef.current}/5)`);
        }
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Tentative de reconnexion ${attemptNumber}`);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log(`✅ Reconnecté après ${attemptNumber} tentatives`);
        setIsConnected(true);
        setError(null);
      });

      // Événement de connexion initiale
      socketRef.current.on('connected', (data) => {
        console.log('📨 Message "connected" du serveur:', data);
      });

      // Position du bus
      socketRef.current.on('bus-position', (data) => {
        console.log('📍 Position reçue:', data);
        setBusPosition(data);
      });

      // Statut de la simulation
      socketRef.current.on('simulation-status', (status) => {
        console.log('📊 Statut simulation reçu:', status);
        setSimulationStatus(status);
        setIsSimulationActive(status?.isActive || false);
      });

      // Simulation démarrée
      socketRef.current.on('simulation-started', (data) => {
        console.log('🚀 Simulation démarrée:', data);
        setIsSimulationActive(true);
        if (data.busId) {
          currentBusIdRef.current = data.busId;
        }
        if (data.simulationSpeed) {
          setSimulationSpeed(data.simulationSpeed);
        }
      });

      // Simulation arrêtée
      socketRef.current.on('simulation-stopped', (data) => {
        console.log('🛑 Simulation arrêtée:', data);
        setIsSimulationActive(false);
        setBusPosition(null);
        setSimulationStatus(null);
        setNextStopInfo(null); // Réinitialiser
        setSimulationSpeed(1);
        currentBusIdRef.current = null;
      });

     // Remplacer l'écouteur bus-stop existant par:
socketRef.current.on('bus-stop', (data) => {
  console.log('🛑 Bus à l\'arrêt:', data);
  
  // Si c'est l'arrêt enfant, ne PAS afficher d'alerte générique
  // car une notification personnalisée sera déjà affichée via 'scheduled-notification'
  if (!data.isChildStop) {
    Alert.alert(
      'Arrêt du bus',
      `Le bus s'est arrêté à ${data.isSchool ? 'l\'école' : 'un arrêt'}`,
      [{ text: 'OK' }]
    );
  }
  
  // MAIS on peut quand même logger
  if (data.isChildStop) {
    console.log(`👨‍👦 Arrêt enfant: ${data.childName}`);
  }
});

      // Bus arrivé
      socketRef.current.on('bus-arrived', (data) => {
        console.log('🎉 Bus arrivé:', data);
        Alert.alert(
          'Arrivée',
          'Le bus est arrivé à destination',
          [{ text: 'OK' }]
        );
      });

      // Changement de vitesse
      socketRef.current.on('simulation-speed-changed', (data) => {
        console.log('⚡ Vitesse changée:', data);
        setSimulationSpeed(data.speedMultiplier);
      });

      // Pause/reprise
      socketRef.current.on('simulation-pause-toggled', (data) => {
        console.log('⏸️ Pause changée:', data);
      });

      // Notification de temps réel
      socketRef.current.on('time-status', (data) => {
        console.log('🕐 Statut temporel reçu:', data);
        setNextStopInfo(data.nextStop);
        
        // Si c'est l'arrêt de l'enfant
        if (data.nextStop?.isChildStop) {
          console.log(`👨‍👦 Prochain arrêt EST l'arrêt enfant: ${data.nextStop.minutesUntil} min`);
          
          // Afficher une notification locale si < 10 min
          if (data.nextStop.minutesUntil <= 10 && data.nextStop.minutesUntil > 0) {
            triggerLocalNotification(
              '👨‍👦 Arrêt enfant approche',
              `Le bus sera à l'arrêt de votre enfant dans ${data.nextStop.minutesUntil} minutes`,
              {
                busId: data.busId,
                stopId: data.nextStop.stopId,
                minutesUntil: data.nextStop.minutesUntil,
              }
            );
          }
        }
      });

      // NOTIFICATION GÉNÉRIQUE POUR TOUTES LES NOTIFICATIONS PROGRAMMÉES
      socketRef.current.on('scheduled-notification', (data) => {
        console.log('📅 Notification programmée reçue:', data);
        
        const notificationType = data.type || 'info';
        
        // Gérer les différents types de notifications
        switch (notificationType) {
          case 'departure':
            Alert.alert(
              '🚌 Départ du bus',
              `Le bus ${data.busId} vient de partir`,
              [{ text: 'OK' }]
            );
            break;
            
          case 'child_minutes_before':
            Alert.alert(
              `👨‍👦 ${data.minutesToStop} min avant`,
              data.message || `Le bus sera à l'arrêt de votre enfant dans ${data.minutesToStop} minutes`,
              [{ text: 'OK' }]
            );
            break;
            
          case 'child_5min_before':
            Alert.alert(
              '🕐 Bus en approche',
              data.message || 'Le bus sera à l\'arrêt de votre enfant dans 5 minutes',
              [{ text: 'OK' }]
            );
            break;
            
          case 'child_imminent':
            Alert.alert(
              '📍 Arrivée imminente',
              data.message || 'Le bus arrive à l\'arrêt de votre enfant',
              [{ text: 'OK' }]
            );
            break;
            
          case 'child_arrival':
            Alert.alert(
              '✅ Arrivé à l\'arrêt',
              data.message || `Le bus est arrivé à l'arrêt de ${data.childName || 'votre enfant'}`,
              [{ text: 'OK' }]
            );
            break;
            
          case '5min_before_general':
            Alert.alert(
              '🚌 Bus en approche',
              data.message || `Le bus sera à l'arrêt dans ${data.minutesToStop} minutes`,
              [{ text: 'OK' }]
            );
            break;
            
          case 'delay':
            Alert.alert(
              '⏰ Retard du bus',
              data.message || `Le bus a ${data.delayMinutes} minutes de retard`,
              [{ text: 'OK' }]
            );
            break;
            
          default:
            // Notification générique
            Alert.alert(
              data.title || '📱 SchoolTrack',
              data.message || 'Notification du bus',
              [{ text: 'OK' }]
            );
            break;
        }
        
        // Déclencher une notification push locale
        if (data.title && data.message) {
          triggerLocalNotification(
            data.title,
            data.message,
            {
              type: notificationType,
              busId: data.busId,
              stopId: data.stopId,
              ...data
            }
          );
        }
      });

      // SUPPRIMER les écouteurs obsolètes (ils sont tous gérés par scheduled-notification maintenant) :
      // - parent-notification
      // - child_stop_arrival
      // - delay
      // - pause_started
      // - pause_ended
      // - delay_due_to_pause
      // - arrived_at_stop

    } catch (error) {
      console.error('❌ Erreur initialisation WebSocket:', error);
      setError(`Initialisation WebSocket: ${error.message}`);
    }
  }, []);

  /**
   * Déclencher une notification locale
   */
  const triggerLocalNotification = useCallback(async (title, body, data = {}) => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('⚠️ Permissions notifications non accordées');
        return;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null,
      });
      
      console.log('📤 Notification locale envoyée:', { title, body });
    } catch (error) {
      console.error('❌ Erreur notification locale:', error);
    }
  }, []);

  /**
   * Obtenir le titre selon le type de notification
   */
  const getNotificationTitle = useCallback((type) => {
    const titles = {
      departure: '🚌 Départ du bus',
      stop: '🛑 Arrêt du bus',
      approaching: '🚌 Bus en approche',
      arrival: '🎉 Arrivée à l\'école',
      delay: '⏰ Retard du bus',
      emergency: '🚨 Urgence',
      info: 'ℹ️ Information SchoolTrack',
      test: '🧪 Test de notification',
    };
    
    return titles[type] || '📱 SchoolTrack';
  }, []);

  // Démarrer une simulation
  const startSimulation = useCallback(async (
    busId,
    trajetId,
    stops,
    childStopId,
    speed = 1
  ) => {
    if (!socketRef.current?.connected) {
      console.error('❌ WebSocket non connecté');
      Alert.alert('Erreur', 'Non connecté au serveur de simulation');
      return { success: false, message: 'WebSocket non connecté' };
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Démarrage simulation pour bus:', busId);
      console.log('📍 Nombre d\'arrêts:', stops.length);
      console.log('⚡ Vitesse demandée:', speed);

      // Trouver l'arrêt enfant pour récupérer son nom
      const childStop = stops.find(stop => stop.id === childStopId);
      const childName = childStop?.childName || 'votre enfant';

      // 1. Préparer les points pour OpenRouteService
      const routingPoints = stops
        .filter(stop => stop.latitude && stop.longitude)
        .sort((a, b) => a.order - b.order)
        .map(stop => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
        }));

      console.log('📍 Points pour routage:', routingPoints.length);

      // 2. Générer le trajet réaliste
      console.log('🔄 Génération du trajet...');
      const realisticRoute = await getRealisticRoute(routingPoints);
      
      console.log('✅ Trajet généré:', realisticRoute.length, 'points');

      // 3. Préparer les données pour le backend
      const routePoints = realisticRoute.map(point => ({
        lat: point.latitude,
        lng: point.longitude,
      }));

      const formattedStops = stops.map(stop => ({
        stopId: stop.id,
        lat: stop.latitude,
        lng: stop.longitude,
        order: stop.order,
        isSchool: stop.type === 'school' || stop.id < 0,
        stopDuration: stop.id === childStopId ? 60 : 30,
        childStopId: stop.id === childStopId ? stop.id : undefined,
        childName: stop.id === childStopId ? childName : undefined,
      }));

      console.log('📤 Envoi au backend...');

      // 4. Envoyer au backend avec timeout
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          setLoading(false);
          Alert.alert('Erreur', 'Timeout - Pas de réponse du serveur');
          resolve({ success: false, message: 'Timeout' });
        }, 10000);

        socketRef.current.emit(
          'start-simulation-with-route',
          {
            busId,
            trajetId,
            routePoints,
            stops: formattedStops,
            simulationSpeed: speed,
          },
          (response) => {
            clearTimeout(timeout);
            setLoading(false);
            console.log('📨 Réponse backend:', response);
            
            if (response?.success) {
              joinBusRoom(busId);
              Alert.alert('Succès', 'Simulation démarrée');
              resolve({ success: true, data: response });
            } else {
              const errorMsg = response?.message || 'Erreur inconnue';
              console.error('❌ Erreur backend:', errorMsg);
              setError(errorMsg);
              Alert.alert('Erreur', errorMsg);
              resolve({ success: false, message: errorMsg });
            }
          }
        );
      });

    } catch (error) {
      setLoading(false);
      console.error('❌ Erreur démarrage simulation:', error);
      setError(error.message);
      Alert.alert('Erreur', error.message);
      return { success: false, message: error.message };
    }
  }, []);

  // Rejoindre une room
  const joinBusRoom = useCallback((busId) => {
    if (!socketRef.current?.connected) {
      console.error('❌ Non connecté pour rejoindre room');
      setError('Non connecté au serveur');
      return;
    }

    console.log(`🤝 Tentative de rejoindre room bus ${busId}`);
    
    socketRef.current.emit('join-bus', { busId }, (response) => {
      console.log(`📨 Réponse join-bus:`, response);
      if (response?.success) {
        console.log(`✅ Rejoint room bus ${busId}`);
        currentBusIdRef.current = busId;
      } else {
        const errorMsg = response?.message || 'Erreur inconnue';
        console.error(`❌ Erreur join-bus:`, errorMsg);
        setError(errorMsg);
      }
    });
  }, []);

  // Quitter une room
  const leaveBusRoom = useCallback((busId) => {
    if (!socketRef.current?.connected) {
      console.log('⚠️ Non connecté, pas besoin de quitter room');
      return;
    }

    socketRef.current.emit('leave-bus', { busId }, (response) => {
      console.log(`👋 Quitté room bus ${busId}:`, response);
      if (currentBusIdRef.current === busId) {
        currentBusIdRef.current = null;
      }
    });
  }, []);

  // Arrêter la simulation
  const stopSimulation = useCallback((busId) => {
    if (!socketRef.current?.connected) {
      console.error('❌ Non connecté pour arrêter simulation');
      return;
    }

    console.log(`🛑 Arrêt simulation bus ${busId}`);
    
    socketRef.current.emit('stop-simulation', { busId }, (response) => {
      console.log(`📨 Réponse stop-simulation:`, response);
      if (response?.success) {
        Alert.alert('Succès', 'Simulation arrêtée');
      } else {
        Alert.alert('Erreur', response?.message || 'Erreur inconnue');
      }
    });
  }, []);

  // Changer la vitesse
  const changeSpeed = useCallback((busId, speedMultiplier) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('change-simulation-speed', 
      { busId, speedMultiplier },
      (response) => {
        console.log('⚡ Réponse change-speed:', response);
      }
    );
  }, []);

  // Pause/reprise
  const togglePause = useCallback((busId) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('toggle-simulation-pause', 
      { busId },
      (response) => {
        console.log('⏸️ Réponse toggle-pause:', response);
      }
    );
  }, []);

  // Récupérer le statut
  const getStatus = useCallback((busId) => {
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('get-simulation-status', { busId }, (response) => {
      console.log('📊 Statut reçu:', response);
      if (response?.success) {
        setSimulationStatus(response.status);
      }
    });
  }, []);

  // Déconnexion
  const disconnect = useCallback(() => {
    console.log('🔌 Déconnexion WebSocket');
    
    if (socketRef.current) {
      if (currentBusIdRef.current) {
        leaveBusRoom(currentBusIdRef.current);
      }
      
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsSimulationActive(false);
    setBusPosition(null);
    setSimulationStatus(null);
    setNextStopInfo(null);
    setSimulationSpeed(1);
    currentBusIdRef.current = null;
  }, [leaveBusRoom]);

  // Effet de montage
  useEffect(() => {
    console.log('🎬 Montage hook useBusSimulation');
    connect();
    
    return () => {
      console.log('🧹 Nettoyage hook useBusSimulation');
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // État
    isConnected,
    isSimulationActive,
    busPosition,
    simulationStatus,
    loading,
    error,
    simulationSpeed,
    nextStopInfo, // EXPOSER nextStopInfo
    currentBusId: currentBusIdRef.current,
    
    // Actions
    connect,
    disconnect,
    startSimulation,
    stopSimulation,
    joinBusRoom,
    leaveBusRoom,
    getStatus,
    changeSpeed,
    togglePause,
    triggerLocalNotification,
    getNotificationTitle,
    
    // Utilitaires
    reconnect: connect,
    clearError: () => setError(null),
  };
};