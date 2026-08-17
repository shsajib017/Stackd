import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import StatusChip from '../common/StatusChip';

/**
 * Interactive list of ranked PYQ hot topics with inline editing and importance chips.
 */
const HotTopicResultsList = React.memo(({ topics = [], onUpdateTopic, onDeleteTopic, onAddTopic }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>High-Yield Hot Topics</Text>
        <StatusChip label={`${topics.length} frequently tested topics`} type="info" size="sm" />
      </View>

      <View style={styles.list}>
        {topics.map((item, index) => {
          const count = Number(item.frequency_count) || 1;
          const importance = item.importance || (count >= 3 ? 'high' : count === 2 ? 'medium' : 'low');
          const chipType = importance === 'high' ? 'danger' : (importance === 'medium' ? 'warning' : 'info');

          return (
            <View key={item.id || index} style={styles.card}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.content}>
                <TextInput
                  style={styles.titleInput}
                  value={item.topic || item.name || ''}
                  onChangeText={(txt) => onUpdateTopic?.(index, txt)}
                  placeholder="Topic title..."
                  placeholderTextColor={colors.textTertiary}
                />
                <View style={styles.metaRow}>
                  <StatusChip label={importance.toUpperCase()} type={chipType} size="sm" />
                  <Text style={styles.freqText}>🔥 Appeared {count} {count === 1 ? 'time' : 'times'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDeleteTopic?.(index)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={onAddTopic} activeOpacity={0.8}>
        <Text style={styles.addBtnText}>+ Add topic manually</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: spacing.md, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: '800', color: colors.textPrimary },
  list: { gap: spacing.xs + 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm + 2, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: spacing.xs + 2 },
  rankText: { fontSize: fontSizes.xs, fontWeight: '800', color: colors.primary },
  content: { flex: 1, marginRight: spacing.xs },
  titleInput: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary, padding: 0, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  freqText: { fontSize: fontSizes.xs - 1, fontWeight: '600', color: colors.textSecondary },
  deleteBtn: { padding: 4, marginLeft: spacing.xs },
  deleteIcon: { fontSize: 14, color: colors.textTertiary, fontWeight: '700' },
  addBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.accent}60`, borderStyle: 'dashed' },
  addBtnText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.accent },
});

export default HotTopicResultsList;
