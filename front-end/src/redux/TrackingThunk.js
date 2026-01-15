// front-end/src/redux/TrackingThunk.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import trackingService from '../services/trackingService';
import {
  setLoading,
  setError,
  setSchools,
  setChildren,
  setChildTracking,
  setMarkers,
  setPolylines,
  setMapRegion, // <-- AJOUTER CET IMPORT
  setSelectedChild,
} from './TrackingSlice';

import { getRealisticRoute } from '../services/routeService';

export const fetchTrackingSummary = createAsyncThunk(
  'tracking/summary',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await trackingService.getTrackingSummary();

      if (result.success) {
        dispatch(setSchools(result.data.schools || []));
        dispatch(setChildren(result.data.children || []));
        
        // Calculer la région de la carte basée sur les écoles
        if (result.data.schools && result.data.schools.length > 0) {
          const schoolsWithCoords = result.data.schools.filter(
            school => school.latitude && school.longitude
          );
          
          if (schoolsWithCoords.length > 0) {
            const latitudes = schoolsWithCoords.map(s => s.latitude);
            const longitudes = schoolsWithCoords.map(s => s.longitude);
            
            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);
            
            const latitude = (minLat + maxLat) / 2;
            const longitude = (minLng + maxLng) / 2;
            const latitudeDelta = (maxLat - minLat) * 1.5 + 0.01;
            const longitudeDelta = (maxLng - minLng) * 1.5 + 0.01;
            
            dispatch(setMapRegion({
              latitude,
              longitude,
              latitudeDelta,
              longitudeDelta,
            }));
          }
        }
        
        return result.data;
      } else {
        dispatch(setError(result.error));
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error('Fetch tracking summary error:', error);
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchChildTracking = createAsyncThunk(
  'tracking/child',
  async (childId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const result = await trackingService.getChildTracking(childId);
      console.log('Résultat tracking:', result);

      if (result.success) {
        const data = result.data || result.data?.child || result;
        console.log('Données reçues:', data);
        
        dispatch(setChildTracking(data));
       
        
        // Préparer les marqueurs
        const markers = [];
        const polylines = [];
        
        // 1. Ajouter l'arrêt de l'enfant
        if (data.child && data.child.stop) {
          markers.push({
            id: 'child-stop',
            coordinate: {
              latitude: data.child.stop.latitude,
              longitude: data.child.stop.longitude,
            },
            title: 'Arrêt de ' + data.child.name,
            description: data.child.stop.address,
            type: 'child-stop',
            color: '#FF9800',
          });
        }
        
        // 2. Traiter les arrêts du trajet
        if (data.route && data.route.stops) {
          // Filtrer et trier les arrêts
          const allStops = data.route.stops
            .filter(stop => stop.latitude && stop.longitude)
            .sort((a, b) => a.order - b.order);
          
          console.log('Arrêts à traiter:', allStops.length);
          
          // 3. GÉNÉRER LE TRAJET RÉALISTE AVEC OPENROUTESERVICE
          if (allStops.length > 1) {
            // Préparer les coordonnées pour le routage
            const routingPoints = allStops.map(stop => ({
              latitude: stop.latitude,
              longitude: stop.longitude
            }));
            
            console.log('🚀 Génération du trajet avec OpenRouteService');
            console.log('📍 Points:', routingPoints);
            
            // Appeler le service de routage (SANS CACHE)
            const realisticRoute = await getRealisticRoute(routingPoints);
            
            console.log('✅ Trajet généré:', realisticRoute.length, 'points');
            
            // Créer la polyligne du trajet
            polylines.push({
              id: 'bus-route',
              coordinates: realisticRoute,
              color: '#2196F3',
              width: 4,
              strokeWidth: 4,
            });
            
            // 4. Ajouter les marqueurs pour chaque arrêt
            allStops.forEach((stop, index) => {
              const isSchool = stop.id <= 0;
              
              markers.push({
                id: `stop-${stop.id}`,
                coordinate: {
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                },
                title: isSchool ? (data.school?.name || 'École') : `Arrêt ${index + 1}`,
                description: stop.address,
                type: isSchool ? 'school' : 'stop',
                color: isSchool ? '#4CAF50' : '#9C27B0',
                order: index + 1,
                isChildStop: stop.id === data.child?.stop?.id
              });
            });
          }
        }
        
        // 5. Ajouter l'école comme marqueur si présente
        if (data.school && data.school.latitude && data.school.longitude) {
          const schoolExists = markers.some(m => m.type === 'school');
          
          if (!schoolExists) {
            markers.push({
              id: 'school',
              coordinate: {
                latitude: data.school.latitude,
                longitude: data.school.longitude,
              },
              title: data.school.name,
              description: data.school.address,
              type: 'school',
              color: '#4CAF50',
            });
          }
        }
        
        console.log('📍 Marqueurs créés:', markers.length);
        console.log('🔄 Polylignes créées:', polylines.length);
        
        dispatch(setMarkers(markers));
        dispatch(setPolylines(polylines));
        
        // 6. Ajuster la région de la carte
        if (markers.length > 0) {
          const latitudes = markers.map(m => m.coordinate.latitude);
          const longitudes = markers.map(m => m.coordinate.longitude);
          
          const minLat = Math.min(...latitudes);
          const maxLat = Math.max(...latitudes);
          const minLng = Math.min(...longitudes);
          const maxLng = Math.max(...longitudes);
          
          // Calculer avec une marge de 20%
          const latPadding = (maxLat - minLat) * 0.2;
          const lngPadding = (maxLng - minLng) * 0.2;
          
          dispatch(setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: (maxLat - minLat) + latPadding,
            longitudeDelta: (maxLng - minLng) + lngPadding,
          }));
        }
        
        return data;
      } else {
        dispatch(setError(result.error || 'Erreur inconnue'));
        return rejectWithValue(result.error);
      }
    } catch (error) {
      console.error('Erreur fetchChildTracking:', error);
      dispatch(setError(error.message));
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const clearTracking = createAsyncThunk(
  'tracking/clear',
  async (_, { dispatch }) => {
    dispatch(setChildTracking(null));
    dispatch(setMarkers([]));
    dispatch(setPolylines([]));
    // Réinitialiser la région de la carte aux écoles
    dispatch(setMapRegion({
      latitude: 33.5731,
      longitude: -7.5898,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }));
  }
);

export { setSelectedChild, setMapRegion, setMarkers, setPolylines };