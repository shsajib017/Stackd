import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../config/ThemeContext';
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
import ScreenWrapper from '../../components/common/ScreenWrapper';

const QUICK_LINKS = [
  { id: 'bmi', icon: '⚖️', label: 'BMI Calculator', route: 'BMICalculatorScreen' },
  { id: 'goals', icon: '🎯', label: 'My Goals', route: 'GoalsScreen' },
  { id: 'foods', icon: '🍽️', label: 'My Foods', route: 'MyFoodsScreen' },
  { id: 'settings', icon: '⚙️', label: 'App Settings', route: 'AppSettingsScreen' },
  { id: 'account', icon: '👤', label: 'Account', route: 'AccountScreen' },
];

/** Profile and Account Settings Overview Screen. */
const ProfileScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
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
    <ScreenWrapper>
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
        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
          <View style={styles.avatarWrap}>
            <Avatar name={profile?.name || 'Student'} size={80} />
            <TouchableOpacity style={[styles.editAvatarBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]} onPress={() => navigation.navigate('AccountScreen')} activeOpacity={0.8}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>{profile?.name || 'Student'}</Text>
          <Text style={[styles.userSub, { color: theme.colors.textSecondary }]}>{profile?.university || 'University Student'}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AccountScreen')} style={styles.editProfileBtn}>
            <Text style={[styles.editProfileText, { color: theme.colors.primary }]}>Edit Profile →</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statWrap}><StatCard icon="🔥" label="Streak" value={`${combinedStreak || 0}d`} color={theme.colors.accent} /></View>
          <View style={styles.statWrap}><StatCard icon="📚" label="Study" value={studyHours} color={theme.colors.primary} /></View>
          <View style={styles.statWrap}><StatCard icon="💰" label="Saved" value={formatBDT(totalSaved)} color={theme.colors.success} /></View>
        </View>

        {/* BMI Card */}
        <BMICard profile={profile} onPress={() => navigation.navigate('BMICalculatorScreen')} />

        {/* Quick Links List */}
        <View style={[styles.linksCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, borderColor: `${theme.colors.textTertiary}20` }]}>
          {QUICK_LINKS.map((link, idx) => (
            <TouchableOpacity key={link.id} style={[styles.linkRow, { borderBottomColor: `${theme.colors.textTertiary}15` }, idx === QUICK_LINKS.length - 1 && styles.noBorder]} onPress={() => navigation.navigate(link.route)} activeOpacity={0.7}>
              <View style={styles.linkLeft}>
                <Text style={styles.linkIcon}>{link.icon}</Text>
                <Text style={[styles.linkLabel, { color: theme.colors.textPrimary }]}>{link.label}</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>›</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.linkRow, styles.noBorder, styles.logoutRow, { borderTopColor: `${theme.colors.textTertiary}15` }]} onPress={() => setShowLogoutModal(true)} activeOpacity={0.7}>
            <View style={styles.linkLeft}>
              <Text style={styles.linkIcon}>🚪</Text>
              <Text style={[styles.logoutLabel, { color: theme.colors.error }]}>Log out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>Stackd v1.0.0</Text>
      </ScrollView>

      <ConfirmModal visible={showLogoutModal} title="Log out of Stackd?" message="Your data will remain saved" confirmLabel="Log out" isDanger onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      <SideDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} navigation={navigation} />
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  settingsIcon: { fontSize: 18 },
  content: { paddingVertical: 8, paddingBottom: 40 },
  heroCard: { padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  avatarWrap: { position: 'relative', marginBottom: 8 },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  editIcon: { fontSize: 12 },
  userName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  userSub: { fontSize: 11, marginBottom: 6 },
  editProfileBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  editProfileText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  statWrap: { flex: 1 },
  linksCard: { paddingHorizontal: 16, marginTop: 16, borderWidth: 1 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  noBorder: { borderBottomWidth: 0 },
  linkLeft: { flexDirection: 'row', alignItems: 'center' },
  linkIcon: { fontSize: 16, marginRight: 8 },
  linkLabel: { fontSize: 13, fontWeight: '600' },
  chevron: { fontSize: 18, fontWeight: '700' },
  logoutRow: { borderTopWidth: 1, marginTop: 4 },
  logoutLabel: { fontSize: 13, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 11, fontWeight: '600', marginTop: 24, marginBottom: 16 },
});

export default ProfileScreen;
