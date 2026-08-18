import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ConfirmModal from '../common/ConfirmModal';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';
import SessionItem from './SessionItem';

/**
 * Subject Schedule Tab rendering subject-specific study sessions.
 */
const ScheduleTab = React.memo(({ sessions = [], subject, onToggleComplete, onDeleteSession, onOpenPomodoro, navigation, isLoading }) => {
  const [deleteSessionTarget, setDeleteSessionTarget] = useState(null);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteSessionTarget?.id) return;
    try {
      await onDeleteSession?.(deleteSessionTarget.id);
      setDeleteSessionTarget(null);
    } catch {}
  }, [deleteSessionTarget?.id, onDeleteSession]);

  const renderItem = useCallback(({ item }) => (
    <SessionItem
      session={item}
      subject={subject}
      onToggleComplete={onToggleComplete}
      onPress={onOpenPomodoro}
      onLongPress={() => setDeleteSessionTarget(item)}
    />
  ), [onOpenPomodoro, onToggleComplete, subject]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonCard height={70} style={styles.mb} />
        <SkeletonCard height={70} style={styles.mb} />
        <SkeletonCard height={70} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No sessions scheduled"
            subtitle="Plan ahead by generating a personalized timetable"
            actionLabel="Generate schedule"
            onAction={() => navigation.navigate('AutoScheduleScreen')}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <ConfirmModal
        visible={Boolean(deleteSessionTarget)}
        title="Delete Session?"
        message="Are you sure you want to remove this scheduled session?"
        confirmLabel="Delete"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteSessionTarget(null)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { padding: 16 },
  listContent: { padding: 16, paddingBottom: 100 },
  mb: { marginBottom: 8 },
});

export default ScheduleTab;
