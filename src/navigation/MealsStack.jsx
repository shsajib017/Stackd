import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MealsScreen from '../screens/meals/MealsScreen';
import ManualFoodEntryScreen from '../screens/meals/ManualFoodEntryScreen';
import MyFoodsScreen from '../screens/meals/MyFoodsScreen';
import MealsHistoryScreen from '../screens/meals/MealsHistoryScreen';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Meals module with in-screen custom AppHeader.
 */
const MealsStack = React.memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MealsScreen" component={MealsScreen} />
      <Stack.Screen name="ManualFoodEntryScreen" component={ManualFoodEntryScreen} />
      <Stack.Screen name="MyFoodsScreen" component={MyFoodsScreen} />
      <Stack.Screen name="MealsHistoryScreen" component={MealsHistoryScreen} />
    </Stack.Navigator>
  );
});

export default MealsStack;
