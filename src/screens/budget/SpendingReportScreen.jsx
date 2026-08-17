import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useSpendingReport from '../../hooks/useSpendingReport';
import { formatBDT } from '../../utils/formatCurrency';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import SpendingChart from '../../components/budget/SpendingChart';
import AppHeader from '../../components/common/AppHeader';

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
  const { hasPrevData, direction, percentChange, diffAmount } = comparisonWithLastMonth;
  const net = totalIncome - totalSpent;

  const sortedCategories = useMemo(() => {
    const entries = Object.entries(categoryBreakdown || {}).filter(([, v]) => v > 0);
    return entries.sort((a, b) => b[1] - a[1]);
  }, [categoryBreakdown]);

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

  const noData = !isLoading && totalSpent === 0 && totalIncome === 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Spending Report"
        showBack
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity onPress={() => exportRef.current?.()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.exportBtn}>📤</Text>
          </TouchableOpacity>
        }
      />
      {isLoading ? (
        <View style={styles.content}>
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />
          <SkeletonCard height={50} style={styles.mb} /><SkeletonCard height={90} style={styles.mb} />
          <SkeletonCard height={160} style={styles.mb} /><SkeletonCard height={120} />
        </View>
      ) : noData ? (
        <View style={styles.content}>
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />
          <EmptyState icon="📊" title="No data yet" subtitle={`No transactions in ${MONTHS[month - 1]} ${year}`} />
        </View>
      ) : (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} />

      {/* Overview Cards */}
      <View style={styles.statRow}>
        <StatCard icon="💵" value={formatBDT(totalIncome)} label="Income" color={colors.success} style={styles.statCard} />
        <StatCard icon="💸" value={formatBDT(totalSpent)} label="Spent" color={colors.error} style={styles.statCard} />
      </View>
      <StatCard icon={net >= 0 ? '✅' : '⚠️'} value={formatBDT(Math.abs(net))} label={net >= 0 ? 'Net balance' : 'Over budget'} color={net >= 0 ? colors.success : colors.error} style={styles.mb} />

      {/* Prediction Status Chip */}
      <View style={styles.chipRow}>
        {prediction.isOverBudget ? (
          <StatusChip label={`Projected to overspend by ${formatBDT(prediction.projected - prediction.remaining)}`} type="danger" icon="⚠️" size="md" />
        ) : (
          <StatusChip label="On track" type="success" icon="✅" size="md" />
        )}
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
      <View style={styles.compCard}>
        <View style={styles.compHeader}>
          {!hasPrevData ? (
            <StatusChip label="No data last month" type="neutral" size="sm" />
          ) : direction === 'up' ? (
            <StatusChip label={`▲ ${percentChange}% more`} type="danger" icon="📈" size="sm" />
          ) : direction === 'down' ? (
            <StatusChip label={`▼ ${percentChange}% less`} type="success" icon="📉" size="sm" />
          ) : (
            <StatusChip label="Same as last month" type="neutral" size="sm" />
          )}
        </View>
        {hasPrevData ? <Text style={styles.compSub}>{direction === 'up' ? '+' : (direction === 'down' ? '-' : '')}{formatBDT(diffAmount)}</Text> : null}
      </View>

      {/* Daily Spending Continuous Chart */}
      <SectionHeader title="Daily Spending" style={styles.mt} />
      <SpendingChart dailyData={chartDays} />
        </ScrollView>
      )}
    </View>
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
  chipRow: { marginBottom: spacing.md },
  catRow: { marginBottom: spacing.sm },
  catInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  catIcon: { fontSize: 16, marginRight: spacing.xs },
  catName: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  barOuter: { height: 10, backgroundColor: `${colors.textTertiary}20`, borderRadius: borderRadius.full, overflow: 'hidden', marginBottom: 2 },
  barInner: { height: '100%', backgroundColor: colors.primary, borderRadius: borderRadius.full },
  catAmount: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: '600' },
  compCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm, marginBottom: spacing.sm },
  compHeader: { flex: 1 },
  compSub: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
});

export default SpendingReportScreen;
