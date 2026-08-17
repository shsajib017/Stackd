import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSizes, spacing } from '../../config/theme';
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dedicated Screen for Creating and Editing a Course Subject. */
const AddSubjectScreen = React.memo(({ navigation, route }) => {
  const insets = useSafeAreaInsets();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Subject' : 'Add Subject',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBackBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.headerBackIcon}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [isEditMode, navigation]);

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <Input label="Subject name" value={name} onChangeText={setName} placeholder="e.g. Data Structures, Calculus, English" autoCapitalize="words" />
        <Text style={styles.fieldLabel}>Exam date</Text>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
          <Text style={[styles.datePickerText, !examDate && styles.datePickerPlaceholder]}>{examDate ? `📅 ${formatDate(examDate)}` : 'Select exam date...'}</Text>
        </TouchableOpacity>
        {daysRemaining !== null && (
          <View style={styles.previewChipRow}><StatusChip label={daysRemaining === 0 ? 'Exam is today!' : `${daysRemaining} days remaining`} type={chipType} icon="⏳" size="sm" /></View>
        )}
        <Input label="Credit hours (optional)" value={creditHours} onChangeText={setCreditHours} placeholder="e.g. 3" keyboardType="decimal-pad" />
        <DifficultyRating rating={difficulty} onRatingChange={setDifficulty} />
        <ColorPicker selected={color} onSelect={setColor} />
        {errorMessage ? <Text style={styles.errorBanner}>{errorMessage}</Text> : null}
        <Button label={isEditMode ? 'Update subject' : 'Save subject'} onPress={handleSave} loading={isLoading} disabled={isLoading} fullWidth style={styles.saveBtn} />
        {isEditMode && <Button label="Delete subject" variant="danger" onPress={() => setShowDeleteModal(true)} disabled={isLoading} fullWidth style={styles.deleteBtn} />}
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Exam Date</Text>
            <View style={styles.pickerMonthRow}>
              <TouchableOpacity onPress={() => { const d = new Date(pickerMonthDate); d.setMonth(d.getMonth() - 1); setPickerMonthDate(d); }} style={styles.pickerArrowBtn}><Text style={styles.pickerArrow}>‹</Text></TouchableOpacity>
              <Text style={styles.pickerMonthText}>{MONTHS[pickerMonthDate.getMonth()]} {pickerMonthDate.getFullYear()}</Text>
              <TouchableOpacity onPress={() => { const d = new Date(pickerMonthDate); d.setMonth(d.getMonth() + 1); setPickerMonthDate(d); }} style={styles.pickerArrowBtn}><Text style={styles.pickerArrow}>›</Text></TouchableOpacity>
            </View>
            <View style={styles.dayGrid}>
              {Array.from({ length: daysInPickerMonth }, (_, i) => i + 1).map((day) => {
                const dayDate = new Date(pickerMonthDate.getFullYear(), pickerMonthDate.getMonth(), day);
                const isSelected = examDate && examDate.getFullYear() === dayDate.getFullYear() && examDate.getMonth() === dayDate.getMonth() && examDate.getDate() === day;
                return (
                  <TouchableOpacity key={day} style={[styles.dayCell, isSelected && styles.dayCellActive]} onPress={() => { setExamDate(dayDate); setShowDatePicker(false); }}>
                    <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>{day}</Text>
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
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerBackBtn: { paddingHorizontal: spacing.sm },
  headerBackIcon: { fontSize: fontSizes.xl, color: colors.textPrimary, fontWeight: '700' },
  scrollContent: { padding: spacing.md },
  fieldLabel: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.xs },
  datePickerBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: `${colors.textTertiary}30`, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.xs },
  datePickerText: { fontSize: fontSizes.sm + 1, fontWeight: '600', color: colors.textPrimary },
  datePickerPlaceholder: { color: colors.textTertiary },
  previewChipRow: { marginBottom: spacing.sm, marginTop: 2 },
  errorBanner: { fontSize: fontSizes.xs, color: colors.error, fontWeight: '600', textAlign: 'center', marginVertical: spacing.xs },
  saveBtn: { marginTop: spacing.sm },
  deleteBtn: { marginTop: spacing.sm },
  modalBackdrop: { flex: 1, backgroundColor: `${colors.textPrimary}80`, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  modalCard: { width: '100%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg },
  modalTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md },
  pickerMonthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  pickerArrowBtn: { padding: spacing.sm },
  pickerArrow: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.primary },
  pickerMonthText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', marginBottom: spacing.md },
  dayCell: { width: 38, height: 38, borderRadius: borderRadius.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  dayCellActive: { backgroundColor: colors.primary },
  dayText: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textPrimary },
  dayTextActive: { color: colors.surface, fontWeight: '800' },
  modalDoneBtn: { marginTop: spacing.xs },
});

export default AddSubjectScreen;
