import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealsScreen from '../screens/meals/MealsScreen';
import ManualFoodEntryScreen from '../screens/meals/ManualFoodEntryScreen';
import MyFoodsScreen from '../screens/meals/MyFoodsScreen';
import MealsHistoryScreen from '../screens/meals/MealsHistoryScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Meals module (unused — meals accessed via modals).
 */
const MealsStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
      }}
    >
      <Stack.Screen name="MealsScreen" component={MealsScreen} options={{ title: 'Meals & Calories' }} />
      <Stack.Screen name="ManualFoodEntryScreen" component={ManualFoodEntryScreen} options={{ title: 'Add Custom Food' }} />
      <Stack.Screen name="MyFoodsScreen" component={MyFoodsScreen} options={{ title: 'My Custom Foods' }} />
      <Stack.Screen name="MealsHistoryScreen" component={MealsHistoryScreen} options={{ title: 'Meals History' }} />
    </Stack.Navigator>
  );
});

export default MealsStack;
