// screens/ProfileTab.js - CORRIGÉ
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Image 
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
  const { handleLogout: authLogout } = useAuth();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Données par défaut pour éviter les erreurs
  const safeUserData = {
    name: '',
    phone: '',
    children: [],
    childrenCount: 0,
    bus: null, // ← CHANGÉ: maintenant un objet ou null
    busText: '', // ← AJOUTÉ: texte pour affichage
    buses: [],
    role: '',
    school: null,
    assignedBus: null,
    hasAssignedBus: false,
    photoUrl: '',
    sexe: '',
    createdAt: '',
    ...userData
  };
  
  // DEBUG: Afficher les données reçues
  React.useEffect(() => {
    console.log('ProfileTab - Données utilisateur:', {
      busType: typeof safeUserData.bus,
      busContent: safeUserData.bus,
      busText: safeUserData.busText,
      hasBusText: !!safeUserData.busText,
      childrenCount: safeUserData.childrenCount,
      role: safeUserData.role
    });
  }, [safeUserData]);

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
  
  // Fonction pour obtenir le texte du bus à afficher
  const getBusDisplayText = () => {
    // Si busText existe, l'utiliser
    if (safeUserData.busText && safeUserData.busText !== '') {
      return safeUserData.busText;
    }
    
    // Si bus est un objet, utiliser licencePlate
    if (safeUserData.bus && typeof safeUserData.bus === 'object') {
      return safeUserData.bus.licencePlate 
        ? `Bus ${safeUserData.bus.licencePlate}` 
        : 'Non attribué';
    }
    
    // Si bus est une chaîne (ancien format)
    if (typeof safeUserData.bus === 'string') {
      return safeUserData.bus;
    }
    
    return 'Non attribué';
  };
  
  // Fonction pour obtenir le texte du bus d'un enfant
  const getChildBusText = (child) => {
    if (!child) return 'Non assigné';
    
    // Si child.bus est un objet
    if (child.bus && typeof child.bus === 'object') {
      return child.bus.licencePlate 
        ? `Bus ${child.bus.licencePlate}` 
        : 'Non assigné';
    }
    
    // Si child.busText existe
    if (child.busText) {
      return child.busText;
    }
    
    // Si child.bus est une chaîne (ancien format)
    if (typeof child.bus === 'string') {
      return child.bus;
    }
    
    return 'Non assigné';
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
  
  // Vérifier si children est un tableau valide
  const isValidChildrenArray = Array.isArray(safeUserData.children) && safeUserData.children.length > 0;
  
  // Texte du bus à afficher
  const busDisplayText = getBusDisplayText();
  
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
          {safeUserData.photoUrl ? (
            <Image 
              source={{ uri: safeUserData.photoUrl }} 
              style={ProfileTabStyles.profilePhoto}
            />
          ) : (
            <Text style={ProfileTabStyles.profileEmoji}>
              {getProfileEmoji(safeUserData.role)}
            </Text>
          )}
        </View>
        
        <Text style={ProfileTabStyles.profileName}>
          {safeUserData.name || 'Utilisateur'}
        </Text>
        
        <Text style={ProfileTabStyles.profileRole}>
          {getRoleLabel(safeUserData.role)}
        </Text>
        
        {/* Badge pour montrer le statut */}
        {busDisplayText && busDisplayText !== 'Non attribué' && (
          <View style={ProfileTabStyles.busBadge}>
            <Text style={ProfileTabStyles.busBadgeText}>
              {busDisplayText}
            </Text>
          </View>
        )}
        
        {/* Indicateur du nombre d'enfants */}
        {safeUserData.childrenCount > 0 && (
          <View style={ProfileTabStyles.childrenBadge}>
            <Text style={ProfileTabStyles.childrenBadgeText}>
              {safeUserData.childrenCount} {safeUserData.childrenCount === 1 ? 'enfant' : 'enfants'}
            </Text>
          </View>
        )}
      </View>
      
      {/* Section informations personnelles */}
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
          label="Nombre d'enfants"
          value={safeUserData.childrenCount.toString() || '0'}
          icon="👨‍👩‍👧‍👦"
        />
        
        <InfoItem 
          label="Bus"
          value={busDisplayText}
          icon="🚌"
        />
        
        {safeUserData.school && safeUserData.school.name && (
          <InfoItem 
            label="École"
            value={safeUserData.school.name}
            icon="🏫"
          />
        )}
        
        <InfoItem 
          label="Rôle"
          value={getRoleLabel(safeUserData.role)}
          icon="🎭"
        />
        
        {safeUserData.sexe && (
          <InfoItem 
            label="Sexe"
            value={safeUserData.sexe}
            icon="👤"
          />
        )}
        
        {safeUserData.createdAt && (
          <InfoItem 
            label="Membre depuis"
            value={new Date(safeUserData.createdAt).toLocaleDateString('fr-FR')}
            icon="📅"
          />
        )}
        
        {/* Informations détaillées du bus (si parent et bus objet) */}
        {safeUserData.role === 'parent' && safeUserData.bus && typeof safeUserData.bus === 'object' && (
          <>
            <InfoItem 
              label="Immatriculation"
              value={safeUserData.bus.licencePlate || 'N/A'}
              icon="🔢"
            />
            
            <InfoItem 
              label="Capacité"
              value={`${safeUserData.bus.capacity || 0} places`}
              icon="👥"
            />
            
            <InfoItem 
              label="Statut"
              value={safeUserData.bus.isActive ? 'Actif' : 'Inactif'}
              icon={safeUserData.bus.isActive ? '✅' : '❌'}
            />
          </>
        )}
      </View>
      
      {/* Section des enfants (si parent) */}
      {safeUserData.role === 'parent' && (
        <View style={ProfileTabStyles.childrenSection}>
          <Text style={ProfileTabStyles.sectionTitle}>
            Enfants ({safeUserData.childrenCount})
          </Text>
          
          {isValidChildrenArray ? (
            safeUserData.children.map((child, index) => {
              // Vérifier si child est un objet
              if (!child || typeof child !== 'object') {
                return (
                  <View key={`child-invalid-${index}`} style={ProfileTabStyles.childItem}>
                    <Text style={ProfileTabStyles.errorText}>Données d'enfant invalides</Text>
                  </View>
                );
              }
              
              const childBusText = getChildBusText(child);
              
              return (
                <View key={child.id || `child-${index}`} style={ProfileTabStyles.childItem}>
                  <View style={ProfileTabStyles.childHeader}>
                    <Text style={ProfileTabStyles.childIcon}>👦</Text>
                    <Text style={ProfileTabStyles.childName}>
                      {child.name || `Enfant ${index + 1}`}
                    </Text>
                  </View>
                  
                  <View style={ProfileTabStyles.childDetails}>
                    <Text style={ProfileTabStyles.childDetail}>
                      <Text style={ProfileTabStyles.childDetailLabel}>Bus: </Text>
                      {childBusText}
                    </Text>
                    
                    <Text style={ProfileTabStyles.childDetail}>
                      <Text style={ProfileTabStyles.childDetailLabel}>Arrêt: </Text>
                      {child.stop || 'Non défini'}
                    </Text>
                    
                    {child.qrCode && (
                      <Text style={ProfileTabStyles.childDetail}>
                        <Text style={ProfileTabStyles.childDetailLabel}>QR Code: </Text>
                        {child.qrCode}
                      </Text>
                    )}
                    
                    {/* Informations détaillées du bus (si disponible) */}
                    {child.bus && typeof child.bus === 'object' && child.bus.licencePlate && (
                      <Text style={ProfileTabStyles.childDetail}>
                        <Text style={ProfileTabStyles.childDetailLabel}>Capacité: </Text>
                        {child.bus.capacity || 'N/A'} places
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={ProfileTabStyles.emptyState}>
              <Text style={ProfileTabStyles.emptyStateText}>
                {safeUserData.childrenCount > 0 
                  ? 'Les informations des enfants sont en cours de chargement...' 
                  : 'Aucun enfant enregistré'}
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Section bus assigné (si chauffeur) */}
      {safeUserData.role === 'chauffeur' && safeUserData.assignedBus && (
        <View style={ProfileTabStyles.busSection}>
          <Text style={ProfileTabStyles.sectionTitle}>
            Bus assigné
          </Text>
          
          <View style={ProfileTabStyles.busCard}>
            <Text style={ProfileTabStyles.busTitle}>
              {safeUserData.assignedBus.licencePlate || 'Bus sans nom'}
            </Text>
            
            <View style={ProfileTabStyles.busDetails}>
              <View style={ProfileTabStyles.busDetailItem}>
                <Text style={ProfileTabStyles.busDetailLabel}>Immatriculation:</Text>
                <Text style={ProfileTabStyles.busDetailValue}>
                  {safeUserData.assignedBus.licencePlate || 'N/A'}
                </Text>
              </View>
              
              <View style={ProfileTabStyles.busDetailItem}>
                <Text style={ProfileTabStyles.busDetailLabel}>Capacité:</Text>
                <Text style={ProfileTabStyles.busDetailValue}>
                  {safeUserData.assignedBus.capacity || 0} places
                </Text>
              </View>
              
              <View style={ProfileTabStyles.busDetailItem}>
                <Text style={ProfileTabStyles.busDetailLabel}>Statut:</Text>
                <Text style={[
                  ProfileTabStyles.busDetailValue,
                  safeUserData.assignedBus.isActive ? ProfileTabStyles.active : ProfileTabStyles.inactive
                ]}>
                  {safeUserData.assignedBus.isActive ? 'Actif' : 'Inactif'}
                </Text>
              </View>
              
              {safeUserData.childrenCount > 0 && (
                <View style={ProfileTabStyles.busDetailItem}>
                  <Text style={ProfileTabStyles.busDetailLabel}>Élèves dans le bus:</Text>
                  <Text style={ProfileTabStyles.busDetailValue}>
                    {safeUserData.childrenCount} élèves
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      
      {/* Liste des élèves dans le bus (si chauffeur) */}
      {safeUserData.role === 'chauffeur' && isValidChildrenArray && (
        <View style={ProfileTabStyles.studentsSection}>
          <Text style={ProfileTabStyles.sectionTitle}>
            Élèves dans le bus ({safeUserData.childrenCount})
          </Text>
          
          {safeUserData.children.map((student, index) => {
            if (!student || typeof student !== 'object') {
              return (
                <View key={`student-invalid-${index}`} style={ProfileTabStyles.studentItem}>
                  <Text style={ProfileTabStyles.errorText}>Données d'élève invalides</Text>
                </View>
              );
            }
            
            return (
              <View key={student.id || `student-${index}`} style={ProfileTabStyles.studentItem}>
                <View style={ProfileTabStyles.studentHeader}>
                  <Text style={ProfileTabStyles.studentIcon}>👨‍🎓</Text>
                  <View style={ProfileTabStyles.studentInfo}>
                    <Text style={ProfileTabStyles.studentName}>
                      {student.name || `Élève ${index + 1}`}
                    </Text>
                    <Text style={ProfileTabStyles.studentStop}>
                      {student.stop || 'Arrêt non spécifié'}
                    </Text>
                  </View>
                </View>
                
                {(student.parent1 || student.parent2) && (
                  <View style={ProfileTabStyles.parentsInfo}>
                    {student.parent1 && (
                      <Text style={ProfileTabStyles.parentText}>
                        Parent 1: {typeof student.parent1 === 'object' ? student.parent1.name : student.parent1}
                      </Text>
                    )}
                    {student.parent2 && (
                      <Text style={ProfileTabStyles.parentText}>
                        Parent 2: {typeof student.parent2 === 'object' ? student.parent2.name : student.parent2}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      
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
              Mettre à jour les données
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
        {typeof value === 'string' || typeof value === 'number' 
          ? value 
          : JSON.stringify(value)}
      </Text>
    </View>
  );
}

// Helper pour obtenir l'emoji selon le rôle
function getProfileEmoji(role) {
  const roleEmojis = {
    'parent': '👨‍👩‍👧‍👦',
    'chauffeur': '🚌',
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
    'chauffeur': 'Chauffeur',
    'admin': 'Administrateur'
  };
  return roleLabels[role] || 'Utilisateur';
}