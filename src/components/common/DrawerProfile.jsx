import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import Avatar from './Avatar';

/** Drawer Profile Header Component */
const DrawerProfile = React.memo(({ onPress }) => {
  const { theme } = useTheme();
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.name || 'Student';
  const university = profile?.university || 'University Student';

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: `${theme.colors.textTertiary}20` }]} onPress={onPress} activeOpacity={0.7}>
      <Avatar name={name} size={56} imageUrl={profile?.avatar_url} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.textPrimary }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.university, { color: theme.colors.textSecondary }]} numberOfLines={1}>{university}</Text>
      </View>
      <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 14, fontWeight: '800' },
  university: { fontSize: 10, marginTop: 2 },
  chevron: { fontSize: 24, paddingHorizontal: 4 },
});

export default DrawerProfile;
