// styles/ProfileTabStyles.js
import { StyleSheet } from 'react-native';

const ProfileTabStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  loadingColor: '#3498db',
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileEmoji: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  
  // Badges
  busBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  busBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  childrenBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  childrenBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Sections communes
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionWithMargin: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Sections spécifiques
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  childrenSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  busSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Titres de section
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  
  // Info Items
  infoItem: {
    marginBottom: 16,
  },
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItemIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 26,
  },
  
  // Children Items
  childItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  childIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  childDetails: {
    marginLeft: 28,
  },
  childDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  childDetailLabel: {
    fontWeight: '600',
    color: '#3498db',
  },
  
  // Bus Card
  busCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  busTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  busDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  busDetailItem: {
    width: '48%',
    marginBottom: 12,
  },
  busDetailLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  busDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  active: {
    color: '#2ecc71',
  },
  inactive: {
    color: '#e74c3c',
  },
  
  // Student Items (for driver)
  studentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  studentStop: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  parentsInfo: {
    marginLeft: 28,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  parentText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  
  // Refresh Control
  refreshControlColor: '#3498db',
  
  // Footer & Logout
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 16,
    width: '100%',
    maxWidth: 300,
  },
  logoutButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  logoutButtonIcon: {
    fontSize: 20,
    marginRight: 10,
    color: 'white',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  
  // Additional Styles for ProfileTab
  profileImageContainer: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  // Statistics Cards
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#2c3e50',
    textAlign: 'center',
  },
  
  // Settings Items
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingsItemIcon: {
    fontSize: 20,
    marginRight: 16,
    color: '#3498db',
    width: 30,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  settingsItemArrow: {
    fontSize: 18,
    color: '#bdc3c7',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#ecf0f1',
  },
  modalButtonConfirm: {
    backgroundColor: '#3498db',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCancelText: {
    color: '#7f8c8d',
  },
  modalButtonConfirmText: {
    color: 'white',
  },
  
  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    color: '#bdc3c7',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
  },
});

export default ProfileTabStyles;