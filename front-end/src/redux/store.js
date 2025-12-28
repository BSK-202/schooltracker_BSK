import {configureStore} from '@reduxjs/toolkit';
import authReducer from './Authslice';

const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});

export default store;