import React from 'react';
import AddIncomeScreen from '../budget/AddIncomeScreen';

/**
 * Add Income Modal wrapping the AddIncomeScreen form.
 */
const AddIncomeModal = React.memo(({ navigation, route }) => {
  return <AddIncomeScreen navigation={navigation} route={route} />;
});

export default AddIncomeModal;
