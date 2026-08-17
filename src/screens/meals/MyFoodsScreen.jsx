import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';
import AppHeader from '../../components/common/AppHeader';

/**
 * My Foods Screen placeholder.
 */
const MyFoodsScreen = React.memo(({ navigation }) => {
  return (
    <View style={styles.container}>
      <AppHeader title="My Custom Foods" showBack onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.title}>MyFoodsScreen</Text>
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

export default MyFoodsScreen;
