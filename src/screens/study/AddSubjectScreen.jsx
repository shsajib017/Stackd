import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/ThemeContext';
import useAuthStore from '../../store/useAuthStore';
import useStudyStore from '../../store/useStudyStore';
import useUIStore from '../../store/useUIStore';
import { addSubject, deleteSubject, updateSubject } from '../../supabase/subjects';
import { formatDate, formatDateForDB, getDaysRemaining } from '../../utils/formatDate';
import { validateSubject } from '../../utils/validateForms';

import Button from '../../components/common/Button';
import ConfirmModal from '../../components/common/ConfirmModal';
import Input from '../../components/common/Input';
import StatusChip from '../../components/common/StatusChip';
import ColorPicker, { DEFAULT_PALETTE } from '../../components/study/ColorPicker';
import DifficultyRating from '../../components/study/DifficultyRating';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import AppHeader from '../../components/common/AppHeader';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dedicated Screen for Creating and Editing a Course Subject. */
const AddSubjectScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const showToast = useUIStore((state) => state.showToast);
  const addSubjectLocal = useStudyStore((state) => state.addSubjectLocal);
  const removeSubjectLocal = useStudyStore((state) => state.removeSubjectLocal);

  const editSubject = route.params?.subject;
  const isEditMode = Boolean(editSubject);

  const [name, setName] = useState(editSubject?.name || '');
  const [examDate, setExamDate] = useState(editSubject?.exam_date ? new Date(editSubject.exam_date) : null);
  const [creditHours, setCreditHours] = useState(editSubject?.credit_hours ? String(editSubject.credit_hours) : '');
  const [difficulty, setDifficulty] = useState(editSubject?.difficulty || 3);
  const [color, setColor] = useState(editSubject?.color || DEFAULT_PALETTE[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonthDate, setPickerMonthDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useFocusEffect(useCallback(() => {
    if (!isEditMode) { setName(''); setExamDate(null); setCreditHours(''); setDifficulty(3); setColor(DEFAULT_PALETTE[0]); setErrorMessage(null); }
  }, [isEditMode]));

  const daysRemaining = useMemo(() => examDate ? getDaysRemaining(examDate) : null, [examDate]);
  const chipType = useMemo(() => daysRemaining === null ? 'neutral' : (daysRemaining < 7 ? 'danger' : (daysRemaining <= 14 ? 'warning' : 'info')), [daysRemaining]);

  const handleSave = useCallback(async () => {
    setErrorMessage(null);
    const dateStr = examDate ? formatDateForDB(examDate) : null;
    const validation = validateSubject({ name: name.trim(), examDate: dateStr });
    if (!validation.isValid) { setErrorMessage(Object.values(validation.errors)[0]); return; }
    const payload = { name: name.trim(), exam_date: dateStr, credit_hours: creditHours ? parseFloat(creditHours) : null, difficulty, color };

    try {
      setIsLoading(true);
      if (isEditMode) {
        await updateSubject(editSubject.id, payload);
        showToast('Subject updated successfully', 'success');
      } else {
        if (!user?.id) throw new Error('User session not found');
        const newRow = await addSubject(user.id, payload);
        if (newRow) addSubjectLocal(newRow);
        showToast('Subject added successfully', 'success');
      }
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save subject');
      showToast(err.message || 'Failed to save subject', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addSubjectLocal, color, creditHours, difficulty, editSubject?.id, examDate, isEditMode, name, navigation, showToast, user?.id]);

  const handleDelete = useCallback(async () => {
    if (!editSubject?.id) return;
    try {
      setIsLoading(true);
      setShowDeleteModal(false);
      await deleteSubject(editSubject.id);
      removeSubjectLocal(editSubject.id);
      showToast('Subject deleted', 'info');
      navigation.goBack();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete subject');
      showToast(err.message || 'Failed to delete subject', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [editSubject?.id, navigation, removeSubjectLocal, showToast]);

  const daysInPickerMonth = new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth() + 1, 0).getDate();

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.flexOne} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <AppHeader title={isEditMode ? 'Edit Subject' : 'Add Subject'} showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
          <Input label="Subject name" value={name} onChangeText={setName} placeholder="e.g. Data Structures, Calculus, English" autoCapitalize="words" />
          <Text style={[styles.fieldLabel, { color: theme.colors.textPrimary }]}>Exam date</Text>
          <TouchableOpacity
            style={[styles.datePickerBtn, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}30` }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.datePickerText, { color: theme.colors.textPrimary }, !examDate && { color: theme.colors.textTertiary }]}>
              {examDate ? `📅 ${formatDate(examDate)}` : 'Select exam date...'}
            </Text>
          </TouchableOpacity>
          {daysRemaining !== null && (
            <View style={styles.previewChipRow}><StatusChip label={daysRemaining === 0 ? 'Exam is today!' : `${daysRemaining} days remaining`} type={chipType} icon="⏳" size="sm" /></View>
          )}
          <Input label="Credit hours (optional)" value={creditHours} onChangeText={setCreditHours} placeholder="e.g. 3" keyboardType="decimal-pad" />
          <DifficultyRating rating={difficulty} onRatingChange={setDifficulty} />
          <ColorPicker selected={color} onSelect={setColor} />
          {errorMessage ? <Text style={[styles.errorBanner, { color: theme.colors.error }]}>{errorMessage}</Text> : null}
          <Button label={isEditMode ? 'Update subject' : 'Save subject'} onPress={handleSave} loading={isLoading} disabled={isLoading} fullWidth style={styles.saveBtn} />
          {isEditMode && <Button label="Delete subject" variant="danger" onPress={() => setShowDeleteModal(true)} disabled={isLoading} fullWidth style={styles.deleteBtn} />}
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
          <View style={[styles.modalBackdrop, { backgroundColor: `${theme.colors.textPrimary}80` }]}>
            <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Select Exam Date</Text>
              <View style={styles.pickerMonthRow}>
                <TouchableOpacity onPress={() => { const d = new Date(pickerMonthDate); d.setMonth(d.getMonth() - 1); setPickerMonthDate(d); }} style={styles.pickerArrowBtn}>
                  <Text style={[styles.pickerArrow, { color: theme.colors.primary }]}>‹</Text>
                </TouchableOpacity>
                <Text style={[styles.pickerMonthText, { color: theme.colors.textPrimary }]}>{MONTHS[pickerMonthDate.getMonth()]} {pickerMonthDate.getFullYear()}</Text>
                <TouchableOpacity onPress={() => { const d = new Date(pickerMonthDate); d.setMonth(d.getMonth() + 1); setPickerMonthDate(d); }} style={styles.pickerArrowBtn}>
                  <Text style={[styles.pickerArrow, { color: theme.colors.primary }]}>›</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dayGrid}>
                {Array.from({ length: daysInPickerMonth }, (_, i) => i + 1).map((day) => {
                  const dayDate = new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth(), day);
                  const isSelected = examDate && examDate.getFullYear() === dayDate.getFullYear() && examDate.getMonth() === dayDate.getMonth() && examDate.getDate() === day;
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayCell,
                        { borderRadius: theme.borderRadius.sm, backgroundColor: isSelected ? theme.colors.primary : `${theme.colors.textTertiary}15` },
                      ]}
                      onPress={() => { setExamDate(dayDate); setShowDatePicker(false); }}
                    >
                      <Text style={[styles.dayText, { color: isSelected ? theme.colors.surface : theme.colors.textPrimary }]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Button label="Cancel" variant="secondary" onPress={() => setShowDatePicker(false)} fullWidth style={styles.modalDoneBtn} />
            </View>
          </View>
        </Modal>

        <ConfirmModal visible={showDeleteModal} title="Delete this subject?" message="All sessions and notes for this subject will also be deleted." confirmLabel="Delete" isDanger onConfirm={handleDelete} onCancel={() => setShowDeleteModal(false)} loading={isLoading} />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
});

const styles = StyleSheet.create({
  flexOne: { flex: 1 },
  scrollContent: { paddingVertical: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4, marginTop: 8 },
  datePickerBtn: { borderWidth: 1, padding: 14, marginBottom: 4 },
  datePickerText: { fontSize: 13, fontWeight: '600' },
  previewChipRow: { marginBottom: 8, marginTop: 2 },
  errorBanner: { fontSize: 10, fontWeight: '600', textAlign: 'center', marginVertical: 4 },
  saveBtn: { marginTop: 12 },
  deleteBtn: { marginTop: 8 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', padding: 20 },
  modalTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 14 },
  pickerMonthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pickerArrowBtn: { padding: 8 },
  pickerArrow: { fontSize: 20, fontWeight: '800' },
  pickerMonthText: { fontSize: 12, fontWeight: '700' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', marginBottom: 14 },
  dayCell: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 10, fontWeight: '600' },
  modalDoneBtn: { marginTop: 4 },
});

export default AddSubjectScreen;
