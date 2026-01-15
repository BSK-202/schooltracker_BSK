import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { fetchUserProfile } from '../redux/AuthThunk';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const { profile, user } = useSelector((state) => state.auth);

  // Récupérer les infos profil via Redux
  const getInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile via thunk...');
      const result = await dispatch(fetchUserProfile()).unwrap();
      
      console.log('Profile fetched:', result);
      return result;
    } catch (error) {
      console.error('Error in getInfo:', error);
      setError(error.message);
      
      Alert.alert(
        "Erreur", 
        "Erreur lors de la récupération des informations"
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchProfileOnce = useCallback(async () => {
    if (!profile && !loading) {
      return await getInfo();
    }
    return profile;
  }, [profile, loading, getInfo]);

  return {
    userData: profile?.profil || user || {},
    loading,
    error,
    getInfo,
    fetchProfileOnce,
  };
};