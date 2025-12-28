import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/Authslice';
import { tokenService } from '../services/tokenService';
import authService from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  });
  const dispatch = useDispatch();

  /**
   * Gestionnaire de connexion
   */
  const handleLogin = useCallback(async () => {
    // Validation
    if (!loginData.phone.trim() || !loginData.password.trim()) {
      setError('Le numéro de téléphone et le mot de passe sont requis');
      return { success: false, error: 'Champs requis manquants' };
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Tentative de connexion avec:', { phone: loginData.phone, password:loginData.password });
      
      // Appel au service d'authentification
      const result = await authService.login(loginData.phone, loginData.password);
      
      if (result.success && result.access_token && result.refresh_token) {
        // Stockage sécurisé du token
        await tokenService.setToken(result.access_token);
        await tokenService.setRefreshToken(result.refresh_token);

        // Dispatch Redux
        dispatch(loginSuccess(result.access_token));
        
        // Réinitialisation du formulaire
        setLoginData({ phone: '', password: '' });
        
        // Vérification du stockage (debug)
        const storedToken = await tokenService.getToken();
        console.log('Token stocké avec succès:', storedToken ? 'OUI' : 'NON');
        
        return { 
          success: true, 
          message: result.message,
          token: result.token 
        };
      }
      
      throw new Error('Réponse de connexion invalide');
      
    } catch (err) {
      console.error('Erreur de connexion dans useAuth:', err);
      
      const errorMessage = err.message || 'Numéro de téléphone ou mot de passe incorrect';
      setError(errorMessage);
      
      // Déconnexion Redux en cas d'erreur
      dispatch(logout());
      
      return { 
        success: false, 
        error: errorMessage,
        details: err.data 
      };
    } finally {
      setLoading(false);
    }
  }, [loginData, dispatch]);

  /**
   * Gestionnaire de déconnexion
   */
  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Suppression du token local
      await tokenService.clearAll();
      
      // Déconnexion Redux
      dispatch(logout());
      
      return { success: true, message: 'Déconnexion réussie' };
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  /**
   * Mettre à jour les champs de connexion
   */
  const updateLoginField = useCallback((field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Effacer l'erreur lorsqu'on commence à taper
    if (error) setError(null);
  }, [error]);

  /**
   * Réinitialiser le formulaire
   */
  const resetLoginForm = useCallback(() => {
    setLoginData({ phone: '', password: '' });
    setError(null);
  }, []);

  return {
    // État
    loginData,
    loading,
    error,
    
    // Méthodes
    handleLogin,
    handleLogout,
    updateLoginField,
    resetLoginForm,
    
    // Getters pratiques
    phone: loginData.phone,
    password: loginData.password,
    setPhone: (value) => updateLoginField('phone', value),
    setPassword: (value) => updateLoginField('password', value),
  };
};