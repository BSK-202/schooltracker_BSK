// front-end/src/services/trackingService.js
import trackingApi from '../APIS/trackingApi';

const trackingService = {
  // Récupérer le résumé de tracking
  getTrackingSummary: async () => {
    try {
      const response = await trackingApi.get('/tracking/summary');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Tracking Service - Summary error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des données de tracking',
      };
    }
  },

  // Récupérer les écoles des enfants
  getSchools: async () => {
    try {
      const response = await trackingApi.get('/tracking/schools');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Tracking Service - Schools error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des écoles',
      };
    }
  },

  // Récupérer tous les enfants
  getChildren: async () => {
    try {
      const response = await trackingApi.get('/tracking/children');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Tracking Service - Children error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la récupération des enfants',
      };
    }
  },

  // Récupérer les détails de tracking d'un enfant
  // Dans trackingService.js, modifiez getChildTracking :
getChildTracking: async (childId) => {
  try {
    const response = await trackingApi.get(`/tracking/child/${childId}`);
    console.log('Child tracking response:', response.data); // <-- AJOUTER CE LOG
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Tracking Service - Child tracking error:', error);
    console.error('Error details:', error.response?.data); // <-- AJOUTER CE LOG
    
    return {
      success: false,
      error: error.response?.data?.message || 'Erreur lors de la récupération des informations de tracking',
    };
  }
},
};

export default trackingService;