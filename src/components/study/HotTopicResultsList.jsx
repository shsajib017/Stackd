import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import StatusChip from '../common/StatusChip';

/**
 * Interactive list of ranked PYQ hot topics with inline editing and importance chips.
 */
const HotTopicResultsList = React.memo(({ topics = [], onUpdateTopic, onDeleteTopic, onAddTopic }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>High-Yield Hot Topics</Text>
        <StatusChip label={`${topics.length} frequently tested topics`} type="info" size="sm" />
      </View>

      <View style={styles.list}>
        {topics.map((item, index) => {
          const count = Number(item.frequency_count) || 1;
          const importance = item.importance || (count >= 3 ? 'high' : count === 2 ? 'medium' : 'low');
          const chipType = importance === 'high' ? 'danger' : (importance === 'medium' ? 'warning' : 'info');

          return (
            <View key={item.id || index} style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
              <View style={[styles.rankBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Text style={[styles.rankText, { color: theme.colors.primary }]}>#{index + 1}</Text>
              </View>
              <View style={styles.content}>
                <TextInput
                  style={[styles.titleInput, { color: theme.colors.textPrimary }]}
                  value={item.topic || item.name || ''}
                  onChangeText={(txt) => onUpdateTopic?.(index, txt)}
                  placeholder="Topic title..."
                  placeholderTextColor={theme.colors.textTertiary}
                />
                <View style={styles.metaRow}>
                  <StatusChip label={importance.toUpperCase()} type={chipType} size="sm" />
                  <Text style={[styles.freqText, { color: theme.colors.textSecondary }]}>🔥 Appeared {count} {count === 1 ? 'time' : 'times'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDeleteTopic?.(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.deleteIcon, { color: theme.colors.textTertiary }]}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.addBtn, { borderColor: `${theme.colors.accent}60`, borderRadius: theme.borderRadius.md }]} onPress={onAddTopic} activeOpacity={0.8}>
        <Text style={[styles.addBtnText, { color: theme.colors.accent }]}>+ Add topic manually</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  list: { gap: 6 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  rankText: { fontSize: 10, fontWeight: '800' },
  content: { flex: 1, marginRight: 4 },
  titleInput: { fontSize: 13, fontWeight: '700', padding: 0, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  freqText: { fontSize: 9, fontWeight: '600' },
  deleteBtn: { padding: 4, marginLeft: 4 },
  deleteIcon: { fontSize: 14, fontWeight: '700' },
  addBtn: { marginTop: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  addBtnText: { fontSize: 11, fontWeight: '700' },
});

export default HotTopicResultsList;
