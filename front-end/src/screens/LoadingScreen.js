import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import LoadingIndicator from '../components/LoadingIndicator';
import styles from '../styles/loadingStyles';

export default function LoadingScreen() {
    
  return (
    <ImageBackground
      source={require('../../assets/loading_page.png')}  // ton image background
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>SchoolTracker</Text>

        {/* utilisation des props */}
        <LoadingIndicator 
          size="large" 
          message="Initialisation..."
        />
      </View>
    </ImageBackground>
  );
}
