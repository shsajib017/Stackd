import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../config/ThemeContext';
import { stripMarkdown } from '../../utils/markdownHelpers';

/**
 * Markdown Editor component with live text editing, rendered preview mode, and metadata counters.
 */
const MarkdownEditor = React.memo(({
  value = '',
  onChange,
  placeholder = 'Write your notes in Markdown...',
  style,
}) => {
  const { theme } = useTheme();
  const [isPreview, setIsPreview] = useState(false);

  const { wordCount, readingTime } = useMemo(() => {
    const clean = stripMarkdown(value);
    const words = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readingTime: `${minutes} min read` };
  }, [value]);

  const markdownStyles = useMemo(() => ({
    body: { color: theme.colors.textPrimary, fontSize: 14 },
    heading1: { color: theme.colors.primary, fontSize: 24, fontWeight: 'bold' },
    heading2: { color: theme.colors.primary, fontSize: 20, fontWeight: 'bold' },
    heading3: { color: theme.colors.primary, fontSize: 16, fontWeight: '600' },
    link: { color: theme.colors.primary, textDecorationLine: 'underline' },
    code_inline: { backgroundColor: theme.colors.background, color: theme.colors.primary, borderRadius: theme.borderRadius.sm },
  }), [theme]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: `${theme.colors.textTertiary}30`,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.surface,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: `${theme.colors.textTertiary}20`,
          },
        ]}
      >
        <View style={styles.stats}>
          <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{wordCount} words</Text>
          <Text style={[styles.dot, { color: theme.colors.textSecondary }]}>•</Text>
          <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>{readingTime}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.sm,
              borderColor: `${theme.colors.textTertiary}30`,
            },
          ]}
          onPress={() => setIsPreview(!isPreview)}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleText, { color: theme.colors.primary }]}>{isPreview ? '✏️ Edit' : '👁️ Preview'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {isPreview ? (
          <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
            {value ? <Markdown style={markdownStyles}>{value}</Markdown> : <Text style={[styles.emptyPreviewText, { color: theme.colors.textTertiary }]}>Nothing to preview yet.</Text>}
          </ScrollView>
        ) : (
          <TextInput
            style={[styles.textInput, { color: theme.colors.textPrimary }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: 10, fontWeight: '500' },
  dot: { marginHorizontal: 4, fontSize: 10 },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  toggleText: { fontSize: 10, fontWeight: '700' },
  body: { minHeight: 200 },
  textInput: { padding: 16, fontSize: 14, minHeight: 200, lineHeight: 22 },
  previewScroll: { padding: 16, minHeight: 200 },
  emptyPreviewText: { fontSize: 12, fontStyle: 'italic', marginTop: 16, textAlign: 'center' },
});

export default MarkdownEditor;
