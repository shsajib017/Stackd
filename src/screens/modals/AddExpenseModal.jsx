import React from 'react';
import AddExpenseScreen from '../budget/AddExpenseScreen';

/**
 * Add Expense Modal wrapping the AddExpenseScreen form.
 */
const AddExpenseModal = React.memo(({ navigation, route }) => {
  return <AddExpenseScreen navigation={navigation} route={route} />;
});

export default AddExpenseModal;
