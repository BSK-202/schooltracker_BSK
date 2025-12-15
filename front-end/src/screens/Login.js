import React, { useState } from 'react';
import { 
  StatusBar, 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import Input from '../components/Input';
import LoginStyles from '../styles/LoginStyles';

export default function Login({ navigation, setIsLoggedIn }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Authentification statique
    if (phone === '0674336184' && password === '1234') {
      // Authentification réussie
      setIsLoggedIn(true);
      // La navigation vers Home se fera automatiquement via la condition dans App.js
    } else {
      Alert.alert(
        'Erreur',
        'Numéro de téléphone ou mot de passe incorrect',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/loading_page.png')}
      style={LoginStyles.background}
      resizeMode="cover"
    >
      <StatusBar style="auto" />
      
      <View style={LoginStyles.overlay}>
        <View style={LoginStyles.contentContainer}>
          <View style={LoginStyles.header}>
            <Text style={LoginStyles.welcomeText}>Welcome to School Tracker!</Text>
            <Text style={LoginStyles.subtitle}>
              Connectez-vous pour suivre le transport scolaire en temps réel
            </Text>
          </View>

          <View style={LoginStyles.formContainer}>
            <View style={LoginStyles.inputContainer}>
              <Input
                placeholder='Saisissez votre numéro de téléphone'
                keyboardType='phone-pad'
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            
            <View style={LoginStyles.inputContainer}>
              <Input
                placeholder='Saisissez votre mot de passe'
                keyboardType='default'
                secureTextEntry={true}
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={LoginStyles.buttonContainer}>
              <TouchableOpacity 
                style={LoginStyles.loginButton}
                onPress={handleLogin}
              >
                <Text style={LoginStyles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={LoginStyles.footer}>
            <TouchableOpacity>
              <Text style={LoginStyles.forgotPassword}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={LoginStyles.signupText}>
                Pas encore de compte ? <Text style={LoginStyles.signupLink}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}