import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, fontSizes, shadows, spacing } from '../../config/theme';
import StatusChip from '../common/StatusChip';

/**
 * Interactive list of extracted syllabus topics with inline editing, deletion, and addition.
 */
const TopicResultsList = React.memo(({ topics = [], onUpdateTitle, onDeleteTopic, onAddTopic }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Extracted Topics</Text>
        <StatusChip label={`${topics.length} topics identified`} type="info" size="sm" />
      </View>

      <View style={styles.list}>
        {topics.map((topic, index) => {
          const comp = topic.complexity || 3;
          const compType = comp <= 2 ? 'success' : (comp === 3 ? 'warning' : 'danger');
          const compLabel = comp <= 2 ? 'Easy' : (comp === 3 ? 'Moderate' : 'Hard');
          const hours = topic.estimated_hours || 2;

          return (
            <View key={topic.id || index} style={styles.topicCard}>
              <View style={styles.cardMain}>
                <TextInput
                  style={styles.titleInput}
                  value={topic.title}
                  onChangeText={(txt) => onUpdateTitle?.(index, txt)}
                  placeholder="Topic title..."
                  placeholderTextColor={colors.textTertiary}
                />
                <View style={styles.badgeRow}>
                  <StatusChip label={compLabel} type={compType} size="sm" />
                  <View style={styles.hoursBadge}>
                    <Text style={styles.hoursText}>⏱ {hours}h est.</Text>
                  </View>
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
  topicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm + 2, borderWidth: 1, borderColor: `${colors.textTertiary}20`, ...shadows.sm },
  cardMain: { flex: 1, marginRight: spacing.xs },
  titleInput: { fontSize: fontSizes.sm + 1, fontWeight: '700', color: colors.textPrimary, padding: 0, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hoursBadge: { backgroundColor: `${colors.primary}12`, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.sm },
  hoursText: { fontSize: fontSizes.xs - 1, fontWeight: '700', color: colors.primary },
  deleteBtn: { padding: 4, marginLeft: spacing.xs },
  deleteIcon: { fontSize: 14, color: colors.textTertiary, fontWeight: '700' },
  addBtn: { marginTop: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1, borderColor: `${colors.primary}40`, borderStyle: 'dashed' },
  addBtnText: { fontSize: fontSizes.xs + 1, fontWeight: '700', color: colors.primary },
});

export default TopicResultsList;
