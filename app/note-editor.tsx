
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
  const { type, category, section, categoryId, noteId, chapterId } = useLocalSearchParams();
  const {
    currentProject,
    updateWorldbuildingNote,
    updateCustomNote,
    updateScene,
  } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [content, setContent] = useState('');

  const baseFontSize = getFontSizeValue();

  useEffect(() => {
    if (!currentProject) return;

    if (type === 'worldbuilding' && category) {
      const notes = currentProject.worldbuilding[category as keyof Project['worldbuilding']];
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setContent(note.content);
      }
    } else if (type === 'custom' && section && categoryId) {
      const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';
      const cat = currentProject[sectionKey].find(c => c.id === categoryId);
      const note = cat?.notes.find(n => n.id === noteId);
      if (note) {
        setContent(note.content);
      }
    } else if (type === 'story' && chapterId) {
      const chapter = currentProject.story?.find(c => c.id === chapterId);
      const scene = chapter?.notes.find(n => n.id === noteId);
      if (scene) {
        setContent(scene.content);
      }
    }
  }, [currentProject, type, category, section, categoryId, noteId, chapterId]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (type === 'worldbuilding' && category) {
      updateWorldbuildingNote(
        category as keyof Project['worldbuilding'],
        noteId as string,
        content
      );
    } else if (type === 'custom' && section && categoryId) {
      updateCustomNote(
        section as 'characters' | 'settings' | 'miscellaneous',
        categoryId as string,
        noteId as string,
        content
      );
    } else if (type === 'story' && chapterId) {
      updateScene(
        chapterId as string,
        noteId as string,
        content
      );
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="xmark" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
          {type === 'story' ? 'Scene' : 'Note'}
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
        multiline
        value={content}
        onChangeText={setContent}
        placeholder={type === 'story' ? 'Write your scene here...' : 'Start writing...'}
        placeholderTextColor={theme.dark ? '#666' : '#999'}
        autoFocus
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
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveText: {
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    padding: 20,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
});
