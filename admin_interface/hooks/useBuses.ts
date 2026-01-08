import { useState, useEffect } from 'react';
import busService, { Bus, CreateBusData, BusesResponse } from '@/services/api/buses';

export const useBuses = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<BusesResponse['meta'] | null>(null);

  // Fonction pour récupérer tous les bus
  const fetchBuses = async (page = 1, perPage = 10) => {
    try {
      setLoading(true);
      const response = await busService.getAllBuses(page, perPage);
      setBuses(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      // Gestion des erreurs selon le type d'erreur
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.response?.status === 403) {
        setError('Vous n\'avez pas les permissions nécessaires.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error.message || 'Erreur serveur');
      } else if (err.message === 'Network Error') {
        setError('Impossible de se connecter au serveur');
      } else {
        setError('Erreur lors de la récupération des bus');
      }
      console.error('Erreur fetchBuses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un nouveau bus
  const createBus = async (data: CreateBusData) => {
    try {
      setLoading(true);
      const response = await busService.createBus(data);
      
      // Rafraîchir la liste après création
      await fetchBuses();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus créé avec succès'
      };
    } catch (err: any) {
      // Gestion détaillée des erreurs de création
      let errorMessage = 'Erreur lors de la création du bus';
      
      if (err.response?.data?.errors) {
        // Erreurs de validation du backend
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'Un bus avec cette plaque d\'immatriculation existe déjà';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour un bus
  const updateBus = async (id: number, data: Partial<CreateBusData>) => {
    try {
      setLoading(true);
      const response = await busService.updateBus(id, data);
      
      // Mettre à jour localement sans refetch
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.id === id ? { 
            ...bus, 
            ...data,
            // Assurer que la photo_url reste intacte si non modifiée
            photo_url: 'photo' in data ? response.data.photo_url : bus.photo_url
          } : bus
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus mis à jour avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la mise à jour du bus';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un bus
  const deleteBus = async (id: number) => {
    try {
      setLoading(true);
      const response = await busService.deleteBus(id);
      
      // Mettre à jour localement
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== id));
      
      return { 
        success: true, 
        message: response.message || 'Bus supprimé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression du bus';
      
      if (err.response?.status === 404) {
        errorMessage = 'Bus non trouvé';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'Impossible de supprimer ce bus car il est affecté à des trajets';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour affecter un bus à une école
  const assignToSchool = async (busId: number, schoolId: number) => {
    try {
      setLoading(true);
      const response = await busService.assignToSchool(busId, schoolId);
      
      // Mettre à jour le bus localement
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.id === busId 
            ? { 
                ...bus, 
                school_id: schoolId,
                school: response.data.school // Mettre à jour les infos de l'école
              } 
            : bus
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus affecté à l\'école avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de l\'affectation du bus';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour désaffecter un bus d'une école
  const unassignFromSchool = async (busId: number) => {
    try {
      setLoading(true);
      const response = await busService.unassignFromSchool(busId);
      
      // Mettre à jour le bus localement
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.id === busId 
            ? { 
                ...bus, 
                school_id: undefined,
                school: undefined
              } 
            : bus
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus désaffecté de l\'école avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la désaffectation du bus';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut
  const updateStatus = async (busId: number, is_active: boolean) => {
    try {
      setLoading(true);
      const response = await busService.updateStatus(busId, is_active ? 'active' : 'inactive');
      
      // Mettre à jour le bus localement
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus.id === busId 
            ? { ...bus, is_active } 
            : bus
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Statut du bus mis à jour avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la mise à jour du statut';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer un bus par son ID
  const getBusById = async (id: number) => {
    try {
      setLoading(true);
      const response = await busService.getBusById(id);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la récupération du bus';
      
      if (err.response?.status === 404) {
        errorMessage = 'Bus non trouvé';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser les erreurs
  const clearError = () => {
    setError(null);
  };

  // Chargement initial des données
  useEffect(() => {
    fetchBuses();
  }, []);

  return {
    // Données
    buses,
    loading,
    error,
    meta,
    
    // Méthodes CRUD
    fetchBuses,
    createBus,
    updateBus,
    deleteBus,
    getBusById,
    
    // Méthodes de gestion
    assignToSchool,
    unassignFromSchool,
    updateStatus,
    clearError,
    
    // Méthodes utilitaires
    getActiveBuses: () => buses.filter(bus => bus.is_active),
    getInactiveBuses: () => buses.filter(bus => !bus.is_active),
    getBusesBySchool: (schoolId: number) => 
      buses.filter(bus => bus.school_id === schoolId),
    getAvailableBuses: () => 
      buses.filter(bus => bus.is_active && !bus.school_id),
    getBusesWithPhoto: () => 
      buses.filter(bus => bus.photo_url),
    getBusesWithoutPhoto: () => 
      buses.filter(bus => !bus.photo_url),
  };
};