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
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Budget tab.
 */
const BudgetStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="BudgetScreen" component={BudgetScreen} options={{ title: 'Budget & Expenses' }} />
      <Stack.Screen name="AddExpenseScreen" component={AddExpenseScreen} options={{ title: 'Add Expense' }} />
      <Stack.Screen name="EditExpenseScreen" component={EditExpenseScreen} options={{ title: 'Edit Expense' }} />
      <Stack.Screen name="AddIncomeScreen" component={AddIncomeScreen} options={{ title: 'Add Income' }} />
      <Stack.Screen name="EditIncomeScreen" component={EditIncomeScreen} options={{ title: 'Edit Income' }} />
      <Stack.Screen name="TransactionHistoryScreen" component={TransactionHistoryScreen} options={{ title: 'Transaction History' }} />
      <Stack.Screen name="SavingsGoalsScreen" component={SavingsGoalsScreen} options={{ title: 'Savings Goals' }} />
      <Stack.Screen name="CreateGoalScreen" component={CreateGoalScreen} options={{ title: 'Create Goal' }} />
      <Stack.Screen name="EditGoalScreen" component={EditGoalScreen} options={{ title: 'Edit Goal' }} />
      <Stack.Screen name="BudgetSettingsScreen" component={BudgetSettingsScreen} options={{ title: 'Budget Settings' }} />
      <Stack.Screen name="SpendingReportScreen" component={SpendingReportScreen} options={{ title: 'Spending Report' }} />
    </Stack.Navigator>
  );
});

export default BudgetStack;
