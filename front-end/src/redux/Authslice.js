import { createSlice } from '@reduxjs/toolkit';
import { loginUser, fetchUserProfile } from './AuthThunk';

const initialState = {
    isLoggedIn: false,
    loading: false,
    error: null,
    token: null,
    user: null, // Ajouter un champ pour les infos utilisateur
    profile: null // Ajouter un champ pour le profil complet
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isLoggedIn = false;
            state.token = null;
            state.user = null;
            state.profile = null;
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.token = null;
                state.user = null;
                state.error = action.payload || "Erreur de connexion";
            })
            // Profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.profile = null;
                state.error = action.payload || "Erreur de récupération du profil";
            });
    },
});

export const { logout, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;