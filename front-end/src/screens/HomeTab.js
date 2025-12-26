import React from 'react';
import { View, Text} from 'react-native';
import HomeTabStyles from '../styles/HomeTabStyles';

export default function HomeTab() {
  return (
    <View style={HomeTabStyles.container}>
      <Text style={HomeTabStyles.title}> Accueil</Text>
      <Text style={HomeTabStyles.text}>Bienvenue sur School Tracker!</Text>
      <Text style={HomeTabStyles.text}>
        Suivez le transport scolaire en temps réel.
      </Text>
    </View>
  );
}