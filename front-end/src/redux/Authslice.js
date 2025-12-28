import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isLoggedIn = true;
        },
        logout: (state) => {
            state.isLoggedIn = false;
        }
    }
});

export const {loginSuccess, logout} = authSlice.actions;
export default authSlice.reducer;