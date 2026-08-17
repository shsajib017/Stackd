import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useSpendingReport from '../../hooks/useSpendingReport';
import { formatBDT } from '../../utils/formatCurrency';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import SpendingChart from '../../components/budget/SpendingChart';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Full-featured monthly Spending Report Screen with category and last-month comparisons. */
const SpendingReportScreen = React.memo(({ navigation }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1;
  const { monthlyData, categoryBreakdown, dailyData, prediction, comparisonWithLastMonth, isLoading, fetchReport } = useSpendingReport(year, month);

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  useEffect(() => { fetchReport(year, month); }, [fetchReport, year, month]);
  useFocusEffect(useCallback(() => { fetchReport(year, month); }, [fetchReport, year, month]));

  const changeMonth = (dir) => setSelectedMonth((prev) => {
    const d = new Date(prev);
    d.setMonth(d.getMonth() + dir);
    return d;
  });

  const { totalSpent, totalIncome } = monthlyData;
  const net = totalIncome - totalSpent;

  const sortedCategories = useMemo(() => {
    const entries = Object.entries(categoryBreakdown || {}).filter(([, v]) => v > 0);
    return entries.sort((a, b) => b[1] - a[1]);
  }, [categoryBreakdown]);

  // Chart data: show all days or days up to today if in current month
  const chartDays = useMemo(() => {
    const list = dailyData || [];
    if (isCurrentMonth) {
      const today = now.getDate();
      return list.filter((d) => d.day <= today);
    }
    return list;
  }, [dailyData, isCurrentMonth, now]);

  const exportRef = useRef(null);
  exportRef.current = () => {
    const catLines = sortedCategories.map(([cat, amt]) => {
      const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
      return `  ${cat}: ৳ ${amt.toLocaleString('en-IN')} (${pct}%)`;
    }).join('\n');
    const msg = `Stackd Spending Report — ${MONTHS[month - 1]} ${year}\nTotal income: ${formatBDT(totalIncome)}\nTotal spent: ${formatBDT(totalSpent)}\nRemaining: ${formatBDT(net)}\n\nBy category:\n${catLines}`;
    Share.share({ message: msg });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Spending Report',
      headerRight: () => (
        <TouchableOpacity onPress={() => exportRef.current?.()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.exportBtn}>📤</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const noData = !isLoading && totalSpent === 0 && totalIncome === 0;

  if (isLoading) return (
    <View style={styles.container}><View style={styles.content}>
      <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />
      <SkeletonCard height={50} style={styles.mb} /><SkeletonCard height={90} style={styles.mb} />
      <SkeletonCard height={160} style={styles.mb} /><SkeletonCard height={120} />
    </View></View>
  );

  if (noData) return (
    <View style={styles.container}><View style={styles.content}>
      <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />
      <EmptyState icon="📊" title="No data yet" subtitle={`No transactions in ${MONTHS[month - 1]} ${year}`} />
    </View></View>
  );

  const { direction, percentChange, diffAmount, hasPrevData } = comparisonWithLastMonth;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />

      {/* Overview Cards */}
      <View style={styles.statRow}>
        <StatCard icon="💵" value={formatBDT(totalIncome)} label="Income" color={colors.success} style={styles.statCard} />
        <StatCard icon="💸" value={formatBDT(totalSpent)} label="Spent" color={colors.error} style={styles.statCard} />
      </View>
      <StatCard icon={net >= 0 ? '✅' : '⚠️'} value={formatBDT(Math.abs(net))} label={net >= 0 ? 'Net balance' : 'Over budget'} color={net >= 0 ? colors.success : colors.error} style={styles.mb} />

      {/* Prediction Banner */}
      <View style={[styles.banner, prediction.isOverBudget && styles.bannerDanger]}>
        <Text style={styles.bannerText}>
          {prediction.isOverBudget ? `Projected to overspend by ${formatBDT(prediction.projected - prediction.remaining)} ⚠️` : 'On track ✅'}
        </Text>
      </View>

      {/* Category Breakdown */}
      <SectionHeader title="Spending by Category" />
      {sortedCategories.map(([cat, amt]) => {
        const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
        return (
          <View key={cat} style={styles.catRow}>
            <View style={styles.catInfo}><Text style={styles.catIcon}>{CAT_ICONS[cat] || '📦'}</Text><Text style={styles.catName}>{cat}</Text></View>
            <View style={styles.barOuter}><View style={[styles.barInner, { width: `${pct}%` }]} /></View>
            <Text style={styles.catAmount}>{formatBDT(amt)} ({pct}%)</Text>
          </View>
        );
      })}

      {/* vs Last Month */}
      <SectionHeader title="vs Last Month" style={styles.mt} />
      <View style={[styles.compCard, !hasPrevData ? styles.compNeutral : (direction === 'up' ? styles.compDanger : (direction === 'down' ? styles.compGood : styles.compNeutral))]}>
        <Text style={styles.compText}>
          {!hasPrevData ? 'No data last month' : (direction === 'up' ? `▲ ${percentChange}% more than last month` : (direction === 'down' ? `▼ ${percentChange}% less than last month` : 'Same as last month'))}
        </Text>
        {hasPrevData && <Text style={styles.compSub}>{direction === 'up' ? '+' : (direction === 'down' ? '-' : '')}{formatBDT(diffAmount)}</Text>}
      </View>

      {/* Daily Spending Continuous Chart */}
      <SectionHeader title="Daily Spending" style={styles.mt} />
      <SpendingChart dailyData={chartDays} />
    </ScrollView>
  );
});

/** Month selector sub-component */
const MonthSelector = React.memo(({ date, onPrev, onNext, isCurrentMonth }) => (
  <View style={styles.monthRow}>
    <TouchableOpacity onPress={onPrev}><Text style={styles.arrow}>‹</Text></TouchableOpacity>
    <Text style={styles.monthTitle}>{MONTHS[date.getMonth()]} {date.getFullYear()}</Text>
    <TouchableOpacity onPress={onNext} disabled={isCurrentMonth}><Text style={[styles.arrow, isCurrentMonth && styles.arrowDisabled]}>›</Text></TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl + 40 },
  mb: { marginBottom: spacing.sm },
  mt: { marginTop: spacing.md },
  exportBtn: { fontSize: 22 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  arrow: { fontSize: fontSizes.xxl, color: colors.primary, fontWeight: 'bold', paddingHorizontal: spacing.sm },
  arrowDisabled: { color: colors.textTertiary, opacity: 0.3 },
  monthTitle: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  statCard: { flex: 1 },
  banner: { backgroundColor: `${colors.accent}18`, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.accent },
  bannerDanger: { backgroundColor: `${colors.error}12`, borderLeftColor: colors.error },
  bannerText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  catRow: { marginBottom: spacing.sm },
  catInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  catIcon: { fontSize: 16, marginRight: spacing.xs },
  catName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  barOuter: { height: 10, backgroundColor: `${colors.textTertiary}20`, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: 2 },
  barInner: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  catAmount: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600' },
  compCard: { borderRadius: borderRadius.md, padding: spacing.md, ...shadows.sm, marginBottom: spacing.sm },
  compGood: { backgroundColor: `${colors.success}12`, borderLeftWidth: 3, borderLeftColor: colors.success },
  compDanger: { backgroundColor: `${colors.error}12`, borderLeftWidth: 3, borderLeftColor: colors.error },
  compNeutral: { backgroundColor: `${colors.textTertiary}12`, borderLeftWidth: 3, borderLeftColor: colors.textTertiary },
  compText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  compSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
});

export default SpendingReportScreen;
