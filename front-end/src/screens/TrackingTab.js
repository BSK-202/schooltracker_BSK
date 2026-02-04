// front-end/src/screens/TrackingTab.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  TextInput,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchTrackingSummary,
  fetchChildTracking,
  clearTracking,
  setSelectedChild,
  setMarkers,
  setPolylines,
} from '../redux/TrackingThunk';
import { useBusSimulation } from '../Hooks/useBusSimulation';
import trackingTabStyles from '../styles/TrackingTabStyles';

const styles = trackingTabStyles;

export default function TrackingTab() {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [showChildrenList, setShowChildrenList] = useState(false);
  const [showSpeedControls, setShowSpeedControls] = useState(false);
  const [customSpeed, setCustomSpeed] = useState('1');
  const [showBottomPanel, setShowBottomPanel] = useState(true); // Contrôle l'affichage du panneau inférieur
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false); // Pour réduire le panneau

  // Sélectionner les données du state
  const {
    loading,
    error,
    schools,
    children,
    selectedChild,
    childTracking,
    markers,
    polylines,
  } = useSelector((state) => state.tracking);

  // Hook de simulation
  const {
    isConnected,
    isSimulationActive,
    busPosition,
    simulationStatus,
    loading: simulationLoading,
    error: simulationError,
    startSimulation,
    stopSimulation,
    joinBusRoom,
    leaveBusRoom,
    currentBusId,
    simulationSpeed,
    changeSpeed,
    togglePause,
  } = useBusSimulation();

  const mapRef = useRef(null);

  // Charger les données au montage
  useEffect(() => {
    loadTrackingData();
  }, []);

  // Mettre à jour le marqueur du bus en temps réel
  useEffect(() => {
    if (busPosition && childTracking) {
      // Créer un marqueur pour le bus en mouvement
      const liveBusMarker = {
        id: 'bus-live',
        coordinate: {
          latitude: busPosition.lat,
          longitude: busPosition.lng,
        },
        title: 'Bus en mouvement',
        description: `Vitesse: ${Math.round(busPosition.speed || 0)} km/h`,
        type: 'bus',
        color: '#FF5722',
        heading: busPosition.heading || 0,
        isLive: true,
      };
      
      // Fusionner avec les autres marqueurs
      const updatedMarkers = [
        ...markers.filter(m => m.id !== 'bus-live'),
        liveBusMarker,
      ];
      
      dispatch(setMarkers(updatedMarkers));
      
      // Suivre le bus avec la caméra si la simulation est active
      if (isSimulationActive && busPosition.speed > 0 && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: busPosition.lat,
          longitude: busPosition.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  }, [busPosition, isSimulationActive]);

  // Masquer le panneau inférieur lorsque la simulation démarre
  useEffect(() => {
    if (isSimulationActive) {
      setShowBottomPanel(false);
    } else {
      setShowBottomPanel(true);
    }
  }, [isSimulationActive]);

  const loadTrackingData = async () => {
    try {
      await dispatch(fetchTrackingSummary()).unwrap();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données de tracking');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrackingData();
    setRefreshing(false);
  };

  const handleChildSelect = async (child) => {
    try {
      console.log('Selected child:', child);
      dispatch(setSelectedChild(child));
      
      // Récupérer les infos de tracking
      const result = await dispatch(fetchChildTracking(child.id)).unwrap();
      console.log('Tracking result:', result);
      
      // Arrêter la simulation précédente
      if (currentBusId && currentBusId !== child.bus?.id) {
        stopSimulation(currentBusId);
        leaveBusRoom(currentBusId);
      }
      
      // Si l'enfant a un bus
      if (result.child?.bus?.id && result.route?.stops) {
        const busId = result.child.bus.id;
        const trajetId = result.route.trajet?.id;
        const childStopId = result.child.stop?.id;
        
        console.log('Bus ID:', busId);
        console.log('Trajet ID:', trajetId);
        console.log('Arrêts:', result.route.stops);
        
        // Préparer les arrêts (inclure l'école si présente)
        const allStops = [...result.route.stops];
        if (result.school) {
          allStops.push({
            id: -result.school.id,
            latitude: result.school.latitude,
            longitude: result.school.longitude,
            order: allStops.length + 1,
            address: result.school.address,
            type: 'school',
          });
        }
        
        console.log('Tous les arrêts:', allStops);
        
        // Démarrer la simulation
        if (!isSimulationActive || currentBusId !== busId) {
          const simulationResult = await startSimulation(
            busId,
            trajetId,
            allStops,
            childStopId,
            parseFloat(customSpeed) || 1
          );
          
          if (simulationResult.success) {
            setShowChildrenList(false);
          }
        } else {
          // Rejoindre la room du bus
          joinBusRoom(busId);
        }
      } else {
        Alert.alert('Information', 'Cet enfant n\'a pas de bus assigné');
      }
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Erreur', 'Impossible de charger le tracking');
    }
  };

  const handleClearTracking = () => {
    if (currentBusId) {
      stopSimulation(currentBusId);
      leaveBusRoom(currentBusId);
    }
    dispatch(clearTracking());
    setShowBottomPanel(true); // Réafficher le panneau
    setIsPanelCollapsed(false); // Réinitialiser l'état du panneau
  };

  const handleSchoolSelect = (school) => {
    if (school.latitude && school.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: school.latitude,
        longitude: school.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleSpeedChange = (multiplier) => {
    if (currentBusId) {
      changeSpeed(currentBusId, multiplier);
      setCustomSpeed(multiplier.toString());
    }
  };

  const handleCustomSpeedSubmit = () => {
    const speed = parseFloat(customSpeed);
    if (speed && speed > 0 && speed <= 10) {
      handleSpeedChange(speed);
    } else {
      Alert.alert('Erreur', 'Vitesse invalide (0.1 - 10)');
    }
  };

  const renderSimulationControls = () => {
    if (!childTracking?.child?.bus?.id) return null;
    
    const busId = childTracking.child.bus.id;
    
    return (
      <View style={styles.simulationControls}>
        <View style={styles.simulationInfo}>
          {simulationStatus && (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="speedometer" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Progression: {simulationStatus.progress || 0}%
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="flag" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Arrêts: {simulationStatus.completedStops || 0}/{simulationStatus.totalStops || 0}
                </Text>
              </View>
              {busPosition && (
                <View style={styles.infoRow}>
                  <Ionicons name="car" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    Vitesse: {Math.round(busPosition.speed || 0)} km/h
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        
        <View style={styles.simulationButtons}>
          {!isSimulationActive ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.startButton]}
              onPress={() => {
                // Redémarrer la simulation
                const allStops = [...(childTracking.route?.stops || [])];
                if (childTracking.school) {
                  allStops.push({
                    id: -childTracking.school.id,
                    latitude: childTracking.school.latitude,
                    longitude: childTracking.school.longitude,
                    order: allStops.length + 1,
                  });
                }
                
                startSimulation(
                  busId,
                  childTracking.route?.trajet?.id,
                  allStops,
                  childTracking.child.stop?.id,
                  parseFloat(customSpeed) || 1
                );
              }}
              disabled={simulationLoading}
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Démarrer</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={() => togglePause(busId)}
              >
                <Ionicons name="pause" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={() => stopSimulation(busId)}
              >
                <Ionicons name="stop" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Arrêter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.speedButton]}
                onPress={() => setShowSpeedControls(!showSpeedControls)}
              >
                <Ionicons name="speedometer" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>{simulationSpeed}x</Text>
              </TouchableOpacity>
            </>
          )}
          
          {simulationError && (
            <TouchableOpacity
              style={[styles.controlButton, styles.errorButton]}
              onPress={() => Alert.alert('Erreur', simulationError)}
            >
              <Ionicons name="warning" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Contrôles de vitesse */}
        {showSpeedControls && isSimulationActive && (
          <View style={styles.speedControls}>
            <Text style={styles.speedTitle}>Vitesse de simulation</Text>
            <View style={styles.speedButtons}>
              {[0.5, 1, 2, 5].map(speed => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButtonStyle,
                    simulationSpeed === speed && styles.speedButtonActive
                  ]}
                  onPress={() => handleSpeedChange(speed)}
                >
                  <Text style={styles.speedButtonText}>{speed}x</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customSpeedContainer}>
              <TextInput
                style={styles.customSpeedInput}
                value={customSpeed}
                onChangeText={setCustomSpeed}
                keyboardType="decimal-pad"
                placeholder="Vitesse personnalisée"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.customSpeedButton}
                onPress={handleCustomSpeedSubmit}
              >
                <Text style={styles.customSpeedButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Afficher le chargement
  if (loading && !schools.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  // Afficher les erreurs
  if (error && !schools.length) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTrackingData}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fonction pour render le marqueur du bus
  const renderBusMarker = () => {
    return (
      <View style={styles.busMarkerContainer}>
        <Ionicons name="bus" size={32} color="#FF5722" />
        <View style={styles.speedBadge}>
          <Text style={styles.speedText}>
            {Math.round(busPosition?.speed || 0)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* En-tête - réduit quand la simulation est active */}
      <View style={isSimulationActive ? styles.headerWithSimulation : styles.header}>
        <Text style={styles.headerTitle}>Suivi du transport</Text>
        <Text style={styles.headerSubtitle}>
          {childTracking
            ? `Trajet de ${childTracking.child.name}`
            : 'Sélectionnez un enfant pour suivre son trajet'}
        </Text>
      </View>

      {/* Contrôles de simulation */}
      {renderSimulationControls()}

      {/* Carte - utilise le style full screen si simulation active */}
      <View style={isSimulationActive ? styles.mapContainerFullScreen : styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 48.8566,
            longitude: 2.3522,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* Marqueurs des écoles */}
          {schools.map((school) => (
            school.latitude &&
            school.longitude && (
              <Marker
                key={`school-${school.id}`}
                coordinate={{
                  latitude: school.latitude,
                  longitude: school.longitude,
                }}
                title={school.name}
                description={`${school.childrenCount} enfant(s)`}
                pinColor="#4CAF50"
                onPress={() => handleSchoolSelect(school)}
              />
            )
          ))}
          
          {/* Marqueurs du tracking */}
          {markers.map((marker) => {
            if (marker.isLive && busPosition) {
              // Marqueur du bus en mouvement avec rotation
              return (
                <Marker
                  key={marker.id}
                  coordinate={marker.coordinate}
                  title={marker.title}
                  description={marker.description}
                  anchor={{ x: 0.5, y: 0.5 }}
                  rotation={marker.heading}
                >
                  {renderBusMarker()}
                </Marker>
              );
            } else {
              // Marqueurs normaux
              return (
                <Marker
                  key={marker.id}
                  coordinate={marker.coordinate}
                  title={marker.title}
                  description={marker.description}
                  pinColor={marker.color}
                >
                  <View style={[
                    styles.customMarker,
                    marker.type === 'school' && styles.schoolMarker,
                    marker.type === 'child-stop' && styles.childStopMarker
                  ]}>
                    <Text style={[
                      styles.markerEmoji,
                      marker.type === 'school' && styles.schoolEmoji
                    ]}>
                      {marker.type === 'school' ? '🏫' : 
                       marker.type === 'child-stop' ? '📍' : '🚏'}
                    </Text>
                    {marker.order !== undefined && marker.type !== 'school' && (
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderText}>{marker.order}</Text>
                      </View>
                    )}
                  </View>
                </Marker>
              );
            }
          })}
          
          {/* Polyligne du trajet */}
          {polylines.map((polyline) => (
            <Polyline
              key={polyline.id}
              coordinates={polyline.coordinates}
              strokeColor={polyline.color}
              strokeWidth={polyline.width || 3}
              lineDashPattern={[5, 5]}
            />
          ))}
        </MapView>

        {/* Contrôles de la carte */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapControlButton}
            onPress={() => setShowChildrenList(true)}
          >
            <Ionicons name="people-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          {childTracking && (
            <TouchableOpacity
              style={[styles.mapControlButton, styles.clearButton]}
              onPress={handleClearTracking}
            >
              <Ionicons name="close-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {/* Bouton pour recentrer sur le bus */}
          {busPosition && (
            <TouchableOpacity
              style={[styles.mapControlButton, styles.centerButton]}
              onPress={() => {
                if (mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: busPosition.lat,
                    longitude: busPosition.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }, 1000);
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bouton flottant pour afficher/masquer le panneau */}
        {isSimulationActive && (
          <TouchableOpacity
            style={styles.panelToggleButton}
            onPress={() => setShowBottomPanel(!showBottomPanel)}
          >
            <Ionicons 
              name={showBottomPanel ? "chevron-down" : "chevron-up"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Panneau inférieur - avec option de toggle */}
      {showBottomPanel && (
        <View style={isPanelCollapsed ? styles.bottomPanelHidden : styles.bottomPanelVisible}>
          {/* En-tête du panneau avec bouton de réduction */}
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>
              {childTracking ? 'Détails du trajet' : 'Écoles de vos enfants'}
            </Text>
            <TouchableOpacity 
              style={styles.panelToggleIcon}
              onPress={() => setIsPanelCollapsed(!isPanelCollapsed)}
            >
              <Ionicons 
                name={isPanelCollapsed ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {childTracking ? (
            // Informations détaillées du trajet
            <ScrollView style={styles.trackingInfo}>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{childTracking.child.name}</Text>
                <Text style={styles.childBus}>{childTracking.child.busText}</Text>
              </View>

              {childTracking.route && (
                <View style={styles.routeInfo}>
                  <Text style={styles.sectionTitle}>Trajet du bus</Text>
                  <Text style={styles.routeName}>
                    {childTracking.route.trajet?.nom || 'Trajet non spécifié'}
                  </Text>
                  <Text style={styles.routeTime}>
                    {childTracking.route.trajet?.heureDebut} -{' '}
                    {childTracking.route.trajet?.heureFin}
                  </Text>
                  <Text style={styles.stopsCount}>
                    {childTracking.route.totalStops} arrêts
                  </Text>
                </View>
              )}

              {childTracking.child.stop && (
                <View style={styles.stopInfo}>
                  <Text style={styles.sectionTitle}>Arrêt de l'enfant</Text>
                  <Text style={styles.stopAddress}>
                    {childTracking.child.stop.address}
                  </Text>
                </View>
              )}

              {childTracking.school && (
                <View style={styles.schoolInfoPanel}>
                  <Text style={styles.sectionTitle}>École</Text>
                  <Text style={styles.schoolName}>
                    {childTracking.school.name}
                  </Text>
                  <Text style={styles.schoolAddress}>
                    {childTracking.school.address}
                  </Text>
                </View>
              )}
              
              {/* Informations de simulation */}
              {isSimulationActive && simulationStatus && (
                <View style={styles.simulationInfoPanel}>
                  <Text style={styles.sectionTitle}>Simulation en cours</Text>
                  <View style={styles.simulationStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="speedometer" size={20} color="#2196F3" />
                      <Text style={styles.statText}>
                        Vitesse: {simulationSpeed}x
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="flag" size={20} color="#4CAF50" />
                      <Text style={styles.statText}>
                        Arrêts complétés: {simulationStatus.completedStops}/{simulationStatus.totalStops}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={20} color="#FF9800" />
                      <Text style={styles.statText}>
                        Progression: {simulationStatus.progress}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            // Liste des écoles
            <ScrollView
              style={styles.schoolsList}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#2196F3']}
                />
              }
            >
              <Text style={styles.sectionTitle}>Écoles de vos enfants</Text>
              
              {schools.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="school-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyStateText}>
                    Aucune école trouvée pour vos enfants
                  </Text>
                </View>
              ) : (
                schools.map((school) => (
                  <TouchableOpacity
                    key={school.id}
                    style={styles.schoolCard}
                    onPress={() => handleSchoolSelect(school)}
                  >
                    <View style={styles.schoolIcon}>
                      <Ionicons name="school" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.schoolInfo}>
                      <Text style={styles.schoolName}>{school.name}</Text>
                      <Text style={styles.schoolAddress}>{school.address}</Text>
                      <Text style={styles.schoolChildren}>
                        {school.childrenCount} enfant(s)
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#999999"
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Modal pour la liste des enfants */}
      <Modal
        visible={showChildrenList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChildrenList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vos enfants</Text>
              <TouchableOpacity onPress={() => setShowChildrenList(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.childrenList}>
              {children.length === 0 ? (
                <View style={styles.emptyChildren}>
                  <Ionicons name="people-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyChildrenText}>
                    Aucun enfant enregistré
                  </Text>
                </View>
              ) : (
                children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.childCard,
                      selectedChild?.id === child.id && styles.childCardSelected,
                    ]}
                    onPress={() => handleChildSelect(child)}
                  >
                    <View style={styles.childIcon}>
                      <Ionicons name="person" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.childCardInfo}>
                      <Text style={styles.childCardName}>{child.name}</Text>
                      <Text style={styles.childCardBus}>{child.busText}</Text>
                      <Text style={styles.childCardStop}>
                        {child.stop?.address || 'Arrêt non défini'}
                      </Text>
                    </View>
                    {child.hasBus && (
                      <Ionicons name="bus" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}