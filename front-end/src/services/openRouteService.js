// front-end/src/services/openRouteService.js
export const getRouteFromOpenRouteService = async (coordinates) => {
  // VOTRE CLÉ API RÉELLE ICI
  const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImIzNGQ5NWJiM2Y5YTQ1MmRiMmUzZjBhYzE1MzBhNzk1IiwiaCI6Im11cm11cjY0In0=';
  
  console.log('='.repeat(60));
  console.log('🚀 OPENROUTESERVICE - DÉBUT');
  console.log('📍 Nombre de points:', coordinates.length);
  
  // Validation des coordonnées
  const validCoords = coordinates.filter((coord, i) => {
    const isValid = coord && 
                   typeof coord.latitude === 'number' && 
                   typeof coord.longitude === 'number' &&
                   !isNaN(coord.latitude) && 
                   !isNaN(coord.longitude);
    
    if (!isValid) {
      console.error(`❌ Point ${i} invalide:`, coord);
    }
    return isValid;
  });
  
  if (validCoords.length < 2) {
    console.error('❌ Pas assez de points valides');
    return generateFallbackRoute(coordinates);
  }
  
  // Formater pour l'API: [[lng, lat], [lng, lat], ...]
  const formattedCoords = validCoords.map(coord => [coord.longitude, coord.latitude]);
  
  console.log('📤 Points formatés pour API:', formattedCoords);
  
  // Corps de requête SIMPLE
  const requestBody = {
    coordinates: formattedCoords,
    instructions: false,
    geometry: true,
    format: 'geojson'
  };
  
  console.log('📦 Requête JSON:', JSON.stringify(requestBody));
  
  try {
    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
    
    console.log('🌐 Envoi à:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur OpenRouteService:', errorText);
      
      // Essayer de comprendre l'erreur
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Détails erreur:', JSON.stringify(errorJson, null, 2));
      } catch {
        console.error('❌ Erreur brute:', errorText);
      }
      
      return generateFallbackRoute(coordinates);
    }
    
    const data = await response.json();
    console.log('✅ Réponse reçue, features:', data.features?.length || 0);
    
    if (data.features && data.features.length > 0 && data.features[0].geometry) {
      const routeCoordinates = data.features[0].geometry.coordinates;
      console.log('🔄 Points dans le trajet:', routeCoordinates.length);
      
      // Convertir de [lng, lat] à {latitude, longitude}
      const convertedRoute = routeCoordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0]
      }));
      
      console.log('🎯 Trajet converti avec succès');
      return convertedRoute;
    } else {
      console.error('❌ Aucun trajet trouvé dans la réponse');
      return generateFallbackRoute(coordinates);
    }
  } catch (error) {
    console.error('💥 Erreur réseau:', error);
    return generateFallbackRoute(coordinates);
  }
};

// Fallback simplifié
const generateFallbackRoute = (coordinates) => {
  console.log('🔄 Utilisation du fallback');
  
  if (coordinates.length < 2) return coordinates;
  
  const route = [];
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    
    route.push(start);
    
    // Ajouter 5 points intermédiaires
    for (let j = 1; j <= 5; j++) {
      const t = j / 6;
      route.push({
        latitude: start.latitude + (end.latitude - start.latitude) * t,
        longitude: start.longitude + (end.longitude - start.longitude) * t
      });
    }
  }
  
  if (coordinates.length > 0) {
    route.push(coordinates[coordinates.length - 1]);
  }
  
  console.log('📏 Fallback généré:', route.length, 'points');
  return route;
};