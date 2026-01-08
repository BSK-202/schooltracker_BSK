import { useState, useEffect, useCallback } from 'react';
import parentService, { 
  Parent, 
  CreateParentData, 
  UpdateParentData, 
  ParentsResponse,
} from '@/services/api/parents';

export const useParents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ParentsResponse['meta'] | null>(null);

  const fetchParents = useCallback(async (
    page = 1, 
    perPage = 10
  ) => {
    try {
      setLoading(true);
      const response = await parentService.getAllParents(page, perPage);
      setParents(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      handleError(err, 'Erreur lors de la récupération des parents');
    } finally {
      setLoading(false);
    }
  }, []);

  const createParent = async (data: CreateParentData) => {
    try {
      setLoading(true);
      const response = await parentService.createParent(data);
      
      await fetchParents();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Parent créé avec succès'
      };
    } catch (err: any) {
      return handleOperationError(err, 'Erreur lors de la création du parent');
    } finally {
      setLoading(false);
    }
  };

  const updateParent = async (id: number, data: UpdateParentData) => {
    try {
      setLoading(true);
      const response = await parentService.updateParent(id, data);
      
      setParents(prevParents => 
        prevParents.map(parent => 
          parent.id === id ? { 
            ...parent, 
            ...data,
          } : parent
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Parent mis à jour avec succès'
      };
    } catch (err: any) {
      return handleOperationError(err, 'Erreur lors de la mise à jour du parent');
    } finally {
      setLoading(false);
    }
  };

  const deleteParent = async (id: number) => {
    try {
      setLoading(true);
      const response = await parentService.deleteParent(id);
      
      setParents(prevParents => prevParents.filter(parent => parent.id !== id));
      
      return { 
        success: true, 
        message: response.message || 'Parent supprimé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression du parent';
      
      if (err.response?.status === 404) {
        errorMessage = 'Parent non trouvé';
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

  const getParentById = async (id: number) => {
    try {
      setLoading(true);
      const response = await parentService.getParentById(id);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la récupération du parent';
      
      if (err.response?.status === 404) {
        errorMessage = 'Parent non trouvé';
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

  const searchParents = async (query: string) => {
    try {
      setLoading(true);
      const response = await parentService.searchParents(query);
      setParents(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      handleError(err, 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper functions
  const handleError = (err: any, defaultMessage: string) => {
    if (err.response?.status === 401) {
      setError('Session expirée. Veuillez vous reconnecter.');
    } else if (err.response?.status === 403) {
      setError('Vous n\'avez pas les permissions nécessaires.');
    } else if (err.response?.data?.error) {
      setError(err.response.data.error.message || 'Erreur serveur');
    } else if (err.message === 'Network Error') {
      setError('Impossible de se connecter au serveur');
    } else {
      setError(defaultMessage);
    }
    console.error('Erreur:', err);
  };

  const handleOperationError = (err: any, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      errorMessage = Object.values(errors).flat().join(', ');
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.status === 409) {
      errorMessage = 'Ce numéro de téléphone est déjà utilisé';
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  };

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  return {
    parents,
    loading,
    error,
    meta,
    
    fetchParents,
    createParent,
    updateParent,
    deleteParent,
    getParentById,
    searchParents,
    clearError,
  };
};