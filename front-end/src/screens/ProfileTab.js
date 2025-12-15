import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import ProfileTabStyles from '../styles/ProfileTabStyles';

export default function ProfileTab({ setIsLoggedIn }) {
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          onPress: () => setIsLoggedIn(false)
        }
      ]
    );
  };

  return (
    <View style={ProfileTabStyles.container}>
      <View style={ProfileTabStyles.header}>
        <View style={ProfileTabStyles.profileImage}>
          <Text style={ProfileTabStyles.profileEmoji}>👨</Text>
        </View>
        <Text style={ProfileTabStyles.profileName}>Mohamed Ali</Text>
        <Text style={ProfileTabStyles.profileRole}>Parent</Text>
      </View>
      
      <View style={ProfileTabStyles.infoSection}>
        <Text style={ProfileTabStyles.sectionTitle}>Informations</Text>
        <View style={ProfileTabStyles.infoItem}>
          <Text style={ProfileTabStyles.infoLabel}>Téléphone:</Text>
          <Text style={ProfileTabStyles.infoValue}>0674336184</Text>
        </View>
        <View style={ProfileTabStyles.infoItem}>
          <Text style={ProfileTabStyles.infoLabel}>Enfant:</Text>
          <Text style={ProfileTabStyles.infoValue}>Fatima (CM2)</Text>
        </View>
        <View style={ProfileTabStyles.infoItem}>
          <Text style={ProfileTabStyles.infoLabel}>Bus:</Text>
          <Text style={ProfileTabStyles.infoValue}>Ligne 12A</Text>
        </View>
      </View>
      
      <TouchableOpacity style={ProfileTabStyles.logoutButton} onPress={handleLogout}>
        <Text style={ProfileTabStyles.logoutButtonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}