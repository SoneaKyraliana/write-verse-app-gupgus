
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function StoryMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentProject, addChapter, deleteChapter } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterName, setChapterName] = useState('');

  const baseFontSize = getFontSizeValue();

  if (!currentProject) {
    return null;
  }

  const chapters = currentProject.story || [];

  const handleAddChapter = () => {
    if (chapterName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addChapter(chapterName.trim());
      setChapterName('');
      setShowAddChapter(false);
    }
  };

  const handleDeleteChapter = (id: string, name: string) => {
    Alert.alert(
      'Delete Chapter',
      `Are you sure you want to delete "${name}" and all its scenes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteChapter(id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 8 }]}>
          Story
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {chapters.length === 0 && !showAddChapter && (
          <View style={styles.emptyState}>
            <IconSymbol name="book.fill" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No chapters yet. Create your first chapter to start writing scenes.
            </Text>
          </View>
        )}

        {chapters.map((chapter, index) => (
          <Pressable
            key={chapter.id}
            style={[styles.chapterCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/story/${chapter.id}` as any);
            }}
            onLongPress={() => handleDeleteChapter(chapter.id, chapter.name)}
          >
            <View style={[styles.chapterIcon, { backgroundColor: '#5856D6' + '20' }]}>
              <Text style={[styles.chapterNumber, { color: '#5856D6', fontSize: baseFontSize + 2 }]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.chapterInfo}>
              <Text style={[styles.chapterTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                {chapter.name}
              </Text>
              <Text style={[styles.chapterCount, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                {chapter.notes.length} {chapter.notes.length === 1 ? 'scene' : 'scenes'}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
          </Pressable>
        ))}

        {showAddChapter ? (
          <View style={[styles.addChapterForm, { backgroundColor: theme.colors.card }]}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  fontSize: baseFontSize,
                },
              ]}
              placeholder="Chapter name (e.g., Chapter 1: The Beginning)"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              value={chapterName}
              onChangeText={setChapterName}
              autoFocus
              onSubmitEditing={handleAddChapter}
            />
            <View style={styles.formButtons}>
              <Pressable
                style={[styles.formButton, { backgroundColor: theme.dark ? '#333' : '#f0f0f0' }]}
                onPress={() => {
                  setShowAddChapter(false);
                  setChapterName('');
                }}
              >
                <Text style={[styles.formButtonText, { color: theme.colors.text, fontSize: baseFontSize }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.formButton, { backgroundColor: '#5856D6' }]}
                onPress={handleAddChapter}
              >
                <Text style={[styles.formButtonText, { color: '#fff', fontSize: baseFontSize }]}>
                  Create
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={[styles.addButton, { backgroundColor: '#5856D6' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddChapter(true);
            }}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
            <Text style={[styles.addButtonText, { fontSize: baseFontSize }]}>
              New Chapter
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
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
  title: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chapterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chapterNumber: {
    fontWeight: 'bold',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  chapterCount: {
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  addChapterForm: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    fontWeight: '600',
  },
});
