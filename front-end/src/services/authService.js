import authApi from '../APIS/authApi';
import loginApi from '../APIS/loginAPI'; // À harmoniser si possible

// Helper pour savoir si on est en développement
const isDev = __DEV__;

// ────────────────────────────────────────────────
// Fonction utilitaire pour gérer les erreurs uniformément
// ────────────────────────────────────────────────
const handleApiError = (error, context = 'API') => {
  const errorData = error.response?.data;
  const status = error.response?.status;

  let message = 'Une erreur est survenue';
  let code = 'unknown';

  if (errorData) {
    message = errorData.message || errorData.error || message;
    code = errorData.code || status || code;
  } else if (error.request) {
    message = 'Problème de connexion au serveur';
    code = 'network_error';
  } else {
    message = error.message || message;
  }

  if (isDev) {
    console.warn(`[${context}] Échec :`, {
      message,
      code,
      status,
      details: errorData || error.message,
    });
  }

  const err = new Error(message);
  err.code = code;
  err.status = status;
  err.details = errorData;
  throw err;
};

// ────────────────────────────────────────────────
// Service Auth
// ────────────────────────────────────────────────
const authService = {
  /**
   * Connexion utilisateur
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<{access_token: string, refresh_token: string, user: any, message?: string}>}
   */
  async login(phone, password) {
    try {
      const response = await loginApi.post('/auth/login', { phone, password });

      const { access_token, refresh_token, user, message } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error('Réponse invalide : tokens manquants');
      }

      return {
        access_token,
        refresh_token,
        user: user || null,
        message: message || 'Connexion réussie',
      };
    } catch (error) {
      throw handleApiError(error, 'Login');
    }
  },

  /**
   * Récupération du profil utilisateur
   * @returns {Promise<any>} Profil complet
   */
  async profile() {
    try {
      const response = await authApi.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Profile');
    }
  },

  /**
   * Rafraîchissement du token
   * @param {string} refreshToken
   * @returns {Promise<{access_token: string, refresh_token?: string}>}
   */
  async refresh(refreshToken) {
    try {
      // Attention : utiliser la même instance que login (ou harmoniser)
      const response = await loginApi.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token, // si le serveur en renvoie un nouveau
      };
    } catch (error) {
      throw handleApiError(error, 'Refresh Token');
    }
  },
};

export default authService;