// Ajouter le reducer du tracking
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './Authslice';
import trackingReducer from './TrackingSlice'; // <-- Ajouter cette ligne

const store = configureStore({
  reducer: {
    auth: authReducer,
    tracking: trackingReducer, // <-- Ajouter cette ligne
  },
});

export default store;