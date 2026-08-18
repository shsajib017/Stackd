import React, { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import { logout, updateUserPassword } from '../../supabase/auth';
import { getProfile, updateProfile } from '../../supabase/profiles';
import { uploadFile } from '../../supabase/storage';
import supabase from '../../supabase/config';
import AppHeader from '../../components/common/AppHeader';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import SettingsSection from '../../components/profile/SettingsSection';
import EditableRow from '../../components/profile/EditableRow';

/** Complete AccountScreen for managing user identity, security credentials, and danger zone actions. */
const AccountScreen = React.memo(({ navigation }) => {
  const { theme } = useTheme();
  const { user, profile, setProfile, clearAuth } = useAuthStore();
  const showToast = useUIStore((s) => s.showToast);

  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPass, setUpdatingPass] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try { const data = await getProfile(user.id); if (data) setProfile(data); } catch {}
  }, [setProfile, user?.id]);

  useFocusEffect(useCallback(() => { refreshProfile(); }, [refreshProfile]));

  const handleStartEdit = (field, currentVal) => {
    setEditingField(field); setFieldValue(currentVal || '');
  };

  const handleSaveField = async (field) => {
    const trimmed = fieldValue.trim();
    if (!trimmed) { showToast(`${field} cannot be empty`, 'error'); return; }
    try {
      const updates = { [field]: trimmed };
      setProfile({ ...(profile || {}), ...updates });
      await updateProfile(user.id, updates);
      showToast(`${field === 'name' ? 'Display name' : 'University'} updated`, 'success');
      setEditingField(null);
    } catch { showToast('Failed to update profile', 'error'); }
  };

  const handlePickAvatar = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setUploadingPhoto(true);
        const publicUrl = await uploadFile(user.id, 'avatars', res.assets[0].uri, `avatar_${Date.now()}.jpg`);
        setProfile({ ...(profile || {}), avatar_url: publicUrl });
        await updateProfile(user.id, { avatar_url: publicUrl });
        showToast('Profile photo updated', 'success');
      }
    } catch { showToast('Photo upload failed', 'error'); } finally { setUploadingPhoto(false); }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) { showToast('Current password is required', 'error'); return; }
    if (newPassword.length < 6) { showToast('New password must be at least 6 characters', 'error'); return; }
    if (newPassword !== confirmPassword) { showToast('Passwords do not match', 'error'); return; }
    try {
      setUpdatingPass(true);
      await updateUserPassword(newPassword, currentPassword);
      showToast('Password updated', 'success');
      setShowPasswordForm(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { showToast(err.message || 'Password update failed', 'error'); } finally { setUpdatingPass(false); }
  };

  const handleSignOutGlobal = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      await logout(); clearAuth();
    } catch { clearAuth(); }
  };

  const handleDeleteAccount = async () => {
    try {
      await Promise.all(['meals', 'study_sessions', 'expenses', 'income', 'savings_goals', 'user_foods'].map((t) => supabase.from(t).delete().eq('user_id', user.id)));
      await logout(); clearAuth(); setDeleteStep(0);
    } catch { showToast('Failed to delete account', 'error'); }
  };

  return (
    <ScreenWrapper>
      <AppHeader title="Account" showBack onBack={() => navigation.navigate('ProfileScreen')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Avatar name={profile?.name || 'User'} imageUrl={profile?.avatar_url} size={80} />
            {uploadingPhoto ? <ActivityIndicator size="small" color={theme.colors.primary} style={styles.photoLoader} /> : (
              <TouchableOpacity onPress={handlePickAvatar} style={styles.changePhotoBtn} activeOpacity={0.7}>
                <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>Change photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <SettingsSection title="Personal info">
            <EditableRow label="Display name" value={profile?.name} isEditing={editingField === 'name'} editValue={fieldValue} onChangeText={setFieldValue} onStartEdit={() => handleStartEdit('name', profile?.name)} onSave={() => handleSaveField('name')} onCancel={() => setEditingField(null)} />
            <EditableRow label="University" value={profile?.university} isEditing={editingField === 'university'} editValue={fieldValue} onChangeText={setFieldValue} onStartEdit={() => handleStartEdit('university', profile?.university)} onSave={() => handleSaveField('university')} onCancel={() => setEditingField(null)} />
            <EditableRow label="Email" value={user?.email} readOnly hint="Contact support to change email" borderBottom={false} />
          </SettingsSection>

          <SettingsSection title="Security">
            <TouchableOpacity onPress={() => setShowPasswordForm(!showPasswordForm)} style={[styles.rowHeader, { borderBottomColor: `${theme.colors.textTertiary}15` }]} activeOpacity={0.7}>
              <View>
                <Text style={[styles.secTitle, { color: theme.colors.textPrimary }]}>Change password</Text>
                <Text style={[styles.secSub, { color: theme.colors.textTertiary }]}>Update account security credentials</Text>
              </View>
              <Text style={[styles.chevron, { color: theme.colors.textTertiary }]}>{showPasswordForm ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {showPasswordForm ? (
              <View style={styles.passFormWrap}>
                <TextInput secureTextEntry placeholder="Current password" placeholderTextColor={theme.colors.textTertiary} value={currentPassword} onChangeText={setCurrentPassword} style={[styles.input, { color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}30`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]} />
                <TextInput secureTextEntry placeholder="New password (min 6 chars)" placeholderTextColor={theme.colors.textTertiary} value={newPassword} onChangeText={setNewPassword} style={[styles.input, { color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}30`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]} />
                <TextInput secureTextEntry placeholder="Confirm new password" placeholderTextColor={theme.colors.textTertiary} value={confirmPassword} onChangeText={setConfirmPassword} style={[styles.input, { color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}30`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]} />
                <Button label={updatingPass ? 'Updating...' : 'Update Password'} disabled={updatingPass || !newPassword} onPress={handleUpdatePassword} fullWidth />
              </View>
            ) : null}
          </SettingsSection>

          <SettingsSection title="Danger zone" titleColor={theme.colors.error}>
            <TouchableOpacity onPress={handleSignOutGlobal} style={[styles.dangerRow, { borderBottomColor: `${theme.colors.textTertiary}15` }]} activeOpacity={0.7}>
              <Text style={[styles.dangerText, { color: theme.colors.textPrimary }]}>Sign out of all devices</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteStep(1)} style={styles.dangerRow} activeOpacity={0.7}>
              <Text style={[styles.dangerText, { color: theme.colors.error, fontWeight: '800' }]}>Delete account</Text>
            </TouchableOpacity>
          </SettingsSection>

          <View style={styles.appInfo}>
            <Text style={[styles.infoText, { color: theme.colors.textTertiary }]}>Stackd v1.0.0</Text>
            <Text style={[styles.infoSub, { color: theme.colors.textTertiary }]}>Logged in as {user?.email || 'Student'}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={deleteStep > 0} transparent animationType="fade" onRequestClose={() => setDeleteStep(0)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
            <Text style={[styles.modalHead, { color: theme.colors.error }]}>{deleteStep === 1 ? 'Delete your account?' : 'Type DELETE to confirm'}</Text>
            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>{deleteStep === 1 ? 'All your data will be permanently deleted including expenses, study sessions, and meal logs.' : 'Please type "DELETE" in capital letters to confirm.'}</Text>
            {deleteStep === 1 ? <Button label="Continue" variant="danger" onPress={() => setDeleteStep(2)} fullWidth style={styles.mb8} /> : (
              <>
                <TextInput style={[styles.delInput, { color: theme.colors.textPrimary, borderColor: `${theme.colors.textTertiary}30`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md }]} value={deleteInput} onChangeText={setDeleteInput} placeholder="DELETE" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="characters" />
                <Button label="Permanently Delete" variant="danger" disabled={deleteInput !== 'DELETE'} onPress={handleDeleteAccount} fullWidth style={styles.mb8} />
              </>
            )}
            <Button label="Cancel" variant="outline" onPress={() => { setDeleteStep(0); setDeleteInput(''); }} fullWidth />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  content: { paddingVertical: 8, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginVertical: 12 },
  photoLoader: { marginTop: 8 },
  changePhotoBtn: { marginTop: 8, padding: 4 },
  changePhotoText: { fontSize: 12, fontWeight: '700' },
  rowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  secTitle: { fontSize: 13, fontWeight: '700' },
  secSub: { fontSize: 10, marginTop: 2 },
  chevron: { fontSize: 10 },
  passFormWrap: { padding: 16, gap: 10 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13 },
  dangerRow: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  dangerText: { fontSize: 13, fontWeight: '600' },
  appInfo: { alignItems: 'center', marginTop: 16 },
  infoText: { fontSize: 11, fontWeight: '700' },
  infoSub: { fontSize: 10, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalBox: { width: '100%', maxWidth: 360, padding: 20 },
  modalHead: { fontSize: 16, fontWeight: '800', marginBottom: 8 },
  modalDesc: { fontSize: 12, lineHeight: 18, marginBottom: 16 },
  delInput: { borderWidth: 1, padding: 12, fontSize: 14, fontWeight: '800', textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
  mb8: { marginBottom: 8 },
});

export default AccountScreen;
