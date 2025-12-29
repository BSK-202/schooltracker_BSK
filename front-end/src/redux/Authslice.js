import { createSlice } from '@reduxjs/toolkit';
import { loginUser } from './AuthThunk'
const initialState = {
    isLoggedIn: false,
    loading: false,
    error: null,
    token: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        logout: (state) => {
            state.isLoggedIn = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;

            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.token = action.payload;

            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.token = null;
                state.error = action.payload
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;