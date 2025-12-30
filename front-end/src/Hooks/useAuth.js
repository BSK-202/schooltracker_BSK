import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/Authslice';
import { tokenService } from '../services/tokenService';
import authService from '../services/authService';
import { loginUser } from '../redux/AuthThunk';

export const useAuth = () => {

  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();


  const handleLogin = async () => {
    if (!loginData.phone.trim() || !loginData.password.trim()) {
      setError('Le numéro de téléphone et le mot de passe sont requis');
      return { success: false, error: 'Champs requis manquants' };
    }

    try{
          const { phone, password } = loginData;
          return dispatch(loginUser({ phone, password })).unwrap();
    } 
    catch(err){
        return { success: false, error: err };
    }

  };

  const handleLogout = async () => {
    try {

      await tokenService.clearAll();

      dispatch(logout());

      return { success: true, message: 'Déconnexion réussie' };
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      return { success: false, error: err.message };
    }
  }
  const updateLoginField = useCallback((field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
  }, [error]);


  return {
    loginData,
    loading,
    error,

    handleLogin,
    handleLogout,

    updateLoginField,
    
    setPhone: (value) => updateLoginField('phone', value),
    setPassword: (value) => updateLoginField('password', value),

  };
};