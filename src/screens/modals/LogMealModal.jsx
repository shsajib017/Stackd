import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';

/**
 * Log Meal Bottom Sheet Modal placeholder.
 */
const LogMealModal = React.memo(() => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LogMealModal</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default LogMealModal;
