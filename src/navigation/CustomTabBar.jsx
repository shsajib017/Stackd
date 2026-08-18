import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../config/ThemeContext';
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
  const { theme } = useTheme();
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

      <View style={[styles.container, { bottom: insets.bottom + 16, backgroundColor: theme.colors.surface }]}>
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
                <TouchableOpacity style={[styles.fabButton, { backgroundColor: theme.colors.primary }]} onPress={toggleSpeedDial} activeOpacity={0.85}>
                  <Animated.Text style={[styles.fabText, { color: theme.colors.surface }, fabIconStyle]}>+</Animated.Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>{config.active}</Text>
                {isFocused && <Text style={[styles.tabLabel, { color: theme.colors.primary }]}>{config.label}</Text>}
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
    position: 'absolute', left: 16, right: 16, height: 64,
    borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: 8, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, zIndex: 95,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  tabIcon: { fontSize: 16, opacity: 0.5 },
  tabIconActive: { fontSize: 20, opacity: 1, transform: [{ scale: 1.1 }] },
  tabLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  fabButton: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', top: -18, elevation: 4,
  },
  fabText: { fontSize: 28, lineHeight: 32, fontWeight: '300' },
});

export default CustomTabBar;
