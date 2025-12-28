import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; 

import HomeTab from './HomeTab';
import TrackingTab from './TrackingTab';
import ProfileTab from './ProfileTab';
import TabStyles from '../styles/TabStyles';
import authApi from '../APIS/authApi';
import { useProfile } from '../hooks/useProfile';
const Tab = createBottomTabNavigator();

export default function Home() {
  
 const {
   getInfo
  } = useProfile();

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
      <Tab.Screen name="Profil" listeners={{
        tabPress: e => {
          console.log('TabProfil  cliqué');
          getInfo();
        },
      }}>
        {() => <ProfileTab userData={ getInfo()} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}