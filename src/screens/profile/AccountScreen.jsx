import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { colors, fontSizes, spacing, borderRadius } from '../../config/theme';
import AppHeader from '../../components/common/AppHeader';

/**
 * Account management screen with user credentials information and security actions.
 *
 * @param {Object} props
 * @param {Object} props.navigation - React Navigation prop.
 */
const AccountScreen = React.memo(({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <AppHeader title="Account" showBack onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Registered Email</Text>
          <Text style={styles.value}>{user?.email || 'student@university.edu'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Account ID</Text>
          <Text style={styles.value}>{user?.id || 'demo-user-id'}</Text>
        </View>
        <View style={styles.btnWrapper}>
          <Button title="Change Password" variant="outline" onPress={() => {}} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  btnWrapper: {
    marginTop: spacing.lg,
  },
});

export default AccountScreen;
