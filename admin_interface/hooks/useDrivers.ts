import { useState, useEffect } from 'react';
import driverService, { Driver, CreateDriverData, DriversResponse } from '@/services/api/drivers';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<DriversResponse['meta'] | null>(null);

  const fetchDrivers = async (
    page = 1, 
    perPage = 10, 
    hasAssignedBus?: boolean
  ) => {
    try {
      setLoading(true);
      const response = await driverService.getAllDrivers(page, perPage, hasAssignedBus);
      setDrivers(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.response?.status === 403) {
        setError('Vous n\'avez pas les permissions nécessaires.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error.message || 'Erreur serveur');
      } else if (err.message === 'Network Error') {
        setError('Impossible de se connecter au serveur');
      } else {
        setError('Erreur lors de la récupération des chauffeurs');
      }
      console.error('Erreur fetchDrivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDriver = async (data: CreateDriverData) => {
    try {
      setLoading(true);
      const response = await driverService.createDriver(data);
      
      await fetchDrivers();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Chauffeur créé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la création du chauffeur';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'Ce nom d\'utilisateur est déjà utilisé';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateDriver = async (id: number, data: Partial<CreateDriverData>) => {
    try {
      setLoading(true);
      const response = await driverService.updateDriver(id, data);
      
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === id ? { 
            ...driver, 
            ...data 
          } : driver
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Chauffeur mis à jour avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la mise à jour du chauffeur';
      
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

  const deleteDriver = async (id: number) => {
    try {
      setLoading(true);
      const response = await driverService.deleteDriver(id);
      
      setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
      
      return { 
        success: true, 
        message: response.message || 'Chauffeur supprimé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression du chauffeur';
      
      if (err.response?.status === 404) {
        errorMessage = 'Chauffeur non trouvé';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'Impossible de supprimer ce chauffeur car il est affecté à un bus';
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const assignBus = async (driverId: number, busId: number) => {
    try {
      setLoading(true);
      const response = await driverService.assignBus(driverId, busId);
      
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === driverId 
            ? { 
                ...driver, 
                assignedBus: response.data.assignedBus
              } 
            : driver
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus affecté avec succès'
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

  const unassignBus = async (driverId: number) => {
    try {
      setLoading(true);
      const response = await driverService.unassignBus(driverId);
      
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver.id === driverId 
            ? { 
                ...driver, 
                assignedBus: undefined
              } 
            : driver
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Bus désaffecté avec succès'
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

  const getDriverById = async (id: number) => {
    try {
      setLoading(true);
      const response = await driverService.getDriverById(id);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la récupération du chauffeur';
      
      if (err.response?.status === 404) {
        errorMessage = 'Chauffeur non trouvé';
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

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return {
    drivers,
    loading,
    error,
    meta,
    
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    getDriverById,
    
    assignBus,
    unassignBus,
    clearError,
    
 
  };
};