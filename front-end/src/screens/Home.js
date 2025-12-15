import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans d'onglets
import HomeTab from './HomeTab';
import TrackingTab from './TrackingTab';
import ProfileTab from './ProfileTab';

// Import des styles
import TabStyles from '../styles/TabStyles';

const Tab = createBottomTabNavigator();

export default function Home({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Suivi') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TabStyles.tabBarActiveTintColor,
        tabBarInactiveTintColor: TabStyles.tabBarInactiveTintColor,
        tabBarStyle: TabStyles.tabBarStyle,
        tabBarLabelStyle: TabStyles.tabBarLabelStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Accueil">
        {() => <HomeTab />}
      </Tab.Screen>
      <Tab.Screen name="Suivi">
        {() => <TrackingTab />}
      </Tab.Screen>
      <Tab.Screen name="Profil">
        {() => <ProfileTab setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}