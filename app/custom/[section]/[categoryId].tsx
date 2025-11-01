
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function CustomCategoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { section, categoryId } = useLocalSearchParams();
  const { 
    currentProject, 
    addCustomNote, 
    deleteCustomNote,
  } = useProjects();
  const { getFontSizeValue } = useSettings();

  const [isLoading, setIsLoading] = useState(true);

  const baseFontSize = getFontSizeValue();

  const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';
  const category = currentProject?.[sectionKey]?.find(c => c.id === categoryId);

  useEffect(() => {
    if (currentProject && category !== undefined) {
      console.log('Custom category loaded:', sectionKey, categoryId, 'Notes:', category?.notes?.length);
      setIsLoading(false);
    }
  }, [currentProject, category]);

  const getSectionTitle = () => {
    switch (section) {
      case 'characters':
        return 'Characters';
      case 'settings':
        return 'Settings';
      case 'miscellaneous':
        return 'Miscellaneous';
      default:
        return '';
    }
  };

  const getSectionIcon = () => {
    switch (section) {
      case 'characters':
        return 'person.fill';
      case 'settings':
        return 'location.fill';
      case 'miscellaneous':
        return 'folder.fill';
      default:
        return 'folder.fill';
    }
  };

  const handleAddNote = () => {
    if (!categoryId) return;
    const noteId = addCustomNote(sectionKey, categoryId as string);
    if (noteId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push({
        pathname: '/note-editor',
        params: {
          type: 'custom',
          section: sectionKey,
          categoryId: categoryId as string,
          noteId,
        },
      });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!categoryId) return;
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomNote(sectionKey, categoryId as string, noteId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            Loading...
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text, fontSize: baseFontSize }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  if (!currentProject || !category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            Error
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text, fontSize: baseFontSize }]}>
            No project selected. Please go back and select a project.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <IconSymbol name={getSectionIcon() as any} size={28} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            {category.name}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
              Notes
            </Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddNote}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </Pressable>
          </View>

          {category.notes && category.notes.length > 0 ? (
            category.notes.map((note) => (
              <Pressable
                key={note.id}
                style={[styles.noteItem, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/note-editor',
                    params: {
                      type: 'custom',
                      section: sectionKey,
                      categoryId: categoryId as string,
                      noteId: note.id,
                    },
                  });
                }}
              >
                <View style={styles.noteContent}>
                  <Text
                    style={[styles.notePreview, { color: theme.colors.text, fontSize: baseFontSize }]}
                    numberOfLines={2}
                  >
                    {note.content || 'Empty note'}
                  </Text>
                  <Text style={[styles.noteDate, { color: theme.colors.text, fontSize: baseFontSize - 4 }]}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteNote(note.id)}
                  style={styles.deleteButton}
                >
                  <IconSymbol name="trash" size={20} color="#FF3B30" />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
              No notes yet. Tap + to create one.
            </Text>
          )}
        </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteContent: {
    flex: 1,
    gap: 4,
  },
  notePreview: {
    opacity: 0.8,
  },
  noteDate: {
    opacity: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
