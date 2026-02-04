// src/styles/RootNavigationStyles.js
import { Platform, StatusBar } from 'react-native';

const RootNavigationStyles = {
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
  },
  
  statusBar: {
    barStyle: 'dark-content',
    backgroundColor: '#fff',
    translucent: false,
  },
  
  screenContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
};

export default RootNavigationStyles;