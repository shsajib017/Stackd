import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSizes } from '../../config/theme';

/** NotesEditorScreen placeholder. */
const NotesEditorScreen = React.memo(() => (
  <View style={styles.container}><Text style={styles.title}>NotesEditorScreen</Text></View>
));

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: fontSizes.xl, color: colors.primary, fontWeight: 'bold' },
});

export default NotesEditorScreen;
