import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';
import AppHeader from '../../components/common/AppHeader';

/**
 * Meals History Screen placeholder.
 */
const MealsHistoryScreen = React.memo(({ navigation }) => {
  return (
    <View style={styles.container}>
      <AppHeader title="Meals History" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.title}>MealsHistoryScreen</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default MealsHistoryScreen;
