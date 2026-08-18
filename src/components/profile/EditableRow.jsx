import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';

/** Reusable inline editable row for Account profile fields. */
const EditableRow = React.memo(({ label, value, isEditing = false, editValue = '', onChangeText, onStartEdit, onSave, onCancel, readOnly = false, hint, placeholder, borderBottom = true }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, borderBottom && { borderBottomWidth: 1, borderBottomColor: `${theme.colors.textTertiary}15` }]}>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      {isEditing ? (
        <View style={styles.editWrap}>
          <TextInput
            style={[styles.input, { color: theme.colors.textPrimary, borderColor: `${theme.colors.primary}50`, backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.sm }]}
            value={editValue}
            onChangeText={onChangeText}
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            placeholderTextColor={theme.colors.textTertiary}
            autoFocus
          />
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={onSave} style={[styles.actionBtn, { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.sm }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.btnIcon}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={[styles.actionBtn, { backgroundColor: `${theme.colors.textTertiary}30`, borderRadius: theme.borderRadius.sm }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.btnIcon, { color: theme.colors.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.viewWrap}>
          <View style={styles.valCol}>
            <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value || 'Not set'}</Text>
            {hint ? <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{hint}</Text> : null}
          </View>
          {!readOnly ? (
            <TouchableOpacity onPress={onStartEdit} style={styles.editBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={[styles.editIcon, { color: theme.colors.primary }]}>✎</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  viewWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valCol: { flex: 1, marginRight: 8 },
  value: { fontSize: 13, fontWeight: '700' },
  hint: { fontSize: 10, marginTop: 2 },
  editBtn: { padding: 4 },
  editIcon: { fontSize: 14, fontWeight: '700' },
  editWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  input: { flex: 1, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, fontSize: 13, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  btnIcon: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});

export default EditableRow;
