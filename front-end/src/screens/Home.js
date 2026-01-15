import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeTab from './HomeTab';
import TrackingTab from './TrackingTab';
import ProfileTab from './ProfileTab';
import TabStyles from '../styles/TabStyles';
import { useProfile } from '../hooks/useProfile';



const Tab = createBottomTabNavigator();

export default function Home() {
  const {
    userData,
    loading,
    fetchProfileOnce
  } = useProfile();

  // CORRECTION: Utilisez un état pour éviter la boucle
  const [profileLoaded, setProfileLoaded] = React.useState(false);

  useEffect(() => {
    if (!profileLoaded && !loading) {
      console.log('Chargement du profil au montage...');
      fetchProfileOnce().then(() => {
        setProfileLoaded(true);
      }).catch(error => {
        console.error('Erreur chargement profil:', error);
      });
    }
  }, [profileLoaded, loading, fetchProfileOnce]);

  // OU mieux: simplifiez complètement
  const handleProfileTabFocus = () => {
    console.log('Onglet Profil focus');
    if (!loading) {
      fetchProfileOnce();
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
      <Tab.Screen 
        name="Accueil" 
        component={HomeTab}
      />
      
      <Tab.Screen 
        name="Suivi" 
        component={TrackingTab}
      />
      
      <Tab.Screen 
        name="Profil"
        listeners={{
          tabPress: handleProfileTabFocus,
        }}
      >
        {() => (
          <ProfileTab 
            userData={userData}
            loading={loading}
            onRefresh={fetchProfileOnce}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}