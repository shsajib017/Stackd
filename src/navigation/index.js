import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

/**
 * Root navigator coordinating Auth and App flows.
 */
const RootNavigator = React.memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AuthNavigator"
        component={AuthNavigator}
      />
      <Stack.Screen
        name="AppNavigator"
        component={AppNavigator}
      />
    </Stack.Navigator>
  );
});

export default RootNavigator;
