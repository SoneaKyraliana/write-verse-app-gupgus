
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects, Project } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function NoteEditorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { type, category, section, categoryId, noteId } = useLocalSearchParams();
  const {
    currentProject,
    updateWorldbuildingNote,
    updateCustomNote,
  } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [content, setContent] = useState('');

  const baseFontSize = getFontSizeValue();

  useEffect(() => {
    if (!currentProject) return;

    if (type === 'worldbuilding') {
      const notes = currentProject.worldbuilding[category as keyof Project['worldbuilding']];
      const note = notes?.find((n) => n.id === noteId);
      if (note) {
        setContent(note.content);
      }
    } else if (type === 'custom') {
      const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';
      const cat = currentProject[sectionKey].find((c) => c.id === categoryId);
      const note = cat?.notes.find((n) => n.id === noteId);
      if (note) {
        setContent(note.content);
      }
    }
  }, [currentProject, type, category, section, categoryId, noteId]);

  const handleSave = () => {
    if (type === 'worldbuilding') {
      updateWorldbuildingNote(
        category as keyof Project['worldbuilding'],
        noteId as string,
        content
      );
    } else if (type === 'custom') {
      updateCustomNote(
        section as 'characters' | 'settings' | 'miscellaneous',
        categoryId as string,
        noteId as string,
        content
      );
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.cancelText, { color: theme.colors.primary, fontSize: baseFontSize }]}>
            Cancel
          </Text>
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
          Edit Note
        </Text>
        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={[styles.saveText, { color: theme.colors.primary, fontSize: baseFontSize }]}>
            Save
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={[
          styles.textInput,
          {
            color: theme.colors.text,
            fontSize: baseFontSize,
          },
        ]}
        value={content}
        onChangeText={setContent}
        placeholder="Start writing..."
        placeholderTextColor={theme.dark ? '#666' : '#999'}
        multiline
        autoFocus
        textAlignVertical="top"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  cancelText: {
    fontWeight: '600',
  },
  saveText: {
    fontWeight: '600',
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    padding: 20,
    lineHeight: 24,
  },
});
