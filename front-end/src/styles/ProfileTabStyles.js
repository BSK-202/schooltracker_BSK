import { StyleSheet } from 'react-native';

const ProfileTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#3498db',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileEmoji: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  profileRole: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  infoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
   // Nouveaux styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  
  loadingColor: '#007AFF',
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  refreshControlColor: '#007AFF',
  
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  profileEmoji: {
    fontSize: 48,
  },
  
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  
  busBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  
  busBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  infoSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  
  infoItem: {
    marginBottom: 20,
  },
  
  infoItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  infoItemIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
    marginLeft: 28,
  },
  
  actionsSection: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    color: '#333',
    fontWeight: '500',
  },
  
  actionButtonSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  
  logoutButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: 'white',
  },
  
  logoutButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

});

export default ProfileTabStyles;