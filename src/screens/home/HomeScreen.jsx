import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useBudget from '../../hooks/useBudget';
import useStudySessions from '../../hooks/useStudySessions';
import useMeals from '../../hooks/useMeals';
import useStreak from '../../hooks/useStreak';
import { getSubjects } from '../../supabase/subjects';
import { formatDateFull, formatDateShort } from '../../utils/formatDate';

import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import SideDrawer from '../../components/common/SideDrawer';
import SkeletonCard from '../../components/common/SkeletonCard';
import QuickActionButton from '../../components/home/QuickActionButton';
import StreakCard from '../../components/home/StreakCard';
import BudgetSummaryCard from '../../components/home/BudgetSummaryCard';
import StudySummaryCard from '../../components/home/StudySummaryCard';
import MealSummaryCard from '../../components/home/MealSummaryCard';
import UpcomingExamCard from '../../components/home/UpcomingExamCard';

import AppHeader from '../../components/common/AppHeader';

/**
 * Main Home Dashboard Screen for Stackd.
 */
const HomeScreen = React.memo(({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user, profile } = useAuthStore();
  const { monthlyTotal, expenses, fetchExpenses, isLoading: budgetLoading } = useBudget();
  const { todaySessions, fetchSessions, isLoading: studyLoading } = useStudySessions();
  const { todayMeals, todayOutsideSpending, fetchTodayMeals, isLoading: mealsLoading } = useMeals();
  const { combinedStreak, fetchStreaks, isLoading: streakLoading } = useStreak();

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const refreshDashboard = useCallback(() => {
    fetchExpenses();
    fetchSessions();
    fetchTodayMeals();
    fetchStreaks();
    if (user?.id) {
      setSubjectsLoading(true);
      getSubjects(user.id)
        .then((data) => setSubjects(data || []))
        .catch(() => setSubjects([]))
        .finally(() => setSubjectsLoading(false));
    }
  }, [fetchExpenses, fetchSessions, fetchTodayMeals, fetchStreaks, user?.id]);

  useFocusEffect(useCallback(() => { refreshDashboard(); }, [refreshDashboard]));

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'Good morning' : hour <= 17 ? 'Good afternoon' : 'Good evening';
    const name = profile?.name ? profile.name.split(' ')[0] : 'Student';
    return `${prefix}, ${name} 👋`;
  }, [profile?.name]);

  const upcomingExams = useMemo(() => {
    return subjects
      .filter((s) => s.exam_date && new Date(s.exam_date) >= new Date().setHours(0, 0, 0, 0))
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
      .slice(0, 3);
  }, [subjects]);

  const nextExam = upcomingExams[0] || null;
  const recentExpenses = useMemo(() => (expenses || []).slice(0, 3), [expenses]);
  const completedTodayCount = useMemo(() => (todaySessions || []).filter((s) => s.completed).length, [todaySessions]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.dateText}>{formatDateFull()}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileStack')} activeOpacity={0.8}>
          <Avatar name={profile?.name || 'User'} size={44} imageUrl={profile?.avatar_url} />
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsRow}>
        <QuickActionButton icon="💰" label="Add expense" onPress={() => navigation.navigate('AddExpenseModal')} />
        <QuickActionButton icon="🍽️" label="Log meal" onPress={() => navigation.navigate('LogMealModal')} />
        <QuickActionButton icon="📚" label="Start study" onPress={() => navigation.navigate('StudyStack')} />
      </View>

      {streakLoading ? <SkeletonCard height={110} /> : (
        <StreakCard
          streakCount={combinedStreak}
          hasExpenseToday={expenses?.some((e) => new Date(e.date).toDateString() === new Date().toDateString())}
          hasSessionToday={completedTodayCount > 0}
          hasMealToday={(todayMeals?.length || 0) > 0}
        />
      )}

      {budgetLoading ? <SkeletonCard height={90} /> : (
        <BudgetSummaryCard spent={monthlyTotal || 0} limit={profile?.monthly_budget_limit || 0} onPress={() => navigation.navigate('BudgetStack')} />
      )}

      {studyLoading ? <SkeletonCard height={90} /> : (
        <StudySummaryCard doneCount={completedTodayCount} totalCount={todaySessions?.length || 0} nextExamSubject={nextExam?.name} daysUntilExam={nextExam?.exam_date ? Math.ceil((new Date(nextExam.exam_date) - new Date()) / 86400000) : undefined} onPress={() => navigation.navigate('StudyStack')} />
      )}

      {mealsLoading ? <SkeletonCard height={90} /> : (
        <MealSummaryCard dormMealCount={todayMeals?.filter((m) => m.meal_source === 'dorm').length || 0} outsideSpent={todayOutsideSpending || 0} onPress={() => navigation.navigate('MealsScreen')} />
      )}

      <SectionHeader title="Upcoming Exams" actionLabel="See all" onAction={() => navigation.navigate('StudyStack')} />
      {subjectsLoading ? <SkeletonCard height={70} /> : upcomingExams.length === 0 ? (
        <EmptyState icon="📝" title="No exams yet" subtitle="Add your subjects to start tracking exams" />
      ) : (
        upcomingExams.map((exam) => (
          <UpcomingExamCard key={exam.id} subjectName={exam.name} subjectColor={exam.color_code || colors.primary} examDate={exam.exam_date} />
        ))
      )}

      <SectionHeader title="Recent Expenses" actionLabel="See all" onAction={() => navigation.navigate('BudgetStack')} />
      {recentExpenses.length === 0 ? (
        <EmptyState icon="💸" title="No expenses yet" subtitle="Log your first expense today" />
      ) : null}
    </View>
  ), [budgetLoading, combinedStreak, completedTodayCount, expenses, greeting, mealsLoading, monthlyTotal, navigation, nextExam, profile, recentExpenses.length, streakLoading, studyLoading, subjectsLoading, todayMeals, todayOutsideSpending, todaySessions, upcomingExams]);

  const renderExpenseItem = useCallback(({ item }) => (
    <View style={styles.expenseRow}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseCategory}>{item.category || 'General'}</Text>
        <Text style={styles.expenseDate}>{formatDateShort(item.date)}</Text>
      </View>
      <Text style={styles.expenseAmount}>-৳ {Number(item.amount || 0).toLocaleString()}</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <AppHeader title="Stackd Dashboard" onMenuPress={() => setDrawerVisible(true)} />
      <FlatList
        contentContainerStyle={styles.content}
        data={recentExpenses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderExpenseItem}
        showsVerticalScrollIndicator={false}
      />
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerMenuBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerMenuIcon: { fontSize: 24, color: colors.textPrimary, fontWeight: '700' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xxl + 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  greetingBox: { flex: 1, marginRight: spacing.sm },
  greetingText: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary },
  dateText: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: spacing.sm },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, padding: spacing.md, borderRadius: borderRadius.md,
    marginVertical: 3, borderWidth: 1, borderColor: `${colors.textTertiary}20`,
  },
  expenseLeft: { flex: 1 },
  expenseCategory: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  expenseDate: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  expenseAmount: { fontSize: fontSizes.md, fontWeight: '800', color: colors.error },
});

export default HomeScreen;
