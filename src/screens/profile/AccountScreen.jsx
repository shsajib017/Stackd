import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../config/ThemeContext';
import AppHeader from '../../components/common/AppHeader';
import ScreenWrapper from '../../components/common/ScreenWrapper';

/**
 * Account management screen with user credentials information and security actions.
 *
 * @param {Object} props
 * @param {Object} props.navigation - React Navigation prop.
 */
const AccountScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <ScreenWrapper>
      <AppHeader title="Account" showBack onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Registered Email</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{user?.email || 'student@university.edu'}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Account ID</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{user?.id || 'demo-user-id'}</Text>
        </View>
        <View style={styles.btnWrapper}>
          <Button label="Change Password" variant="secondary" fullWidth onPress={() => {}} />
        </View>
      </View>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingVertical: 8,
  },
  card: {
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 10,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnWrapper: {
    marginTop: 16,
  },
});

export default AccountScreen;
