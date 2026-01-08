// hooks/useRoutes.ts
import { useState, useCallback } from 'react';
import routeService, { 
  Route, 
  RouteDetail,
  CreateRouteData, 
  UpdateRouteData,
  RoutesResponse,
  RouteResponse
} from '@/services/api/routes';
import { useStops } from './useStops';

export interface FormattedStop {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
  scheduled_time?: string;
  order?: number;
}

export interface FormattedRoute {
  id: number;
  name: string;
  type: 'PICKUP' | 'DROPOFF';
  is_active: boolean;
  scheduledStart: string;
  scheduledEnd: string;
  school: {
    id: number;
    name: string;
    address: string;
  };
  stopsCount: number;
  studentsCount?: number;
  estimatedDuration: string;
  currentStatus: string;
  bus: {
    id: number;
    licence_plate: string;
    capacity: number;
  };
  stops: FormattedStop[];
  path: [number, number][]; // Pour le tracé de la ligne
}

export const useRoutes = () => {
  const [routes, setRoutes] = useState<FormattedRoute[]>([]);
  const [currentRoute, setCurrentRoute] = useState<FormattedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    perPage: 10
  });

  const stopsHook = useStops();

  /**
   * Formater une route API en format frontend
   */
  const formatRoute = useCallback(async (route: Route | RouteDetail): Promise<FormattedRoute> => {
    // Formater les horaires
    const formatTime = (timeString: string) => {
      return timeString.substring(0, 5); // Convertir "07:00:00" en "07:00"
    };

    // Extraire et formater les arrêts
    let stops: FormattedStop[] = [];
    let path: [number, number][] = [];
    
    if ('stops' in route && route.stops && Array.isArray(route.stops)) {
      // Récupérer les coordonnées depuis geom.coordinates [lng, lat]
      stops = route.stops.map((stop, index) => {
        // Votre API retourne: coordinates: [longitude, latitude]
        const lng = stop.geom?.coordinates?.[0] || 0;
        const lat = stop.geom?.coordinates?.[1] || 0;
        
        // Ajouter au chemin pour la carte
        if (lat !== 0 && lng !== 0) {
          path.push([lat, lng]);
        }
        
        return {
          id: stop.id,
          name: stop.address.split(',')[0] || stop.address || `Arrêt ${index + 1}`,
          lat: lat,
          lng: lng,
          address: stop.address || '',
          order: index + 1
        };
      }).filter(stop => stop.lat !== 0 && stop.lng !== 0); // Filtrer les arrêts sans coordonnées
    }

    // Si pas d'arrêts ou arrêts invalides, ajouter des données par défaut
    if (stops.length === 0) {
      const defaultLat = 33.5731;
      const defaultLng = -7.5898;
      stops = [{
        id: 0,
        name: 'École',
        lat: defaultLat,
        lng: defaultLng,
        address: route.bus.school.address,
        order: 1
      }];
      path = [[defaultLat, defaultLng]];
    }

    return {
      id: route.id,
      name: route.nom,
      type: route.type,
      is_active: route.is_actif,
      scheduledStart: formatTime(route.heure_debut),
      scheduledEnd: formatTime(route.heure_fin),
      school: {
        id: route.bus.school.id,
        name: route.bus.school.nom,
        address: route.bus.school.address
      },
      stopsCount: route.nombre_arrets || stops.length,
      estimatedDuration: route.duree_estimee,
      currentStatus: route.is_actif ? 'Actif' : 'Inactif',
      bus: {
        id: route.bus.id,
        licence_plate: route.bus.licence_plate,
        capacity: route.bus.capacity || 0
      },
      stops,
      path
    };
  }, []);

  /**
   * Récupérer toutes les routes
   */
  const fetchRoutes = useCallback(async (page = 1, perPage = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: RoutesResponse = await routeService.getAllRoutes(page, perPage);
      
      // Formater chaque route
      const formattedRoutes = await Promise.all(
        response.data.map(route => formatRoute(route))
      );
      
      setRoutes(formattedRoutes);
      setPagination({
        total: response.meta?.total || 0,
        page,
        perPage
      });
      
      return { success: true, data: formattedRoutes };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération des routes';
      setError(errorMessage);
      console.error('Erreur fetchRoutes:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formatRoute]);

  /**
   * Récupérer une route par ID
   */
  const fetchRouteById = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: RouteResponse = await routeService.getRouteById(id);
      const formattedRoute = await formatRoute(response.data);
      
      setCurrentRoute(formattedRoute);
      return { success: true, data: formattedRoute };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la récupération de la route';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formatRoute]);

  /**
   * Créer une nouvelle route
   */
  const createRoute = async (data: CreateRouteData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: RouteResponse = await routeService.createRoute(data);
      
      // Rafraîchir la liste
      await fetchRoutes(pagination.page, pagination.perPage);
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la création de la route';
      
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
   * Mettre à jour une route
   */
  const updateRoute = async (id: number, data: UpdateRouteData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: RouteResponse = await routeService.updateRoute(id, data);
      
      // Mettre à jour localement
      const updatedRoute = await formatRoute(response.data);
      setRoutes(prevRoutes =>
        prevRoutes.map(route =>
          route.id === id ? updatedRoute : route
        )
      );
      
      if (currentRoute?.id === id) {
        setCurrentRoute(updatedRoute);
      }
      
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la mise à jour de la route';
      
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
   * Supprimer une route
   */
  const deleteRoute = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await routeService.deleteRoute(id);
      
      // Supprimer localement
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      return {
        success: true,
        message: response.message
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression de la route';
      
      if (err.response?.status === 404) {
        errorMessage = 'Route non trouvée';
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
   * Activer/Désactiver une route
   */
  const toggleRouteStatus = async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: RouteResponse = await routeService.toggleRouteStatus(id, isActive);
      
      // Mettre à jour localement
      const updatedRoute = await formatRoute(response.data);
      setRoutes(prevRoutes =>
        prevRoutes.map(route =>
          route.id === id ? updatedRoute : route
        )
      );
      
      return {
        success: true,
        data: updatedRoute,
        message: response.message
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du changement de statut';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Préparer les données pour la création
   */
  const prepareCreateData = (formData: any): CreateRouteData => {
    return {
      busId: parseInt(formData.bus),
      nom: formData.routeName,
      type: formData.type,
      heure_debut: `${formData.startTime}:00`,
      heure_fin: `${formData.endTime}:00`,
      is_actif: true,
      stops: formData.stops.map((stop: any, index: number) => ({
        stopId: stop.id || 0,
        scheduled_time: stop.scheduled_time ? `${stop.scheduled_time}:00` : `${formData.startTime}:00`
      }))
    };
  };

  /**
   * Réinitialiser les erreurs
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Réinitialiser la route courante
   */
  const clearCurrentRoute = () => {
    setCurrentRoute(null);
  };

  return {
    // État
    routes,
    currentRoute,
    loading,
    error,
    pagination,

    // Méthodes CRUD
    fetchRoutes,
    fetchRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    toggleRouteStatus,

    // Méthodes utilitaires
    prepareCreateData,
    clearError,
    clearCurrentRoute,
    setCurrentRoute
  };
};