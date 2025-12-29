import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl 
} from 'react-native';
import ProfileTabStyles from '../styles/ProfileTabStyles';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/Authslice';
import { useAuth } from '../hooks/useAuth';

export default function ProfileTab({ 
  userData, 
  loading = false,
  onRefresh,
  error = null 
}) {
  const dispatch = useDispatch();
  const { handleLogout: authLogout } = useAuth(); // Utiliser le hook d'authentification
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Données par défaut pour éviter les erreurs
  const safeUserData = {
    name: '',
    phone: '',
    child: '',
    bus: '',
    role: '',
    ...userData
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { 
          text: 'Annuler', 
          style: 'cancel' 
        },
        {
          text: 'Se déconnecter',
          onPress: async () => {
            try {
              // Utiliser la déconnexion du hook qui gère aussi le token
              await authLogout();
              dispatch(logout());
            } catch (error) {
              console.error('Erreur lors de la déconnexion:', error);
              Alert.alert('Erreur', 'Impossible de se déconnecter');
            }
          }
        }
      ]
    );
  };
  
  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Erreur lors du rafraîchissement:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };
  
  // Affichage pendant le chargement
  if (loading && !safeUserData.name) {
    return (
      <View style={ProfileTabStyles.loadingContainer}>
        <ActivityIndicator size="large" color={ProfileTabStyles.loadingColor} />
        <Text style={ProfileTabStyles.loadingText}>
          Chargement de votre profil...
        </Text>
      </View>
    );
  }
  
  // Affichage en cas d'erreur
  if (error && !safeUserData.name) {
    return (
      <View style={ProfileTabStyles.errorContainer}>
        <Text style={ProfileTabStyles.errorText}>
          {error}
        </Text>
        <TouchableOpacity 
          style={ProfileTabStyles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={ProfileTabStyles.retryButtonText}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView
      style={ProfileTabStyles.container}
      refreshControl={
        onRefresh && (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[ProfileTabStyles.refreshControlColor]}
          />
        )
      }
      showsVerticalScrollIndicator={false}
    >
      {/* En-tête avec photo de profil */}
      <View style={ProfileTabStyles.header}>
        <View style={ProfileTabStyles.profileImage}>
          <Text style={ProfileTabStyles.profileEmoji}>
            {getProfileEmoji(safeUserData.role)}
          </Text>
        </View>
        <Text style={ProfileTabStyles.profileName}>
          {safeUserData.name || 'Utilisateur'}
        </Text>
        <Text style={ProfileTabStyles.profileRole}>
          {getRoleLabel(safeUserData.role)}
        </Text>
        
        {/* Badge pour montrer le statut */}
        {safeUserData.bus && (
          <View style={ProfileTabStyles.busBadge}>
            <Text style={ProfileTabStyles.busBadgeText}>
              Bus {safeUserData.bus}
            </Text>
          </View>
        )}
      </View>
      
      {/* Section informations */}
      <View style={ProfileTabStyles.infoSection}>
        <Text style={ProfileTabStyles.sectionTitle}>
          Informations personnelles
        </Text>
        
        <InfoItem 
          label="Nom complet"
          value={safeUserData.name || 'Non renseigné'}
          icon="👤"
        />
        
        <InfoItem 
          label="Téléphone"
          value={safeUserData.phone || 'Non renseigné'}
          icon="📱"
        />
        
        <InfoItem 
          label="Enfant"
          value={safeUserData.child || 'Aucun enfant enregistré'}
          icon="👶"
        />
        
        <InfoItem 
          label="Numéro de bus"
          value={safeUserData.bus || 'Non attribué'}
          icon="🚌"
        />
        
        <InfoItem 
          label="Rôle"
          value={getRoleLabel(safeUserData.role)}
          icon="🎭"
        />
      </View>
      
      {/* Section actions */}
      <View style={ProfileTabStyles.actionsSection}>
        <Text style={ProfileTabStyles.sectionTitle}>
          Actions
        </Text>
        
        <TouchableOpacity 
          style={ProfileTabStyles.actionButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={ProfileTabStyles.actionButtonIcon}>🔄</Text>
          <View style={ProfileTabStyles.actionButtonContent}>
            <Text style={ProfileTabStyles.actionButtonText}>
              Actualiser les informations
            </Text>
            <Text style={ProfileTabStyles.actionButtonSubtext}>
              Dernière mise à jour
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={ProfileTabStyles.actionButton}
          onPress={() => Alert.alert('Info', 'Fonctionnalité à venir')}
        >
          <Text style={ProfileTabStyles.actionButtonIcon}>⚙️</Text>
          <View style={ProfileTabStyles.actionButtonContent}>
            <Text style={ProfileTabStyles.actionButtonText}>
              Paramètres du compte
            </Text>
            <Text style={ProfileTabStyles.actionButtonSubtext}>
              Gérer vos préférences
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Bouton de déconnexion */}
      <View style={ProfileTabStyles.footer}>
        <TouchableOpacity 
          style={[
            ProfileTabStyles.logoutButton,
            refreshing && ProfileTabStyles.logoutButtonDisabled
          ]} 
          onPress={handleLogout}
          disabled={refreshing}
        >
          <Text style={ProfileTabStyles.logoutButtonIcon}>🚪</Text>
          <Text style={ProfileTabStyles.logoutButtonText}>
            Se déconnecter
          </Text>
        </TouchableOpacity>
        
        <Text style={ProfileTabStyles.footerText}>
          Version 1.0.0 • School Tracker
        </Text>
      </View>
    </ScrollView>
  );
}

// Composant réutilisable pour les items d'information
function InfoItem({ label, value, icon }) {
  return (
    <View style={ProfileTabStyles.infoItem}>
      <View style={ProfileTabStyles.infoItemHeader}>
        <Text style={ProfileTabStyles.infoItemIcon}>{icon}</Text>
        <Text style={ProfileTabStyles.infoLabel}>{label}</Text>
      </View>
      <Text style={ProfileTabStyles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

// Helper pour obtenir l'emoji selon le rôle
function getProfileEmoji(role) {
  const roleEmojis = {
    'parent': '👨',
    'driver': '👨‍✈️',
    'admin': '👑',
    'student': '👨‍🎓',
    'teacher': '👩‍🏫',
  };
  return roleEmojis[role] || '👤';
}

// Helper pour formater le label du rôle
function getRoleLabel(role) {
  const roleLabels = {
    'parent': 'Parent',
    'driver': 'Chauffeur',
    'admin': 'Administrateur',
    'student': 'Élève',
    'teacher': 'Enseignant',
  };
  return roleLabels[role] || 'Utilisateur';
}