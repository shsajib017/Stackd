import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';

/** Visual 4-color BMI Scale bar with current user position indicator. */
const BMIScaleBar = React.memo(({ bmi = 22 }) => {
  const pointerLeft = useMemo(() => {
    const val = Number(bmi) || 12;
    const clamped = Math.min(Math.max(val, 12), 38);
    return `${((clamped - 12) / (38 - 12)) * 100}%`;
  }, [bmi]);

  return (
    <View style={styles.container}>
      <View style={styles.barTrack}>
        <View style={[styles.segment, styles.segBlue]} />
        <View style={[styles.segment, styles.segGreen]} />
        <View style={[styles.segment, styles.segOrange]} />
        <View style={[styles.segment, styles.segRed]} />
        <View style={[styles.indicator, { left: pointerLeft }]} />
      </View>
      <View style={styles.labelsRow}>
        <Text style={styles.label}>Underweight</Text>
        <Text style={styles.label}>Normal</Text>
        <Text style={styles.label}>Overweight</Text>
        <Text style={styles.label}>Obese</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginVertical: spacing.md },
  barTrack: { flexDirection: 'row', height: 10, borderRadius: borderRadius.full, overflow: 'visible', position: 'relative' },
  segment: { flex: 1, height: '100%' },
  segBlue: { backgroundColor: '#3B82F6', borderTopLeftRadius: borderRadius.full, borderBottomLeftRadius: borderRadius.full },
  segGreen: { backgroundColor: '#10B981' },
  segOrange: { backgroundColor: '#F59E0B' },
  segRed: { backgroundColor: '#EF4444', borderTopRightRadius: borderRadius.full, borderBottomRightRadius: borderRadius.full },
  indicator: { position: 'absolute', top: -5, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.textPrimary, marginLeft: -10, elevation: 4, zIndex: 10 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs + 2 },
  label: { fontSize: fontSizes.xs - 2, fontWeight: '700', color: colors.textTertiary, flex: 1, textAlign: 'center' },
});

export default BMIScaleBar;
