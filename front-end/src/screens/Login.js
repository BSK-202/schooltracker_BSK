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
import loginAPI from '../APIS/loginAPI';
import * as SecureStore from 'expo-secure-store';

export default function Login({ navigation, setIsLoggedIn }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {

    try {

      const response = await loginAPI.post("/auth/login", { phone, password });

      if (response.data.message === "Connexion reussie") {
        setIsLoggedIn(true);
        let token = response.data.acces_token;
        console.log("TokenBACK:" + token);

        // tockage sécurisé du JWT
        await SecureStore.setItemAsync("acces_token", token);
        console.log("Token stored in SecureStore (setItemAsync done)");

        const storedToken = await SecureStore.getItemAsync("acces_token");
        console.log("TokenFront: " + storedToken);

      }

    } catch (error) {
      Alert.alert("Erreur", "Phone ou password incorrect");
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