import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../config/theme';
import SpeedDialOverlay from './SpeedDialOverlay';

const TAB_ICONS = {
  HomeStack: { active: '🏠', label: 'Home' },
  StudyStack: { active: '📚', label: 'Study' },
  BudgetStack: { active: '💰', label: 'Budget' },
  ProfileStack: { active: '👤', label: 'Profile' },
};

/**
 * Custom animated floating pill bottom tab bar with center speed-dial FAB.
 */
const CustomTabBar = React.memo(({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const [isDialOpen, setIsDialOpen] = useState(false);
  const dialProgress = useSharedValue(0);

  const toggleSpeedDial = useCallback(() => {
    const nextState = !isDialOpen;
    setIsDialOpen(nextState);
    dialProgress.value = withSpring(nextState ? 1 : 0, { damping: 14 });
  }, [dialProgress, isDialOpen]);

  const closeDial = useCallback(() => {
    setIsDialOpen(false);
    dialProgress.value = withSpring(0, { damping: 14 });
  }, [dialProgress]);

  const handleDialAction = useCallback((modalName) => {
    closeDial();
    navigation.navigate(modalName);
  }, [closeDial, navigation]);

  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialProgress.value * 45}deg` }],
  }));

  return (
    <>
      <SpeedDialOverlay
        isOpen={isDialOpen}
        onClose={closeDial}
        onSelectAction={handleDialAction}
        progress={dialProgress}
        bottomInset={insets.bottom}
      />

      <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_ICONS[route.name] || { active: '•', label: route.name };

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <React.Fragment key={route.key}>
              {index === 2 && (
                <TouchableOpacity style={styles.fabButton} onPress={toggleSpeedDial} activeOpacity={0.85}>
                  <Animated.Text style={[styles.fabText, fabIconStyle]}>+</Animated.Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{config.active}</Text>
                {isFocused && <Text style={styles.tabLabel}>{config.label}</Text>}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: spacing.md, right: spacing.md, height: 64,
    backgroundColor: colors.surface, borderRadius: borderRadius.full,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: spacing.sm, ...shadows.md, zIndex: 95,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs,
  },
  tabIcon: { fontSize: fontSizes.lg, opacity: 0.5 },
  tabIconActive: { fontSize: fontSizes.xl, opacity: 1, transform: [{ scale: 1.1 }] },
  tabLabel: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: 'bold', marginTop: 2 },
  fabButton: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', top: -18, ...shadows.md,
  },
  fabText: { color: colors.surface, fontSize: 28, lineHeight: 32, fontWeight: '300' },
});

export default CustomTabBar;
