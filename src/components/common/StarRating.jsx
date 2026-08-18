import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

const STARS = [1, 2, 3, 4, 5];

/** Interactive 1-5 Star focus rating component. */
const StarRating = React.memo(({ rating = 5, onRatingChange, size = 32, disabled = false }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {STARS.map((star) => {
        const isFilled = star <= rating;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => onRatingChange?.(star)}
            disabled={disabled}
            activeOpacity={0.7}
            style={styles.starBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.star, { fontSize: size, color: isFilled ? theme.colors.accent : `${theme.colors.textTertiary}60` }]}>
              {isFilled ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 4 },
  starBtn: { padding: 2 },
  star: { fontWeight: '700' },
});

export default StarRating;
