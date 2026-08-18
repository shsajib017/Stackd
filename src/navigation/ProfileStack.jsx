import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BMICalculatorScreen from '../screens/profile/BMICalculatorScreen';
import GoalsScreen from '../screens/profile/GoalsScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import AccountScreen from '../screens/profile/AccountScreen';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Profile & Settings module with in-screen custom AppHeader.
 */
const ProfileStack = React.memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="BMICalculatorScreen" component={BMICalculatorScreen} />
      <Stack.Screen name="GoalsScreen" component={GoalsScreen} />
      <Stack.Screen name="AppSettingsScreen" component={AppSettingsScreen} />
      <Stack.Screen name="AccountScreen" component={AccountScreen} />
    </Stack.Navigator>
  );
});

export default ProfileStack;
