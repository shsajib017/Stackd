import React, { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import useAuthStore from '../store/useAuthStore';
import supabase from '../supabase/config';

const Stack = createNativeStackNavigator();

/**
 * Listens for auth state changes and navigates accordingly.
 */
const AuthGate = () => {
  const navigation = useNavigation();
  const prevAuth = useRef(useAuthStore.getState().isAuthenticated);

  useEffect(() => {
    const unsub = useAuthStore.subscribe((state) => {
      const wasAuth = prevAuth.current;
      const isAuth = state.isAuthenticated;
      prevAuth.current = isAuth;

      if (wasAuth && !isAuth) {
        // User just logged out — reset to auth flow
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: 'AuthNavigator' }] })
        );
      }
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        useAuthStore.getState().clearAuth();
      }
    });
    return () => subscription?.unsubscribe?.();
  }, []);

  return null;
};

/**
 * Root navigator coordinating Auth and App flows.
 */
const RootNavigator = React.memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
      <Stack.Screen name="AppNavigator" component={AppNavigator} />
    </Stack.Navigator>
  );
});

const RootWithAuthGate = () => (
  <>
    <RootNavigator />
    <AuthGate />
  </>
);

export default RootWithAuthGate;
