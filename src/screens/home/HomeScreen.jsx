import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
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
import ScreenWrapper from '../../components/common/ScreenWrapper';
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
  const { theme } = useTheme();
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
          <Text style={[styles.greetingText, { color: theme.colors.textPrimary }]}>{greeting}</Text>
          <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>{formatDateFull()}</Text>
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
          <UpcomingExamCard key={exam.id} subjectName={exam.name} subjectColor={exam.color_code || theme.colors.primary} examDate={exam.exam_date} />
        ))
      )}

      <SectionHeader title="Recent Expenses" actionLabel="See all" onAction={() => navigation.navigate('BudgetStack')} />
      {recentExpenses.length === 0 ? (
        <EmptyState icon="💸" title="No expenses yet" subtitle="Log your first expense today" />
      ) : null}
    </View>
  ), [budgetLoading, combinedStreak, completedTodayCount, expenses, greeting, mealsLoading, monthlyTotal, navigation, nextExam, profile, recentExpenses.length, streakLoading, studyLoading, subjectsLoading, theme.colors.primary, theme.colors.textPrimary, theme.colors.textSecondary, todayMeals, todayOutsideSpending, todaySessions, upcomingExams]);

  const renderExpenseItem = useCallback(({ item }) => (
    <View style={[styles.expenseRow, { backgroundColor: theme.colors.surface, borderColor: `${theme.colors.textTertiary}20`, borderRadius: theme.borderRadius.md }]}>
      <View style={styles.expenseLeft}>
        <Text style={[styles.expenseCategory, { color: theme.colors.textPrimary }]}>{item.category || 'General'}</Text>
        <Text style={[styles.expenseDate, { color: theme.colors.textSecondary }]}>{formatDateShort(item.date)}</Text>
      </View>
      <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>-৳ {Number(item.amount || 0).toLocaleString()}</Text>
    </View>
  ), [theme.borderRadius.md, theme.colors.error, theme.colors.surface, theme.colors.textPrimary, theme.colors.textSecondary, theme.colors.textTertiary]);

  return (
    <ScreenWrapper>
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
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 80 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greetingBox: { flex: 1, marginRight: 8 },
  greetingText: { fontSize: 16, fontWeight: '800' },
  dateText: { fontSize: 10, marginTop: 2 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, marginVertical: 3, borderWidth: 1,
  },
  expenseLeft: { flex: 1 },
  expenseCategory: { fontSize: 12, fontWeight: '700' },
  expenseDate: { fontSize: 10, marginTop: 2 },
  expenseAmount: { fontSize: 14, fontWeight: '800' },
});

export default HomeScreen;
