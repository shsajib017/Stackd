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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyScreen" component={StudyScreen} />
      <Stack.Screen name="SubjectsScreen" component={SubjectsScreen} />
      <Stack.Screen name="AddSubjectScreen" component={AddSubjectScreen} />
      <Stack.Screen name="SubjectDetailScreen" component={SubjectDetailScreen} />
      <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
      <Stack.Screen name="AutoScheduleScreen" component={AutoScheduleScreen} />
      <Stack.Screen name="NotesEditorScreen" component={NotesEditorScreen} />
      <Stack.Screen name="SyllabusUploadScreen" component={SyllabusUploadScreen} />
      <Stack.Screen name="PYQUploadScreen" component={PYQUploadScreen} />
    </Stack.Navigator>
  );
});

export default StudyStack;
