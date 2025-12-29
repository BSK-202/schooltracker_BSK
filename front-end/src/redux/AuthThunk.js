import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/Authslice';
import { tokenService } from '../services/tokenService';
import authService from '../services/authService';
import { createAsyncThunk, isRejectedWithValue } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ phone, password }, { rejectedWithValue }) => {
        try {

            const result = await authService.login(phone, password);

            if (result.success && result.access_token && result.refresh_token) {
                await tokenService.setToken(result.access_token);
                await tokenService.setRefreshToken(result.refresh_token);

                const storedToken = await tokenService.getToken();
                console.log('Token stocké avec succès:', storedToken ? 'OUI' : 'NON');

                return {
                    success: true,
                    message: result.message,
                    token: result.token
                };
            }
            else {
                return rejectedWithValue("Identifiants incorrects")
            }

        } catch (err) {
            return rejectedWithValue(err.message || "Erreur de connexion");
        }
    }
);
