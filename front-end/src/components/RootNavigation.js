import React, { Suspense, memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

const Login = React.lazy(() => import('../screens/Login'));
const Signup = React.lazy(() => import('../screens/Signup'));
const Home = React.lazy(() => import('../screens/Home'));

function AuthNavigator() {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
        </>
      ) : (
        <Stack.Screen name="Home" component={Home} />
      )}
    </Stack.Navigator>
  );
}

const MemoizedAuthNavigator = memo(AuthNavigator);

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Suspense fallback={<></>}>
        <MemoizedAuthNavigator />
      </Suspense>
    </NavigationContainer>
  );
}