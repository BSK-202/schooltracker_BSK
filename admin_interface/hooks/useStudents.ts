import { useState, useEffect, useCallback } from 'react';
import studentService, { 
  Student, 
  CreateStudentData, 
  UpdateStudentData, 
  StudentsResponse,
} from '@/services/api/students';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<StudentsResponse['meta'] | null>(null);

  const fetchStudents = useCallback(async (
    page = 1, 
    perPage = 10
  ) => {
    try {
      setLoading(true);
      const response = await studentService.getAllStudents(page, perPage);
      setStudents(response.data);
      setMeta(response.meta);
      setError(null);
    } catch (err: any) {
      handleError(err, 'Erreur lors de la récupération des élèves');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = async (data: CreateStudentData) => {
    try {
      setLoading(true);
      const response = await studentService.createStudent(data);
      
      await fetchStudents();
      
      return { 
        success: true, 
        data: response.data,
        message: 'Élève créé avec succès'
      };
    } catch (err: any) {
      return handleOperationError(err, 'Erreur lors de la création de l\'élève');
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: number, data: UpdateStudentData) => {
    try {
      setLoading(true);
      const response = await studentService.updateStudent(id, data);
      
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === id ? { 
            ...student, 
            ...data,
          } : student
        )
      );
      
      return { 
        success: true, 
        data: response.data,
        message: 'Élève mis à jour avec succès'
      };
    } catch (err: any) {
      return handleOperationError(err, 'Erreur lors de la mise à jour de l\'élève');
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      setLoading(true);
      const response = await studentService.deleteStudent(id);
      
      setStudents(prevStudents => prevStudents.filter(student => student.id !== id));
      
      return { 
        success: true, 
        message: response.message || 'Élève supprimé avec succès'
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la suppression de l\'élève';
      
      if (err.response?.status === 404) {
        errorMessage = 'Élève non trouvé';
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

  const getStudentById = async (id: number) => {
    try {
      setLoading(true);
      const response = await studentService.getStudentById(id);
      return { 
        success: true, 
        data: response.data 
      };
    } catch (err: any) {
      let errorMessage = 'Erreur lors de la récupération de l\'élève';
      
      if (err.response?.status === 404) {
        errorMessage = 'Élève non trouvé';
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

  const searchStudents = async (query: string) => {
    try {
      setLoading(true);
      const response = await studentService.searchStudents(query);
      setStudents(response.data);
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
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  };

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    meta,
    
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    searchStudents,
    clearError,
  };
};
