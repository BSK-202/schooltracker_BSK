// front-end/src/services/routeService.js
import { getRouteFromOpenRouteService } from './openRouteService';

export const getRealisticRoute = async (coordinates) => {
  // Vérifier les paramètres
  if (!coordinates || coordinates.length < 2) {
    console.warn('Pas assez de points pour générer un trajet');
    return coordinates || [];
  }
  
  console.log('🚀 Appel DIRECT à OpenRouteService (sans cache)');
  console.log('📊 Points à router:', coordinates.length);
  
  try {
    // Appeler OpenRouteService directement
    const route = await getRouteFromOpenRouteService(coordinates);
    
    if (route && route.length > 1) {
      console.log('✅ Trajet généré avec succès:', route.length, 'points');
      return route;
    } else {
      console.warn('⚠️ Route vide reçue, utilisation du fallback');
      return generateStraightRoute(coordinates);
    }
  } catch (error) {
    console.error('❌ Erreur génération trajet:', error);
    
    // Fallback: ligne droite
    return generateStraightRoute(coordinates);
  }
};

// Générer une ligne droite simple
const generateStraightRoute = (coordinates) => {
  const route = [];
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    
    route.push(start);
    
    // Ajouter quelques points intermédiaires
    const numPoints = Math.max(3, Math.floor(calculateDistance(start, end) / 100));
    
    for (let j = 1; j <= numPoints; j++) {
      const t = j / (numPoints + 1);
      route.push({
        latitude: start.latitude + (end.latitude - start.latitude) * t,
        longitude: start.longitude + (end.longitude - start.longitude) * t
      });
    }
  }
  
  if (coordinates.length > 0) {
    route.push(coordinates[coordinates.length - 1]);
  }
  
  console.log('🔄 Fallback: ligne droite avec', route.length, 'points');
  return route;
};

// Calculer la distance approximative
const calculateDistance = (coord1, coord2) => {
  const R = 6371000; // Rayon de la Terre en mètres
  const lat1 = coord1.latitude * Math.PI / 180;
  const lat2 = coord2.latitude * Math.PI / 180;
  const dlat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dlng = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  
  const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dlng/2) * Math.sin(dlng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};