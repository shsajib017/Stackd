import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import Avatar from './Avatar';

/** Drawer Profile Header Component */
const DrawerProfile = React.memo(({ onPress }) => {
  const profile = useAuthStore((s) => s.profile);
  const name = profile?.name || 'Student';
  const university = profile?.university || 'University Student';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar name={name} size={56} imageUrl={profile?.avatar_url} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.university} numberOfLines={1}>{university}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textTertiary}20`,
  },
  info: { flex: 1, marginLeft: spacing.md },
  name: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary },
  university: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: fontSizes.xxl, color: colors.textTertiary, paddingHorizontal: spacing.xs },
});

export default DrawerProfile;
