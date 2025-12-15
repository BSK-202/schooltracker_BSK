import React from 'react';
import { View, Text } from 'react-native';
import TrackingTabStyles from '../styles/TrackingTabStyles';

export default function TrackingTab() {
  return (
    <View style={TrackingTabStyles.container}>
      <Text style={TrackingTabStyles.title}>📍 Suivi en direct</Text>
      <Text style={TrackingTabStyles.text}>
        Visualisez la position du bus en temps réel.
      </Text>
      <View style={TrackingTabStyles.mapPlaceholder}>
        <Text style={TrackingTabStyles.mapText}>🗺️ Carte interactive ici</Text>
      </View>
    </View>
  );
}