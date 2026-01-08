// hooks/useStops.ts
import { useState, useCallback } from 'react';
import stopService, { 
  Stop, 
  CreateStopData, 
  UpdateStopData 
} from '@/services/api/stops';

export const useStops = () => {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupérer tous les arrêts
   */
  const fetchStops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stopService.getAllStops();
      setStops(response.data);
      
      return { success: true, data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des arrêts';
      setError(errorMessage);
      console.error('Erreur fetchStops:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer un nouvel arrêt
   */
  const createStop = async (data: CreateStopData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stopService.createStop(data);
      
      // Rafraîchir la liste
      await fetchStops();
      
      return {
        success: true,
        data: response.data,
        message: 'Arrêt créé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la création de l\'arrêt';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour un arrêt
   */
  const updateStop = async (id: number, data: UpdateStopData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stopService.updateStop(id, data);
      
      // Mettre à jour localement
      setStops(prevStops =>
        prevStops.map(stop =>
          stop.id === id ? { ...stop, ...response.data } : stop
        )
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Arrêt mis à jour avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la mise à jour de l\'arrêt';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer un arrêt
   */
  const deleteStop = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stopService.deleteStop(id);
      
      // Supprimer localement
      setStops(prevStops => prevStops.filter(stop => stop.id !== id));
      
      return {
        success: true,
        message: response.message || 'Arrêt supprimé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression de l\'arrêt';
      
      if (err.response?.status === 404) {
        errorMessage = 'Arrêt non trouvé';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Géocoder une adresse
   */
  const geocodeAddress = async (address: string) => {
    try {
      const coords = await stopService.geocodeAddress(address);
      return { success: true, data: coords };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du géocodage';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Reverse géocoder des coordonnées
   */
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const address = await stopService.reverseGeocode(lat, lng);
      return { success: true, data: address };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du géocodage inversé';
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Extraire les coordonnées d'un arrêt
   */
  const getStopCoordinates = (stop: Stop) => {
    if (stop.geom?.coordinates) {
      const [lng, lat] = stop.geom.coordinates;
      return { lat, lng };
    }
    return { lat: 0, lng: 0 };
  };

  /**
   * Réinitialiser les erreurs
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Préparer les données pour la carte
   */
  const getStopsForMap = () => 
    stops.map((stop, index) => {
      const coords = getStopCoordinates(stop);
      return {
        id: stop.id,
        position: [coords.lat, coords.lng] as [number, number],
        address: stop.address,
        order: index + 1
      };
    });

  return {
    // État
    stops,
    loading,
    error,

    // Méthodes CRUD
    fetchStops,
    createStop,
    updateStop,
    deleteStop,

    // Méthodes de géocodage
    geocodeAddress,
    reverseGeocode,

    // Méthodes utilitaires
    getStopCoordinates,
    getStopsForMap,
    clearError,
    getTotalStops: () => stops.length
  };
};