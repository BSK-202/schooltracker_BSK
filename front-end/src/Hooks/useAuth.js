import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, clearError } from '../redux/Authslice';
import { tokenService } from '../services/tokenService';
import { loginUser } from '../redux/AuthThunk';
import { usePushNotifications } from './usePushNotifications';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { loading, error, user, isAuthenticated } = useSelector((state) => state.auth);

  const { registerPushTokenAfterLogin } = usePushNotifications();

  // On ne garde le state local QUE si vraiment nécessaire
  // Alternative : le mettre dans le composant Login directement
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  // ────────────────────────────────────────────────
  // Login
  // ────────────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    // Validation minimale ici (ou la déplacer dans le composant)
    if (!formData.phone.trim()) {
      return { success: false, error: 'Le numéro de téléphone est requis' };
    }
    if (!formData.password.trim()) {
      return { success: false, error: 'Le mot de passe est requis' };
    }

    try {
      const result = await dispatch(loginUser(formData)).unwrap();

      // On enregistre le token push SEULEMENT après un login réussi
      // et on le fait de manière asynchrone sans timeout fixe
      if (result?.success) {
        // Méthode préférée : fire-and-forget
        registerPushTokenAfterLogin().catch((err) => {
          if (__DEV__) {
            console.warn('Erreur enregistrement push token (non bloquant):', err);
          }
        });
      }

      return result || { success: true };
    } catch (err) {
      // Gestion plus propre des erreurs
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        'Une erreur est survenue lors de la connexion';

      if (__DEV__) {
        console.warn('[useAuth] Login failed:', err);
      }

      return { success: false, error: errorMessage };
    }
  }, [dispatch, formData, registerPushTokenAfterLogin]);

  // ────────────────────────────────────────────────
  // Logout
  // ────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    try {
      await tokenService.clearAll();
      dispatch(logout());
      return { success: true };
    } catch (err) {
      if (__DEV__) {
        console.warn('[useAuth] Logout failed:', err);
      }
      return { success: false, error: err?.message || 'Erreur lors de la déconnexion' };
    }
  }, [dispatch]);

  // ────────────────────────────────────────────────
  // Mise à jour des champs + nettoyage erreur
  // ────────────────────────────────────────────────
  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Effacer l'erreur seulement quand on commence à modifier un champ
  // (meilleure UX que de l’effacer à chaque frappe)
  const setPhone = useCallback(
    (value) => {
      updateField('phone', value);
      if (error) dispatch(clearError());
    },
    [updateField, error, dispatch]
  );

  const setPassword = useCallback(
    (value) => {
      updateField('password', value);
      if (error) dispatch(clearError());
    },
    [updateField, error, dispatch]
  );

  // ────────────────────────────────────────────────
  // Nettoyage (optionnel mais recommandé)
  // ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Si tu veux vraiment être propre
       dispatch(clearError()); // ← à activer seulement si pertinent
    };
  }, [dispatch]);

  return {
    formData,           // ← renommé pour plus de clarté
    phone: formData.phone,
    password: formData.password,
    loading,
    error,
    user,
    isAuthenticated,    // ← très utile dans les composants

    handleLogin,
    handleLogout,

    setPhone,
    setPassword,

    // Si tu veux garder l’ancienne API pour compatibilité
    updateLoginField: updateField,
  };
};