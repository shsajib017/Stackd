import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BudgetScreen from '../screens/budget/BudgetScreen';
import AddExpenseScreen from '../screens/budget/AddExpenseScreen';
import EditExpenseScreen from '../screens/budget/EditExpenseScreen';
import AddIncomeScreen from '../screens/budget/AddIncomeScreen';
import EditIncomeScreen from '../screens/budget/EditIncomeScreen';
import TransactionHistoryScreen from '../screens/budget/TransactionHistoryScreen';
import SavingsGoalsScreen from '../screens/budget/SavingsGoalsScreen';
import CreateGoalScreen from '../screens/budget/CreateGoalScreen';
import EditGoalScreen from '../screens/budget/EditGoalScreen';
import BudgetSettingsScreen from '../screens/budget/BudgetSettingsScreen';
import SpendingReportScreen from '../screens/budget/SpendingReportScreen';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Budget tab with in-screen custom AppHeader.
 */
const BudgetStack = React.memo(() => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BudgetScreen" component={BudgetScreen} />
      <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} />
      <Stack.Screen name="EditExpenseScreen" component={EditExpenseScreen} />
      <Stack.Screen name="AddIncomeScreen" component={AddIncomeScreen} />
      <Stack.Screen name="EditIncomeScreen" component={EditIncomeScreen} />
      <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} />
      <Stack.Screen name="SavingsGoalsScreen" component={SavingsGoalsScreen} />
      <Stack.Screen name="CreateGoalScreen" component={CreateGoalScreen} />
      <Stack.Screen name="EditGoalScreen" component={EditGoalScreen} />
      <Stack.Screen name="BudgetSettingsScreen" component={BudgetSettingsScreen} />
      <Stack.Screen name="SpendingReportScreen" component={SpendingReportScreen} />
    </Stack.Navigator>
  );
});

export default BudgetStack;
