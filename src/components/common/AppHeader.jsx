import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';

/**
 * Universal App Top Bar Header for Main Screens and Subscreens.
 * Guarantees 100% reliable touch responsiveness for both menu and back buttons.
 */
const AppHeader = React.memo(({
  title,
  onMenuPress,
  showBack = false,
  onBack,
  rightElement,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <View style={styles.contentRow}>
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.actionBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.6}
          >
            <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
        ) : onMenuPress ? (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.actionBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.6}
          >
            <Text style={[styles.menuIcon, { color: theme.colors.textPrimary }]}>☰</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionPlaceholder} />
        )}

        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.rightBox}>
          {rightElement || <View style={styles.actionPlaceholder} />}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  actionPlaceholder: {
    width: 44,
  },
  menuIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '800',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
  },
  rightBox: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default AppHeader;
