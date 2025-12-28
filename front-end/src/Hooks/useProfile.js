// hooks/useProfile.js
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import authService from "../services/authService";

export const useProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    child: '',
    bus: '',
    role: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer les infos profil
  const getInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Récupération du profil...');
      const response = await authService.profile();
      
      console.log('Profil reçu:', response.data.profil);
      setUserData(response.data.profil);
      
      return response.data.profil; // Retourner les données
    } catch (error) {
      console.error('Erreur dans getInfo:', error);
      setError(error.message);
      
      Alert.alert(
        "Erreur", 
        "Erreur lors de la récupération des informations"
      );
      throw error; // Propager l'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les infos une seule fois au montage
  const fetchProfileOnce = useCallback(async () => {
    // Ne récupérer que si pas déjà chargé
    if (!userData.name && !loading) {
      return await getInfo();
    }
    return userData;
  }, [userData, loading, getInfo]);

  return {
    // Données
    userData,
    
    // État
    loading,
    error,
    
    // Méthodes
    getInfo,
    fetchProfileOnce,
    
    // Setters
    setUserData,
  };
};