import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../services/authService';
import { tokenService } from '../services/tokenService';

export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ phone, password }, { rejectWithValue }) => {
        try {
            console.log('Login thunk started for:', phone);
            
            const result = await authService.login(phone, password);
            
            console.log('Login result:', result);
            
            if (result.access_token && result.refresh_token) {
                // Stocker les tokens
                await tokenService.setToken(result.access_token);
                await tokenService.setRefreshToken(result.refresh_token);
                
                // Vérifier que le token est bien stocké
                const storedToken = await tokenService.getToken();
                console.log('Token stored:', storedToken ? 'YES' : 'NO');
                
                return {
                    success: true,
                    message: result.message,
                    token: result.access_token,
                    user: result.user // Inclure les infos utilisateur
                };
            } else {
                return rejectWithValue("Pas de token reçu du serveur");
            }
            
        } catch (err) {
            console.error('Login thunk error:', err);
            return rejectWithValue(err.message || "Erreur de connexion");
        }
    }
);

// Ajouter un thunk pour récupérer le profil
export const fetchUserProfile = createAsyncThunk(
    "auth/profile",
    async (_, { rejectWithValue }) => {
        try {
            const result = await authService.profile();
            return result;
        } catch (err) {
            console.error('Fetch profile error:', err);
            return rejectWithValue(err.message || "Erreur de récupération du profil");
        }
    }
);