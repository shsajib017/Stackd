import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudyScreen from '../screens/study/StudyScreen';
import SubjectsScreen from '../screens/study/SubjectsScreen';
import AddSubjectScreen from '../screens/study/AddSubjectScreen';
import SubjectDetailScreen from '../screens/study/SubjectDetailScreen';
import ScheduleScreen from '../screens/study/ScheduleScreen';
import AutoScheduleScreen from '../screens/study/AutoScheduleScreen';
import NotesEditorScreen from '../screens/study/NotesEditorScreen';
import SyllabusUploadScreen from '../screens/study/SyllabusUploadScreen';
import PYQUploadScreen from '../screens/study/PYQUploadScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

/**
 * Navigation stack for Study module.
 */
const StudyStack = React.memo(() => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="StudyScreen" component={StudyScreen} options={{ title: 'Study Hub' }} />
      <Stack.Screen name="SubjectsScreen" component={SubjectsScreen} options={{ title: 'Subjects' }} />
      <Stack.Screen name="AddSubjectScreen" component={AddSubjectScreen} options={{ title: 'Add Subject' }} />
      <Stack.Screen name="SubjectDetailScreen" component={SubjectDetailScreen} options={{ title: 'Subject Details' }} />
      <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} options={{ title: 'Schedule' }} />
      <Stack.Screen name="AutoScheduleScreen" component={AutoScheduleScreen} options={{ title: 'Smart Schedule' }} />
      <Stack.Screen name="NotesEditorScreen" component={NotesEditorScreen} options={{ title: 'Notes' }} />
      <Stack.Screen name="SyllabusUploadScreen" component={SyllabusUploadScreen} options={{ title: 'AI Syllabus' }} />
      <Stack.Screen name="PYQUploadScreen" component={PYQUploadScreen} options={{ title: 'PYQ Hot Topics' }} />
    </Stack.Navigator>
  );
});

export default StudyStack;
