import React, { useCallback } from 'react';
import {
  StatusBar,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import Input from '../components/Input';
import LoginStyles from '../styles/LoginStyles';
import { useAuth } from '../Hooks/useAuth';

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

  const onLoginPress = useCallback(async () => {
    const result = await handleLogin();

    if (result && !result.success) {
      // L'erreur est maintenant gérée par le hook useAuth
      // On affiche simplement l'erreur dans l'UI (via le state error)
    } else {
      navigation.navigate('Home');
    }
  }, [handleLogin, navigation]);

  return (
    <ImageBackground
      source={require('../../assets/loading_page.png')}
      style={LoginStyles.background}
      resizeMode="cover"
      // Optimisations importantes pour alléger
      fadeDuration={0}               // évite l'animation de fade qui consomme du CPU
      resizeMethod="resize"          // plus performant que scale sur beaucoup d'appareils
      imageStyle={{ opacity: 0.85 }} // légère réduction d'opacité = rendu plus rapide
    >
      <StatusBar barStyle="light-content" />

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
                placeholder="Votre numéro de téléphone"
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
                placeholder="Votre mot de passe"
                secureTextEntry
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>

            {/* Affichage des erreurs – maintenant visible en permanence */}
            {(error || loading) && (
              <View style={LoginStyles.errorContainer}>
                <Text style={LoginStyles.errorText}>
                  {loading ? 'Connexion en cours...' : error || 'Erreur inconnue'}
                </Text>
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
                activeOpacity={0.75}
              >
                <Text style={LoginStyles.loginButtonText}>
                  {loading ? 'Connexion...' : 'Se connecter'}
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