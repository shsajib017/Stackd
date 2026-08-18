import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../config/ThemeContext';
import StatusChip from '../common/StatusChip';

/**
 * Interactive list of extracted syllabus topics with inline editing, deletion, and addition.
 */
const TopicResultsList = React.memo(({ topics = [], onUpdateTitle, onDeleteTopic, onAddTopic }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Extracted Topics</Text>
        <StatusChip label={`${topics.length} topics identified`} type="info" size="sm" />
      </View>

      <View style={styles.list}>
        {topics.map((topic, index) => {
          const comp = topic.complexity || 3;
          const compType = comp <= 2 ? 'success' : (comp === 3 ? 'warning' : 'danger');
          const compLabel = comp <= 2 ? 'Easy' : (comp === 3 ? 'Moderate' : 'Hard');
          const hours = topic.estimated_hours || 2;

          return (
            <View key={topic.id || index} style={[styles.topicCard, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.textTertiary}20` }]}>
              <View style={styles.cardMain}>
                <TextInput
                  style={[styles.titleInput, { color: theme.colors.textPrimary }]}
                  value={topic.title}
                  onChangeText={(txt) => onUpdateTitle?.(index, txt)}
                  placeholder="Topic title..."
                  placeholderTextColor={theme.colors.textTertiary}
                />
                <View style={styles.badgeRow}>
                  <StatusChip label={compLabel} type={compType} size="sm" />
                  <View style={[styles.hoursBadge, { backgroundColor: `${theme.colors.primary}12`, borderRadius: theme.borderRadius.sm }]}>
                    <Text style={[styles.hoursText, { color: theme.colors.primary }]}>⏱ {hours}h est.</Text>
                  </View>
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

      <TouchableOpacity
        style={[styles.addBtn, { borderRadius: theme.borderRadius.md, borderColor: `${theme.colors.primary}40` }]}
        onPress={onAddTopic}
        activeOpacity={0.8}
      >
        <Text style={[styles.addBtnText, { color: theme.colors.primary }]}>+ Add topic manually</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { marginTop: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800' },
  list: { gap: 6 },
  topicCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1 },
  cardMain: { flex: 1, marginRight: 4 },
  titleInput: { fontSize: 13, fontWeight: '700', padding: 0, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  hoursText: { fontSize: 9, fontWeight: '700' },
  deleteBtn: { padding: 4, marginLeft: 4 },
  deleteIcon: { fontSize: 14, fontWeight: '700' },
  addBtn: { marginTop: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
  addBtnText: { fontSize: 11, fontWeight: '700' },
});

export default TopicResultsList;
