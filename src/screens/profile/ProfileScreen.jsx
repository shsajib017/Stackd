import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import useAuthStore from '../../store/useAuthStore';
import useSavings from '../../hooks/useSavings';
import useStreak from '../../hooks/useStreak';
import useStudySessions from '../../hooks/useStudySessions';
import { logout } from '../../supabase/auth';
import { formatBDT } from '../../utils/formatCurrency';
import AppHeader from '../../components/common/AppHeader';
import Avatar from '../../components/common/Avatar';
import ConfirmModal from '../../components/common/ConfirmModal';
import SideDrawer from '../../components/common/SideDrawer';
import StatCard from '../../components/common/StatCard';
import BMICard from '../../components/profile/BMICard';

const QUICK_LINKS = [
  { id: 'bmi', icon: '⚖️', label: 'BMI Calculator', route: 'BMICalculatorScreen' },
  { id: 'goals', icon: '🎯', label: 'My Goals', route: 'GoalsScreen' },
  { id: 'foods', icon: '🍽️', label: 'My Foods', route: 'MyFoodsScreen' },
  { id: 'settings', icon: '⚙️', label: 'App Settings', route: 'AppSettingsScreen' },
  { id: 'account', icon: '👤', label: 'Account', route: 'AccountScreen' },
];

/** Profile and Account Settings Overview Screen. */
const ProfileScreen = React.memo(({ navigation }) => {
  const { profile, clearAuth } = useAuthStore();
  const { combinedStreak, fetchStreaks } = useStreak();
  const { weeklyStudyMinutes, fetchSessions } = useStudySessions();
  const { goals, fetchGoals } = useSavings();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const refreshData = useCallback(() => {
    fetchStreaks();
    fetchSessions();
    fetchGoals();
  }, [fetchGoals, fetchSessions, fetchStreaks]);

  useFocusEffect(useCallback(() => { refreshData(); }, [refreshData]));

  const totalSaved = useMemo(() => {
    return (goals || []).reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0);
  }, [goals]);

  const studyHours = useMemo(() => {
    return `${Math.round((weeklyStudyMinutes || 0) / 60)}h`;
  }, [weeklyStudyMinutes]);

  const handleLogout = useCallback(async () => {
    setShowLogoutModal(false);
    try {
      await logout();
      clearAuth();
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Profile"
        onMenuPress={() => setDrawerVisible(true)}
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate('AppSettingsScreen')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrap}>
            <Avatar name={profile?.name || 'Student'} size={80} />
            <TouchableOpacity style={styles.editAvatarBadge} onPress={() => navigation.navigate('AccountScreen')} activeOpacity={0.8}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.name || 'Student'}</Text>
          <Text style={styles.userSub}>{profile?.university || 'University Student'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AccountScreen')} style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit Profile →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statWrap}><StatCard icon="🔥" label="Streak" value={`${combinedStreak || 0}d`} color={colors.accent} /></View>
          <View style={styles.statWrap}><StatCard icon="📚" label="Study" value={studyHours} color={colors.primary} /></View>
          <View style={styles.statWrap}><StatCard icon="💰" label="Saved" value={formatBDT(totalSaved)} color={colors.success} /></View>
        </View>

        {/* BMI Card */}
        <BMICard profile={profile} onPress={() => navigation.navigate('BMICalculatorScreen')} />

        {/* Quick Links List */}
        <View style={styles.linksCard}>
          {QUICK_LINKS.map((link, idx) => (
            <TouchableOpacity key={link.id} style={[styles.linkRow, idx === QUICK_LINKS.length - 1 && styles.noBorder]} onPress={() => navigation.navigate(link.route)} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <Text style={styles.linkIcon}>{link.icon}</Text>
                <Text style={styles.linkLabel}>{link.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.linkRow, styles.noBorder, styles.logoutRow]} onPress={() => setShowLogoutModal(true)} activeOpacity={0.7}>
            <View style={styles.linkLeft}>
              <Text style={styles.linkIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Stackd v1.0.0</Text>
      </ScrollView>

      <ConfirmModal visible={showLogoutModal} title="Log out of Stackd?" message="Your data will remain saved" confirmLabel="Log out" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  settingsIcon: { fontSize: fontSizes.lg, color: colors.textPrimary },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  heroCard: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: `${colors.primary}20`, ...shadows.sm },
  avatarWrap: { position: 'relative', marginBottom: spacing.sm },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.surface, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary, ...shadows.sm },
  editIcon: { fontSize: 12 },
  userName: { fontSize: fontSizes.lg, fontWeight: '800', color: colors.textPrimary, marginBottom: 2 },
  userSub: { fontSize: fontSizes.xs, color: colors.textSecondary, marginBottom: spacing.xs + 2 },
  editProfileBtn: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  editProfileText: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  statWrap: { flex: 1 },
  linksCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: `${colors.textTertiary}20` },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm + 4, borderBottomWidth: 1, borderBottomColor: `${colors.textTertiary}15` },
  noBorder: { borderBottomWidth: 0 },
  linkLeft: { flexDirection: 'row', alignItems: 'center' },
  linkIcon: { fontSize: fontSizes.md, marginRight: spacing.sm },
  linkLabel: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.textPrimary },
  chevron: { fontSize: fontSizes.lg, color: colors.textTertiary, fontWeight: '700' },
  logoutRow: { borderTopWidth: 1, borderTopColor: `${colors.textTertiary}15`, marginTop: spacing.xs },
  logoutLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.error },
  versionText: { textAlign: 'center', fontSize: fontSizes.xs, color: colors.textTertiary, fontWeight: '600', marginTop: spacing.xl, marginBottom: spacing.md },
});

export default ProfileScreen;
