import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
import useSpendingReport from '../../hooks/useSpendingReport';
import { formatBDT } from '../../utils/formatCurrency';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import SpendingChart from '../../components/budget/SpendingChart';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CAT_ICONS = { Food: '🍔', Transport: '🚌', Books: '📚', Tuition: '🎓', Entertainment: '🎮', Other: '📦' };

/** Full-featured monthly Spending Report Screen with category and last-month comparisons. */
const SpendingReportScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
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
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} theme={theme} />
          <SkeletonCard height={50} style={styles.mb} /><SkeletonCard height={90} style={styles.mb} />
          <SkeletonCard height={160} style={styles.mb} /><SkeletonCard height={120} />
        </View>
      ) : noData ? (
        <View style={styles.content}>
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} theme={theme} />
          <EmptyState icon="📊" title="No data yet" subtitle={`No transactions in ${MONTHS[month - 1]} ${year}`} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <MonthSelector date={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} isCurrentMonth={isCurrentMonth} theme={theme} />

          {/* Overview Cards */}
          <View style={styles.statRow}>
            <StatCard icon="💵" value={formatBDT(totalIncome)} label="Income" color={theme.colors.success} style={styles.statCard} />
            <StatCard icon="💸" value={formatBDT(totalSpent)} label="Spent" color={theme.colors.error} style={styles.statCard} />
          </View>
          <StatCard icon={net >= 0 ? '✅' : '⚠️'} value={formatBDT(Math.abs(net))} label={net >= 0 ? 'Net balance' : 'Over budget'} color={net >= 0 ? theme.colors.success : theme.colors.error} style={styles.mb} />

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
                <View style={styles.catInfo}>
                  <Text style={styles.catIcon}>{CAT_ICONS[cat] || '📦'}</Text>
                  <Text style={[styles.catName, { color: theme.colors.textPrimary }]}>{cat}</Text>
                </View>
                <View style={[styles.barOuter, { backgroundColor: `${theme.colors.textTertiary}20` }]}>
                  <View style={[styles.barInner, { width: `${pct}%`, backgroundColor: theme.colors.primary }]} />
                </View>
                <Text style={[styles.catAmount, { color: theme.colors.textSecondary }]}>{formatBDT(amt)} ({pct}%)</Text>
              </View>
            );
          })}

          {/* vs Last Month */}
          <SectionHeader title="vs Last Month" style={styles.mt} />
          <View style={[styles.compCard, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}20`, borderRadius: theme.borderRadius.md }]}>
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
            {hasPrevData ? <Text style={[styles.compSub, { color: theme.colors.textPrimary }]}>{direction === 'up' ? '+' : (direction === 'down' ? '-' : '')}{formatBDT(diffAmount)}</Text> : null}
          </View>

          {/* Daily Spending Continuous Chart */}
          <SectionHeader title="Daily Spending" style={styles.mt} />
          <SpendingChart dailyData={chartDays} />
        </ScrollView>
      )}
    </ScreenWrapper>
  );
});

/** Month selector sub-component */
const MonthSelector = React.memo(({ date, onPrev, onNext, isCurrentMonth, theme }) => (
  <View style={styles.monthRow}>
    <TouchableOpacity onPress={onPrev}><Text style={[styles.arrow, { color: theme.colors.primary }]}>‹</Text></TouchableOpacity>
    <Text style={[styles.monthTitle, { color: theme.colors.textPrimary }]}>{MONTHS[date.getMonth()]} {date.getFullYear()}</Text>
    <TouchableOpacity onPress={onNext} disabled={isCurrentMonth}><Text style={[styles.arrow, { color: theme.colors.primary }, isCurrentMonth && styles.arrowDisabled]}>›</Text></TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  content: { paddingVertical: 8, paddingBottom: 60 },
  mb: { marginBottom: 8 },
  mt: { marginTop: 16 },
  exportBtn: { fontSize: 22 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrow: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 8 },
  arrowDisabled: { opacity: 0.3 },
  monthTitle: { fontSize: 16, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: { flex: 1 },
  chipRow: { marginBottom: 16 },
  catRow: { marginBottom: 8 },
  catInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  catIcon: { fontSize: 16, marginRight: 4 },
  catName: { fontSize: 12, fontWeight: '600' },
  barOuter: { height: 10, borderRadius: 999, overflow: 'hidden', marginBottom: 2 },
  barInner: { height: '100%', borderRadius: 999 },
  catAmount: { fontSize: 10, fontWeight: '600' },
  compCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1, marginBottom: 8 },
  compHeader: { flex: 1 },
  compSub: { fontSize: 12, fontWeight: '700' },
});

export default SpendingReportScreen;
