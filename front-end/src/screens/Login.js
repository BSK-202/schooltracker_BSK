import React from 'react';
import {
  StatusBar,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Input from '../components/Input';
import LoginStyles from '../styles/LoginStyles';
import { useAuth } from '../hooks/useAuth';


export default function LoginScreen({ navigation }) {
  const {
    phone,
    setPhone,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  } = useAuth();

  const onLoginPress = async () => {
    const result = await handleLogin();
    
    if (result && !result.success) {
      // Affichage d'alerte avec des informations détaillées
      Alert.alert(
        'Erreur de connexion',
        result.error || 'Une erreur est survenue',
        [{ text: 'OK', style: 'cancel' }]
      );
    } else {
       navigation.navigate('Home');
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
          {/* Header */}
          <View style={LoginStyles.header}>
            <Text style={LoginStyles.welcomeText}>Welcome to School Tracker!</Text>
            <Text style={LoginStyles.subtitle}>
              Connectez-vous pour suivre le transport scolaire en temps réel
            </Text>
          </View>

          {/* Formulaire */}
          <View style={LoginStyles.formContainer}>
            {/* Champ téléphone */}
            <View style={LoginStyles.inputContainer}>
              <Input
                placeholder="Saisissez votre numéro de téléphone"
                keyboardType="phone-pad"
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />
            </View>

            {/* Champ mot de passe */}
            <View style={LoginStyles.inputContainer}>
              <Input
                placeholder="Saisissez votre mot de passe"
                keyboardType="default"
                secureTextEntry={true}
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {/* Affichage des erreurs */}
            {error && (
              <View style={LoginStyles.errorContainer}>
                <Text style={LoginStyles.errorText}>{error}</Text>
              </View>
            )}

            {/* Bouton de connexion */}
            <View style={LoginStyles.buttonContainer}>
              <TouchableOpacity
                style={[
                  LoginStyles.loginButton,
                  loading && LoginStyles.loginButtonDisabled,
                ]}
                onPress={onLoginPress}
                disabled={loading}
              >
                <Text style={LoginStyles.loginButtonText}>
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={LoginStyles.footer}>
            <TouchableOpacity disabled={loading}>
              <Text style={LoginStyles.forgotPassword}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Signup')}
              disabled={loading}
            >
              <Text style={LoginStyles.signupText}>
                Pas encore de compte ?{' '}
                <Text style={LoginStyles.signupLink}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}