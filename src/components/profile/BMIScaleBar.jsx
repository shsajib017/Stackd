import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/** Visual 4-color BMI Scale bar with current user position indicator. */
const BMIScaleBar = React.memo(({ bmi = 22 }) => {
  const { theme } = useTheme();

  const pointerLeft = useMemo(() => {
    const val = Number(bmi) || 12;
    const clamped = Math.min(Math.max(val, 12), 38);
    return `${((clamped - 12) / (38 - 12)) * 100}%`;
  }, [bmi]);

  return (
    <View style={styles.container}>
      <View style={[styles.barTrack, { borderRadius: theme.borderRadius.full }]}>
        <View style={[styles.segment, styles.segBlue, { borderTopLeftRadius: theme.borderRadius.full, borderBottomLeftRadius: theme.borderRadius.full }]} />
        <View style={[styles.segment, styles.segGreen]} />
        <View style={[styles.segment, styles.segOrange]} />
        <View style={[styles.segment, styles.segRed, { borderTopRightRadius: theme.borderRadius.full, borderBottomRightRadius: theme.borderRadius.full }]} />
        <View style={[styles.indicator, { left: pointerLeft, backgroundColor: theme.colors.surface, borderColor: theme.colors.textPrimary }]} />
      </View>
      <View style={styles.labelsRow}>
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Underweight</Text>
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Normal</Text>
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Overweight</Text>
        <Text style={[styles.label, { color: theme.colors.textTertiary }]}>Obese</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  barTrack: { flexDirection: 'row', height: 10, overflow: 'visible', position: 'relative' },
  segment: { flex: 1, height: '100%' },
  segBlue: { backgroundColor: '#3B82F6' },
  segGreen: { backgroundColor: '#10B981' },
  segOrange: { backgroundColor: '#F59E0B' },
  segRed: { backgroundColor: '#EF4444' },
  indicator: { position: 'absolute', top: -5, width: 20, height: 20, borderRadius: 10, borderWidth: 3, marginLeft: -10, elevation: 4, zIndex: 10 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { fontSize: 8, fontWeight: '700', flex: 1, textAlign: 'center' },
});

export default BMIScaleBar;
