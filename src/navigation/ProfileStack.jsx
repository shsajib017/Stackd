import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BMICalculatorScreen from '../screens/profile/BMICalculatorScreen';
import GoalsScreen from '../screens/profile/GoalsScreen';
import AppSettingsScreen from '../screens/profile/AppSettingsScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Profile & Settings module.
 */
const ProfileStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BMICalculatorScreen" component={BMICalculatorScreen} options={{ title: 'BMI & Calories' }} />
      <Stack.Screen name="GoalsScreen" component={GoalsScreen} options={{ title: 'Academic Goals' }} />
      <Stack.Screen name="AppSettingsScreen" component={AppSettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ title: 'Account' }} />
    </Stack.Navigator>
  );
});

export default ProfileStack;
