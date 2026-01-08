// hooks/useSchools.ts
import { useState, useEffect } from 'react';
import schoolService, { School, SchoolsResponse } from '../services/api/schools';

export const useSchools = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<SchoolsResponse['meta'] | null>(null);

  const fetchSchools = async (page = 1, perPage = 10) => {
    try {
      setLoading(true);
      const response = await schoolService.getAllSchools(page, perPage);
      setSchools(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération des écoles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (data: any) => {
    try {
      setLoading(true);
      const response = await schoolService.createSchool(data);
      console.log(response)
      await fetchSchools(); // Rafraîchir la liste
      return { success: true, data: response.data };
    } catch (err: any) {
      const error = err.response?.data?.error || err.response?.data;
      return { 
        success: false, 
        error: error?.message || 'Erreur lors de la création'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateSchool = async (id: number, data: any) => {
    try {
      setLoading(true);
      const response = await schoolService.updateSchool(id, data);
      await fetchSchools();
      return { success: true, data: response.data };
    } catch (err: any) {
      const error = err.response?.data?.error || err.response?.data;
      return { 
        success: false, 
        error: error?.message || 'Erreur lors de la modification'
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteSchool = async (id: number) => {
    try {
      setLoading(true);
      await schoolService.deleteSchool(id);
      await fetchSchools();
      return { success: true };
    } catch (err: any) {
      const error = err.response?.data?.error || err.response?.data;
      return { 
        success: false, 
        error: error?.message || 'Erreur lors de la suppression'
      };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  return {
    schools,
    loading,
    error,
    meta,
    fetchSchools,
    createSchool,
    updateSchool,
    deleteSchool,
  };
};