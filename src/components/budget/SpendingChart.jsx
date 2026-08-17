import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import { formatBDT } from '../../utils/formatCurrency';

/**
 * Continuous daily spending chart with Y-axis grid, X-axis intervals, and interactive day highlights.
 */
const SpendingChart = React.memo(({ dailyData = [] }) => {
  const [selectedBar, setSelectedBar] = useState(null);

  const maxAmount = useMemo(() => {
    const max = Math.max(...dailyData.map((d) => Number(d.amount) || 0), 0);
    return max > 0 ? max : 100;
  }, [dailyData]);

  const midAmount = Math.round(maxAmount / 2);

  return (
    <View style={styles.container}>
      {/* Selected Day Tooltip */}
      {selectedBar ? (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            Day {selectedBar.day}: <Text style={styles.tooltipAmount}>{formatBDT(selectedBar.amount)}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.chartSubtitle}>Tap any bar for details</Text>
          <Text style={styles.peakLabel}>Peak: {formatBDT(maxAmount)}</Text>
        </View>
      )}

      <View style={styles.chartArea}>
        {/* Y Axis Grid Lines & Labels */}
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridLineRow}><Text style={styles.yLabel}>৳{maxAmount >= 1000 ? `${Math.round(maxAmount / 1000)}k` : maxAmount}</Text><View style={styles.gridLine} /></View>
          <View style={styles.gridLineRow}><Text style={styles.yLabel}>৳{midAmount >= 1000 ? `${Math.round(midAmount / 1000)}k` : midAmount}</Text><View style={styles.gridLine} /></View>
          <View style={styles.gridLineRow}><Text style={styles.yLabel}>0</Text><View style={styles.gridBaseline} /></View>
        </View>

        {/* Bars Container */}
        <View style={styles.barsContainer}>
          {dailyData.map((item) => {
            const heightPct = Math.min(100, Math.max(item.amount > 0 ? 6 : 2, (item.amount / maxAmount) * 100));
            const isSelected = selectedBar?.date === item.date;
            const hasSpending = item.amount > 0;

            return (
              <TouchableOpacity
                key={item.date}
                style={styles.barColumn}
                onPress={() => setSelectedBar(item)}
                activeOpacity={0.7}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${heightPct}%` },
                      hasSpending ? styles.barActive : styles.barZero,
                      isSelected && styles.barSelected,
                    ]}
                  />
                </View>
                {(item.day === 1 || item.day % 5 === 0) ? (
                  <Text style={[styles.xLabel, isSelected && styles.xLabelActive]}>{item.day}</Text>
                ) : (
                  <View style={styles.xSpacer} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: `${colors.textTertiary}20`,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chartSubtitle: { fontSize: fontSizes.xs, color: colors.textSecondary },
  peakLabel: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  tooltip: {
    backgroundColor: `${colors.primary}18`,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  tooltipText: { fontSize: fontSizes.xs, color: colors.textPrimary, fontWeight: '600' },
  tooltipAmount: { color: colors.primary, fontWeight: '800' },
  chartArea: { height: 140, position: 'relative', marginTop: spacing.xs },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  gridLineRow: { flexDirection: 'row', alignItems: 'center' },
  yLabel: { width: 28, fontSize: 8, color: colors.textTertiary, textAlign: 'right', marginRight: 4 },
  gridLine: { flex: 1, height: 1, backgroundColor: `${colors.textTertiary}15` },
  gridBaseline: { flex: 1, height: 1, backgroundColor: `${colors.textTertiary}35` },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingLeft: 32,
    paddingBottom: 2,
  },
  barColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  barTrack: { width: '100%', height: 115, justifyContent: 'flex-end', alignItems: 'center' },
  barFill: { width: 4, borderRadius: 2 },
  barZero: { backgroundColor: `${colors.textTertiary}25` },
  barActive: { backgroundColor: colors.primary },
  barSelected: { backgroundColor: colors.accent, width: 6 },
  xLabel: { fontSize: 8, color: colors.textTertiary, marginTop: 4, height: 14, textAlign: 'center' },
  xLabelActive: { color: colors.primary, fontWeight: '800' },
  xSpacer: { height: 14, marginTop: 4 },
});

export default SpendingChart;
