
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
    addCustomCategory,
    deleteCustomCategory,
    addCustomNote,
    deleteCustomNote,
  } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const baseFontSize = getFontSizeValue();
  const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';

  const getSectionTitle = () => {
    return sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
  };

  const getSectionIcon = () => {
    switch (sectionKey) {
      case 'characters':
        return 'person.2.fill';
      case 'settings':
        return 'map.fill';
      case 'miscellaneous':
        return 'folder.fill';
      default:
        return 'folder.fill';
    }
  };

  if (!currentProject) {
    return null;
  }

  if (categoryId === 'menu') {
    const categories = currentProject[sectionKey];

    const handleAddCategory = () => {
      if (categoryName.trim()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addCustomCategory(sectionKey, categoryName.trim());
        setCategoryName('');
        setShowAddCategory(false);
      }
    };

    const handleDeleteCategory = (id: string, name: string) => {
      Alert.alert(
        'Delete Category',
        `Are you sure you want to delete "${name}" and all its notes?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              deleteCustomCategory(sectionKey, id);
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
            {getSectionTitle()}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {categories.length === 0 && !showAddCategory && (
            <View style={styles.emptyState}>
              <IconSymbol name={getSectionIcon() as any} size={64} color={theme.dark ? '#666' : '#ccc'} />
              <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
                No categories yet. Create your first category to start adding notes.
              </Text>
            </View>
          )}

          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/custom/${section}/${category.id}` as any);
              }}
              onLongPress={() => handleDeleteCategory(category.id, category.name)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <IconSymbol name={getSectionIcon() as any} size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                  {category.name}
                </Text>
                <Text style={[styles.categoryCount, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                  {category.notes.length} {category.notes.length === 1 ? 'note' : 'notes'}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
            </Pressable>
          ))}

          {showAddCategory ? (
            <View style={[styles.addCategoryForm, { backgroundColor: theme.colors.card }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    fontSize: baseFontSize,
                  },
                ]}
                placeholder="Category name"
                placeholderTextColor={theme.dark ? '#666' : '#999'}
                value={categoryName}
                onChangeText={setCategoryName}
                autoFocus
                onSubmitEditing={handleAddCategory}
              />
              <View style={styles.formButtons}>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.dark ? '#333' : '#f0f0f0' }]}
                  onPress={() => {
                    setShowAddCategory(false);
                    setCategoryName('');
                  }}
                >
                  <Text style={[styles.formButtonText, { color: theme.colors.text, fontSize: baseFontSize }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddCategory}
                >
                  <Text style={[styles.formButtonText, { color: '#fff', fontSize: baseFontSize }]}>
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddCategory(true);
              }}
            >
              <IconSymbol name="plus" size={24} color="#fff" />
              <Text style={[styles.addButtonText, { fontSize: baseFontSize }]}>
                New Category
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  const category = currentProject[sectionKey].find((c) => c.id === categoryId);

  if (!category) {
    return null;
  }

  const handleAddNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const noteId = addCustomNote(sectionKey, categoryId as string);
    router.push({
      pathname: '/note-editor',
      params: {
        type: 'custom',
        section: sectionKey,
        categoryId: categoryId as string,
        noteId,
      },
    });
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteCustomNote(sectionKey, categoryId as string, noteId);
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
          {category.name}
        </Text>
        <Pressable onPress={handleAddNote} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {category.notes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No notes yet. Tap + to create your first note.
            </Text>
          </View>
        ) : (
          category.notes.map((note) => (
            <Pressable
              key={note.id}
              style={[styles.noteCard, { backgroundColor: theme.colors.card }]}
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
              onLongPress={() => handleDeleteNote(note.id)}
            >
              <Text
                style={[styles.notePreview, { color: theme.colors.text, fontSize: baseFontSize }]}
                numberOfLines={3}
              >
                {note.content || 'Empty note'}
              </Text>
              <Text style={[styles.noteDate, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                {new Date(note.updatedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          ))
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
  addButton: {
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
  categoryCard: {
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
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
  },
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notePreview: {
    marginBottom: 8,
    lineHeight: 22,
  },
  noteDate: {
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
  addCategoryForm: {
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
