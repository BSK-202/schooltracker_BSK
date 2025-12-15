import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Input from '../components/Input';
import LoginStyles from '../styles/LoginStyles';

export default function Signup({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('parent'); // 'parent' ou 'driver'

  const handleSignup = () => {
    // Validation simple
    if (!name || !phone || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Erreur', 'Le numéro de téléphone doit avoir 10 chiffres');
      return;
    }

    // Ici normalement, vous enverriez les données à un backend
    // Pour l'instant, on simule une inscription réussie
Alert.alert(
  'Succès',
  `Compte ${userType === 'parent' ? 'Parent' : 'Chauffeur'} créé avec succès!`,
  [
    {
      text: 'OK',
      onPress: () => {
        navigation.navigate('Login');
      }
    }
  ]
);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20, paddingTop: 50 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}>
          Créer un compte
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Type de compte:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: userType === 'parent' ? '#3498db' : '#ecf0f1',
                borderRadius: 10,
                flex: 1,
                marginRight: 10,
                alignItems: 'center',
              }}
              onPress={() => setUserType('parent')}
            >
              <Text style={{ color: userType === 'parent' ? 'white' : 'black' }}>
                Parent
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: userType === 'driver' ? '#3498db' : '#ecf0f1',
                borderRadius: 10,
                flex: 1,
                marginLeft: 10,
                alignItems: 'center',
              }}
              onPress={() => setUserType('driver')}
            >
              <Text style={{ color: userType === 'driver' ? 'white' : 'black' }}>
                Chauffeur
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 15 }}>
          <Input
            placeholder="Nom complet"
            icon="person-outline"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={{ marginBottom: 15 }}>
          <Input
            placeholder="Numéro de téléphone"
            keyboardType="phone-pad"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={{ marginBottom: 15 }}>
          <Input
            placeholder="Mot de passe"
            secureTextEntry={true}
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={{ marginBottom: 30 }}>
          <Input
            placeholder="Confirmer le mot de passe"
            secureTextEntry={true}
            icon="lock-closed-outline"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: '#3498db',
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
          onPress={handleSignup}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
            S'inscrire
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{ textAlign: 'center', color: '#3498db' }}>
            Déjà un compte ? Se connecter
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}