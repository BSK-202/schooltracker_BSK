
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Signup from '../screens/Signup';

import {useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={Login}/>
            <Stack.Screen name="Signup" component={Signup}/>
          </>
        ) : (
          <Stack.Screen name="Home" component={Home}/>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}