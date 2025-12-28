import React, { useState } from 'react';
import { loginSuccess, logout } from '../redux/Authslice';
import { useDispatch } from 'react-redux';
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

import * as SecureStore from 'expo-secure-store';
import loginApi from '../APIS/loginApi';
export default function Login({ navigation }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async () => {

    try {

      console.log("avant appel APIlogin:");

      const response = await loginApi.post("/auth/login", { phone, password });
      console.log("apres appel APIlogin:");

      if (response.data.message === "Connexion reussie") {
        let token = response.data.acces_token;
        console.log("TokenBACK:" + token);


        // stockage sécurisé du JWT
        await SecureStore.setItemAsync("acces_token", token);
        dispatch(loginSuccess(token));
        console.log("Token stored in SecureStore (setItemAsync done)");

        const storedToken = await SecureStore.getItemAsync("acces_token");
        console.log("TokenFront: " + storedToken);

      }

    } catch (error) {
      console.log("erreur lors appel APIlogin:");
      console.log("erreur lors appel APIlogin:");
      // Ajoute ces logs pour debugger :
      console.error("Erreur complète:", error);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.error("URL:", error.config?.url);

      Alert.alert("Erreur", "hello Phone ou password incorrect");
      dispatch(logout());
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