import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, spacing } from '../../config/theme';

/**
 * Standard App Top Bar Header for Main Screens.
 * Bypasses native Android Toolbar hit-test overlap bugs and ensures 100% reliable hamburger taps.
 */
const AppHeader = React.memo(({ title, onMenuPress, rightElement }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.contentRow}>
        <TouchableOpacity
          onPress={onMenuPress}
          style={styles.menuBtn}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          activeOpacity={0.6}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightBox}>
          {rightElement || null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.textTertiary}20`,
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  menuIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSizes.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  rightBox: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default AppHeader;
