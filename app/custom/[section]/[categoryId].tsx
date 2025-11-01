
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
    addCustomNote, 
    deleteCustomNote,
    addCustomCategoryMap,
    deleteCustomCategoryMap
  } = useProjects();
  const { getFontSizeValue } = useSettings();

  const [showMapNameInput, setShowMapNameInput] = useState(false);
  const [newMapName, setNewMapName] = useState('');

  const baseFontSize = getFontSizeValue();

  const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';
  const category = currentProject?.[sectionKey]?.find(c => c.id === categoryId);

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

  const handleAddMap = () => {
    setShowMapNameInput(true);
  };

  const handleCreateMap = () => {
    if (newMapName.trim() && categoryId) {
      const mapId = addCustomCategoryMap(sectionKey, categoryId as string, newMapName.trim());
      if (mapId) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowMapNameInput(false);
        setNewMapName('');
        router.push({
          pathname: '/maps/builder',
          params: {
            mapId,
            source: 'custom',
            section: sectionKey,
            categoryId: categoryId as string,
          },
        });
      }
    }
  };

  const handleDeleteMap = (mapId: string, name: string) => {
    if (!categoryId) return;
    Alert.alert(
      'Delete Map',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomCategoryMap(sectionKey, categoryId as string, mapId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  if (!currentProject || !category) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
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
        {/* Maps Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
              Maps
            </Text>
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddMap}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </Pressable>
          </View>

          {showMapNameInput && (
            <View style={[styles.mapNameInput, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.input, { color: theme.colors.text, fontSize: baseFontSize }]}
                placeholder="Enter map name..."
                placeholderTextColor={theme.dark ? '#666' : '#999'}
                value={newMapName}
                onChangeText={setNewMapName}
                autoFocus
              />
              <View style={styles.inputButtons}>
                <Pressable
                  style={[styles.inputButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => {
                    setShowMapNameInput(false);
                    setNewMapName('');
                  }}
                >
                  <Text style={[styles.inputButtonText, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.inputButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleCreateMap}
                >
                  <Text style={[styles.inputButtonText, { color: '#fff', fontSize: baseFontSize - 2 }]}>
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {category.maps && category.maps.length > 0 ? (
            category.maps.map((map) => (
              <Pressable
                key={map.id}
                style={[styles.mapItem, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/maps/builder',
                    params: {
                      mapId: map.id,
                      source: 'custom',
                      section: sectionKey,
                      categoryId: categoryId as string,
                    },
                  });
                }}
              >
                <View style={styles.mapInfo}>
                  <IconSymbol name="map.fill" size={24} color={theme.colors.primary} />
                  <Text style={[styles.mapName, { color: theme.colors.text, fontSize: baseFontSize }]}>
                    {map.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteMap(map.id, map.name)}
                  style={styles.deleteButton}
                >
                  <IconSymbol name="trash" size={20} color="#FF3B30" />
                </Pressable>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
              No maps yet. Tap + to create one.
            </Text>
          )}
        </View>

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
  mapNameInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  inputButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  inputButtonText: {
    fontWeight: '600',
  },
  mapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  mapInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mapName: {
    fontWeight: '600',
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
