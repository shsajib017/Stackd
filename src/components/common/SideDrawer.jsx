import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, shadows, spacing } from '../../config/theme';
import useSavings from '../../hooks/useSavings';
import DrawerGoals from './DrawerGoals';
import DrawerProfile from './DrawerProfile';
import DrawerSettings from './DrawerSettings';
import Input from './Input';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;
const ANIM_MS = 180;

/** Fast and Reusable Left Side Drawer with Modal and GestureHandlerRootView. */
const SideDrawer = React.memo(({ visible, onClose, navigation }) => {
  const insets = useSafeAreaInsets();
  const { goals } = useSavings();
  const [searchQuery, setSearchQuery] = useState('');

  const translateX = useSharedValue(-DRAWER_WIDTH);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateX.value = -DRAWER_WIDTH;
      backdropOpacity.value = 0;
      translateX.value = withTiming(0, { duration: ANIM_MS, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(0.5, { duration: ANIM_MS, easing: Easing.out(Easing.cubic) });
    } else {
      setSearchQuery('');
    }
  }, [backdropOpacity, translateX, visible]);

  const handleClose = () => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 150, easing: Easing.in(Easing.cubic) });
    backdropOpacity.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX(-15)
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
        backdropOpacity.value = Math.max(0, 0.5 * (1 + e.translationX / DRAWER_WIDTH));
      }
    })
    .onEnd((e) => {
      if (e.translationX < -40 || e.velocityX < -300) {
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: 130 }, (finished) => {
          if (finished) runOnJS(onClose)();
        });
        backdropOpacity.value = withTiming(0, { duration: 130 });
      } else {
        translateX.value = withTiming(0, { duration: 130 });
        backdropOpacity.value = withTiming(0.5, { duration: 130 });
      }
    });

  const animatedDrawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <GestureHandlerRootView style={styles.modalRoot}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, animatedOverlayStyle]} />
        </TouchableWithoutFeedback>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.drawer, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md }, animatedDrawerStyle]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled bounces>
              <DrawerProfile onPress={() => { onClose(); navigation.navigate('ProfileStack'); }} />
              <DrawerGoals goals={goals} onSeeAllPress={() => { onClose(); navigation.navigate('BudgetStack', { screen: 'SavingsGoalsScreen' }); }} />

              <View style={styles.searchWrap}>
                <Input value={searchQuery} onChangeText={setSearchQuery} placeholder="Search settings..." style={styles.searchInput} />
              </View>

              <DrawerSettings navigation={navigation} onClose={onClose} searchQuery={searchQuery} />

              <View style={styles.footer}>
                <Text style={styles.versionText}>Stackd v1.0.0</Text>
              </View>
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    ...shadows.lg,
  },
  scrollContent: { flexGrow: 1 },
  searchWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  searchInput: { marginBottom: 0 },
  footer: { marginTop: 'auto', paddingVertical: spacing.lg, alignItems: 'center' },
  versionText: { fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600' },
});

export default SideDrawer;
