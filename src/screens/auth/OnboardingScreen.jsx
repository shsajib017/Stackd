import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

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
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleFinish} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.skipText}>Skip</Text>
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
            <View key={i} style={[styles.dot, currentIndex === i ? styles.activeDot : styles.inactiveDot]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, alignItems: 'flex-end', minHeight: 50 },
  skipText: { fontSize: fontSizes.md, color: colors.textSecondary, fontWeight: '600' },
  skipPlaceholder: { height: fontSizes.md },
  slide: { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  emoji: { fontSize: 68, marginBottom: spacing.md },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: fontSizes.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  bottomSection: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  dot: { height: 8, borderRadius: borderRadius.full, marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: colors.primary },
  inactiveDot: { width: 8, backgroundColor: colors.textTertiary },
  nextButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
  nextButtonText: { color: colors.surface, fontSize: fontSizes.lg, fontWeight: 'bold' },
});

export default OnboardingScreen;
