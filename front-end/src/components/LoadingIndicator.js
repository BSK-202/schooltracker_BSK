import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

export default function LoadingIndicator(props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={props.size} color="#ffffff" />
      <Text style={styles.text}>{props.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    marginTop: 10,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  }
});
