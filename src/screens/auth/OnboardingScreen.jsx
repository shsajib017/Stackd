import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../config/ThemeContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  { id: '1', emoji: '💰', title: 'Track Your Budget', subtitle: 'Log expenses and income, set limits, and never overspend again' },
  { id: '2', emoji: '📚', title: 'Study Smarter', subtitle: 'Plan your study schedule, track sessions, and ace your exams' },
  { id: '3', emoji: '🍽️', title: 'Log Your Meals', subtitle: 'Track dorm meals and outside food spending all in one place' },
];

/**
 * Onboarding Carousel Screen with 3 feature slides and slide pagination.
 */
const OnboardingScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleFinish = useCallback(async () => {
    try {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      navigation.replace('LoginScreen');
    } catch {
      navigation.replace('LoginScreen');
    }
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      handleFinish();
    }
  }, [currentIndex, handleFinish]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentIndex(index);
  }, []);

  const renderSlide = useCallback(({ item }) => (
    <View style={styles.slide}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
    </View>
  ), [theme.colors.textPrimary, theme.colors.textSecondary]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <ScreenWrapper noPadding edges={['top', 'bottom']}>
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        ) : <View style={styles.skipPlaceholder} />}
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        bounces={false}
      />

      <View style={styles.bottomSection}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i
                  ? [styles.activeDot, { backgroundColor: theme.colors.primary }]
                  : [styles.inactiveDot, { backgroundColor: theme.colors.textTertiary }],
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextButtonText, { color: theme.colors.surface }]}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24, paddingTop: 16, alignItems: 'flex-end', minHeight: 50 },
  skipText: { fontSize: 14, fontWeight: '600' },
  skipPlaceholder: { height: 14 },
  slide: { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emoji: { fontSize: 68, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomSection: { paddingHorizontal: 32, paddingBottom: 48 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  dot: { height: 8, borderRadius: 999, marginHorizontal: 4 },
  activeDot: { width: 24 },
  inactiveDot: { width: 8 },
  nextButton: { paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 16, fontWeight: 'bold' },
});

export default OnboardingScreen;
