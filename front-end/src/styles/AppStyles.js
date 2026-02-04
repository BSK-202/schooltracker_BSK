// src/styles/AppStyles.js
import { Platform, StatusBar } from 'react-native';

const AppStyles = {
  // Styles pour le SafeAreaView principal
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    // IMPORTANT: Pour Android, compenser la hauteur de la barre d'état
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // Styles pour l'écran de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  
  // Configuration de la StatusBar
  statusBar: {
    barStyle: 'dark-content',
    backgroundColor: '#fff',
    translucent: false,
    animated: true,
    hidden: false,
  },
  
  // Configuration de la StatusBar pour l'écran de chargement
  loadingStatusBar: {
    barStyle: 'dark-content',
    backgroundColor: '#FFFFFF',
    translucent: false,
  },
  
  // Couleurs de l'application
  colors: {
    primary: '#2196F3',
    background: '#FFFFFF',
    white: '#FFFFFF',
  },
  
  // Tailles et espacements
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

export default AppStyles;