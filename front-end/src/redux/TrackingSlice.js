// front-end/src/redux/TrackingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  error: null,
  schools: [],
  children: [],
  selectedChild: null,
  childTracking: null,
  mapRegion: {
    latitude: 33.5731, // Coordonnées par défaut (Maroc)
    longitude: -7.5898,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  markers: [],
  polylines: [],
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSchools: (state, action) => {
      state.schools = action.payload;
    },
    setChildren: (state, action) => {
      state.children = action.payload;
    },
    setSelectedChild: (state, action) => {
      state.selectedChild = action.payload;
    },
    setChildTracking: (state, action) => {
      state.childTracking = action.payload;
    },
    setMapRegion: (state, action) => { // <-- AJOUTER CET ACTION
      state.mapRegion = action.payload;
    },
    setMarkers: (state, action) => {
      state.markers = action.payload;
    },
    setPolylines: (state, action) => {
      state.polylines = action.payload;
    },
    clearTrackingData: (state) => {
      state.selectedChild = null;
      state.childTracking = null;
      state.markers = [];
      state.polylines = [];
    },
    resetTracking: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setSchools,
  setChildren,
  setSelectedChild,
  setChildTracking,
  setMapRegion, // <-- AJOUTER CET EXPORT
  setMarkers,
  setPolylines,
  clearTrackingData,
  resetTracking,
} = trackingSlice.actions;

export default trackingSlice.reducer;