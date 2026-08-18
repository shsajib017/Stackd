import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../config/ThemeContext';
import CustomTabBar from './CustomTabBar';
import HomeStack from './HomeStack';
import StudyStack from './StudyStack';
import BudgetStack from './BudgetStack';
import ProfileStack from './ProfileStack';

import AddExpenseModal from '../screens/modals/AddExpenseModal';
import AddIncomeModal from '../screens/modals/AddIncomeModal';
import LogMealModal from '../screens/modals/LogMealModal';
import PomodoroModal from '../screens/modals/PomodoroModal';
import SessionCompleteModal from '../screens/modals/SessionCompleteModal';
import BudgetSettingsScreen from '../screens/budget/BudgetSettingsScreen';
import AccountScreen from '../screens/profile/AccountScreen';

import ManualFoodEntryScreen from '../screens/meals/ManualFoodEntryScreen';
import MealsHistoryScreen from '../screens/meals/MealsHistoryScreen';
import MealsScreen from '../screens/meals/MealsScreen';
import MyFoodsScreen from '../screens/meals/MyFoodsScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

/**
 * 4-Tab Bottom Navigator with Custom Tab Bar.
 */
const MainTabs = React.memo(() => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} />
      <Tab.Screen name="StudyStack" component={StudyStack} />
      <Tab.Screen name="BudgetStack" component={BudgetStack} />
      <Tab.Screen name="ProfileStack" component={ProfileStack} />
    </Tab.Navigator>
  );
});

/**
 * App Navigator coordinating 4 main tabs and global modal screens.
 */
const AppNavigator = React.memo(() => {
  const { theme } = useTheme();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: theme.fontSizes.lg,
          color: theme.colors.textPrimary,
        },
        headerBackTitleVisible: false,
        headerTransparent: true,
      }}
    >
      <RootStack.Screen name="MainTabs" component={MainTabs} />

      {/* Full Screen & Bottom Sheet Modals */}
      <RootStack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
        <RootStack.Screen name="PomodoroModal" component={PomodoroModal} />
        <RootStack.Screen name="SessionCompleteModal" component={SessionCompleteModal} />
        <RootStack.Screen name="LogMealModal" component={LogMealModal} />
        <RootStack.Screen name="AddExpenseModal" component={AddExpenseModal} />
        <RootStack.Screen name="AddIncomeModal" component={AddIncomeModal} />
        <RootStack.Screen name="MealsScreen" component={MealsScreen} />
        <RootStack.Screen name="MealsHistoryScreen" component={MealsHistoryScreen} />
        <RootStack.Screen name="ManualFoodEntryScreen" component={ManualFoodEntryScreen} />
        <RootStack.Screen name="MyFoodsScreen" component={MyFoodsScreen} />
        <RootStack.Screen name="BudgetSettingsModal" component={BudgetSettingsScreen} />
        <RootStack.Screen name="AccountModal" component={AccountScreen} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
});

export default AppNavigator;
