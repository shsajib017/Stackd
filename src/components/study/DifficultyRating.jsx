import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

const DIFFICULTY_LABELS = {
  1: '1★ Very easy',
  2: '2★ Easy',
  3: '3★ Moderate',
  4: '4★ Hard',
  5: '5★ Very hard',
};

/**
 * 5-Star Interactive Difficulty Selector with descriptive helper text.
 */
const DifficultyRating = React.memo(({ rating = 3, onRatingChange }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Difficulty</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= rating;
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onRatingChange?.(star)}
              style={styles.starBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Text style={[styles.starText, { color: isSelected ? theme.colors.accent : `${theme.colors.textTertiary}50` }]}>
                ★
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
        {DIFFICULTY_LABELS[rating] || DIFFICULTY_LABELS[3]}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  starBtn: {
    paddingVertical: 2,
  },
  starText: {
    fontSize: 28,
  },
  helperText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default DifficultyRating;
