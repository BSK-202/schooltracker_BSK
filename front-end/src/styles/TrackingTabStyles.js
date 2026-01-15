// front-end/src/screens/trackingTabStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const trackingTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerWithSimulation: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  
  // Simulation controls
  simulationControls: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  simulationInfo: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 6,
  },
  simulationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#FF5722',
  },
  speedButton: {
    backgroundColor: '#2196F3',
  },
  errorButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  speedControls: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  speedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  speedButtonStyle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
  },
  speedButtonActive: {
    backgroundColor: '#2196F3',
  },
  speedButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  customSpeedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customSpeedInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  customSpeedButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customSpeedButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Map containers
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapContainerFullScreen: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  
  // Bus marker - STYLES CORRIGÉS
  busMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busIcon: {
    // L'icône sera stylée directement dans le composant
  },
  speedBadge: {
    position: 'absolute',
    bottom: -5,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Custom markers
  customMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  schoolMarker: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  childStopMarker: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  markerEmoji: {
    fontSize: 24,
  },
  schoolEmoji: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF9800',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 1000,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Map controls
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
  },
  mapControlButton: {
    backgroundColor: '#2196F3',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  centerButton: {
    backgroundColor: '#9C27B0',
  },
  
  // Bottom panel
  bottomPanel: {
    height: height * 0.35,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  bottomPanelHidden: {
    height: 0,
  },
  bottomPanelVisible: {
    height: height * 0.35,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  
  // Panel toggle button
  panelToggleButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  
  // Panel header with toggle
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  panelToggleIcon: {
    padding: 4,
  },
  
  // Schools list
  schoolsList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 12,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  schoolIcon: {
    marginRight: 12,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  schoolAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  schoolChildren: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Tracking info
  trackingInfo: {
    flex: 1,
  },
  childInfo: {
    padding: 16,
    marginBottom: 10,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  childBus: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 4,
  },
  routeInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  routeTime: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  stopsCount: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginTop: 8,
  },
  stopInfo: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  stopAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  schoolInfoPanel: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  simulationInfoPanel: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  simulationStats: {
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  childrenList: {
    padding: 20,
  },
  emptyChildren: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyChildrenText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  childCardSelected: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  childIcon: {
    marginRight: 12,
  },
  childCardInfo: {
    flex: 1,
  },
  childCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  childCardBus: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 2,
  },
  childCardStop: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});

export default trackingTabStyles;