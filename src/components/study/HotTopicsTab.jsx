import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';
import HotTopicItem from './HotTopicItem';

/**
 * Subject High-Yield Hot Topics Tab generated from PYQ analysis.
 */
const HotTopicsTab = React.memo(({ hotTopics = [], subjectId, navigation, isLoading }) => {
  const renderItem = useCallback(({ item }) => (
    <HotTopicItem
      title={item.title}
      frequencyCount={item.frequency_count}
      importance={item.importance || 'medium'}
    />
  ), []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonCard height={65} style={styles.mb} />
        <SkeletonCard height={65} style={styles.mb} />
        <SkeletonCard height={65} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hotTopics}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="No hot topics yet"
            subtitle="Upload past exam papers to identify frequently tested topics"
            actionLabel="Upload PYQ"
            onAction={() => navigation.navigate('PYQUploadScreen', { subjectId })}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

export default HotTopicsTab;
