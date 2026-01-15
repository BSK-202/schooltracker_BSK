import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, clearError } from '../redux/Authslice';
import { tokenService } from '../services/tokenService';
import { loginUser } from '../redux/AuthThunk';

export const useAuth = () => {
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  });
  
  const { loading, error, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    // Validation
    if (!loginData.phone.trim()) {
      dispatch(clearError());
      return { success: false, error: 'Le numéro de téléphone est requis' };
    }
    
    if (!loginData.password.trim()) {
      dispatch(clearError());
      return { success: false, error: 'Le mot de passe est requis' };
    }

    try {
      const result = await dispatch(loginUser(loginData)).unwrap();
      return result;
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        error: typeof err === 'string' ? err : err.message || 'Erreur de connexion' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await tokenService.clearAll();
      dispatch(logout());
      return { success: true, message: 'Déconnexion réussie' };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  const updateLoginField = useCallback((field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Effacer l'erreur quand l'utilisateur tape
    if (error) dispatch(clearError());
  }, [error, dispatch]);

  return {
    loginData,
    loading,
    error,
    user,
    
    handleLogin,
    handleLogout,
    
    updateLoginField,
    
    setPhone: (value) => updateLoginField('phone', value),
    setPassword: (value) => updateLoginField('password', value),
  };
};