import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Ajoutez ceci

import HomeTab from './HomeTab';
import TrackingTab from './TrackingTab';
import ProfileTab from './ProfileTab';
import TabStyles from '../styles/TabStyles';
import authApi from '../APIS/authApi';
const Tab = createBottomTabNavigator();

export default function Home({ setIsLoggedIn }) {
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    child: '',
    bus: '',
    role: ''
  });

  const getInfo = async () => {
    try {

      /* const token = await SecureStore.getItemAsync("acces_token");
      console.log("JWT: ", token);

      const response = await loginAPI.get(
        "/auth/profil",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      setUserData(response.data.profil)
      console.log(response.data.profil) */
      const response = await authApi.get("/auth/profil");
      setUserData(response.data.profil)
      console.log(response.data.profil)

    } catch (error) {

      Alert.alert("Erreur", "Erreur lors de recuperation d infos");
    }

  };

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
        {() => <ProfileTab setIsLoggedIn={setIsLoggedIn} userData={userData} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}