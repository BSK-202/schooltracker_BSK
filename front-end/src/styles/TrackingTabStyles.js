import { StyleSheet } from 'react-native';

const TrackingTabStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 20,
  },
  mapPlaceholder: {
    width: '90%',
    height: 300,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default TrackingTabStyles;