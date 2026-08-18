import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import { formatBDT } from '../../utils/formatCurrency';

/**
 * Continuous daily spending chart with Y-axis grid, X-axis intervals, and interactive day highlights.
 */
const SpendingChart = React.memo(({ dailyData = [] }) => {
  const { theme } = useTheme();
  const [selectedBar, setSelectedBar] = useState(null);

  const maxAmount = useMemo(() => {
    const max = Math.max(...dailyData.map((d) => Number(d.amount) || 0), 0);
    return max > 0 ? max : 100;
  }, [dailyData]);

  const midAmount = Math.round(maxAmount / 2);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.md,
          borderColor: `${theme.colors.textTertiary}20`,
        },
      ]}
    >
      {/* Selected Day Tooltip */}
      {selectedBar ? (
        <View style={[styles.tooltip, { backgroundColor: `${theme.colors.primary}18`, borderRadius: theme.borderRadius.sm }]}>
          <Text style={[styles.tooltipText, { color: theme.colors.textPrimary }]}>
            Day {selectedBar.day}: <Text style={[styles.tooltipAmount, { color: theme.colors.primary }]}>{formatBDT(selectedBar.amount)}</Text>
          </Text>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>Tap any bar for details</Text>
          <Text style={[styles.peakLabel, { color: theme.colors.primary }]}>Peak: {formatBDT(maxAmount)}</Text>
        </View>
      )}

      <View style={styles.chartArea}>
        {/* Y Axis Grid Lines & Labels */}
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.gridLineRow}><Text style={[styles.yLabel, { color: theme.colors.textTertiary }]}>৳{maxAmount >= 1000 ? `${Math.round(maxAmount / 1000)}k` : maxAmount}</Text><View style={[styles.gridLine, { backgroundColor: `${theme.colors.textTertiary}15` }]} /></View>
          <View style={styles.gridLineRow}><Text style={[styles.yLabel, { color: theme.colors.textTertiary }]}>৳{midAmount >= 1000 ? `${Math.round(midAmount / 1000)}k` : midAmount}</Text><View style={[styles.gridLine, { backgroundColor: `${theme.colors.textTertiary}15` }]} /></View>
          <View style={styles.gridLineRow}><Text style={[styles.yLabel, { color: theme.colors.textTertiary }]}>0</Text><View style={[styles.gridBaseline, { backgroundColor: `${theme.colors.textTertiary}35` }]} /></View>
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
                      hasSpending ? { backgroundColor: theme.colors.primary } : { backgroundColor: `${theme.colors.textTertiary}25` },
                      isSelected && { backgroundColor: theme.colors.accent, width: 6 },
                    ]}
                  />
                </View>
                {(item.day === 1 || item.day % 5 === 0) ? (
                  <Text style={[styles.xLabel, { color: theme.colors.textTertiary }, isSelected && { color: theme.colors.primary, fontWeight: '800' }]}>{item.day}</Text>
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
    padding: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartSubtitle: { fontSize: 10 },
  peakLabel: { fontSize: 10, fontWeight: '700' },
  tooltip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tooltipText: { fontSize: 10, fontWeight: '600' },
  tooltipAmount: { fontWeight: '800' },
  chartArea: { height: 140, position: 'relative', marginTop: 4 },
  gridOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  gridLineRow: { flexDirection: 'row', alignItems: 'center' },
  yLabel: { width: 28, fontSize: 8, textAlign: 'right', marginRight: 4 },
  gridLine: { flex: 1, height: 1 },
  gridBaseline: { flex: 1, height: 1 },
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
  xLabel: { fontSize: 8, marginTop: 4, height: 14, textAlign: 'center' },
  xSpacer: { height: 14, marginTop: 4 },
});

export default SpendingChart;
