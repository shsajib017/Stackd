import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import ExamCountdown from './ExamCountdown';
import ProgressRing from './ProgressRing';

/**
 * Subject Overview Card for horizontal scroll carousel.
 */
const SubjectCard = React.memo(({ subject, progress = 0, onPress }) => {
  const { theme } = useTheme();
  const cardColor = subject.color || theme.colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor, borderRadius: theme.borderRadius.lg }]}
      onPress={() => onPress?.(subject)}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <Text style={styles.name} numberOfLines={1}>
          {subject.name}
        </Text>
        <ProgressRing progress={progress} size={38} color="#FFFFFF" />
      </View>

      <View style={styles.footerRow}>
        <ExamCountdown examDate={subject.exam_date} />
        {subject.target_hours ? (
          <Text style={styles.targetText}>🎯 {subject.target_hours}h target</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 110,
    padding: 16,
    marginRight: 8,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default SubjectCard;
