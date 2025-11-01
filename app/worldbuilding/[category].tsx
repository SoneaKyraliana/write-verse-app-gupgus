
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects, WorldbuildingWithMaps } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

const WORLDBUILDING_CATEGORIES = {
  menu: { title: 'Worldbuilding', icon: 'globe' },
  religion: { title: 'Religion', icon: 'sparkles' },
  culture: { title: 'Culture', icon: 'theatermasks' },
  dailyLife: { title: 'Daily Life', icon: 'house.fill' },
  socialStructure: { title: 'Social Structure', icon: 'person.3.fill' },
  politicalStructure: { title: 'Political Structure', icon: 'building.columns.fill' },
  mythology: { title: 'Mythology', icon: 'moon.stars.fill' },
  history: { title: 'History', icon: 'book.fill' },
  geography: { title: 'Geography', icon: 'map.fill' },
  environment: { title: 'Environment', icon: 'leaf.fill' },
};

export default function WorldbuildingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const { 
    currentProject, 
    addWorldbuildingNote, 
    deleteWorldbuildingNote,
    addWorldbuildingMap,
    deleteWorldbuildingMap
  } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showAddMap, setShowAddMap] = useState(false);
  const [mapName, setMapName] = useState('');

  const baseFontSize = getFontSizeValue();
  const categoryKey = category as string;

  if (categoryKey === 'menu') {
    const categories = Object.entries(WORLDBUILDING_CATEGORIES).filter(([key]) => key !== 'menu');

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 8 }]}>
            Worldbuilding
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {categories.map(([key, value]) => (
            <Pressable
              key={key}
              style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/worldbuilding/${key}` as any);
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <IconSymbol name={value.icon as any} size={28} color={theme.colors.primary} />
              </View>
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                {value.title}
              </Text>
              <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!currentProject) {
    return null;
  }

  const categoryData = currentProject.worldbuilding[categoryKey as keyof WorldbuildingWithMaps];
  const notes = categoryData?.notes || [];
  const maps = categoryData?.maps || [];
  const categoryInfo = WORLDBUILDING_CATEGORIES[categoryKey as keyof typeof WORLDBUILDING_CATEGORIES];

  const handleAddNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const noteId = addWorldbuildingNote(categoryKey as keyof WorldbuildingWithMaps);
    router.push({
      pathname: '/note-editor',
      params: {
        type: 'worldbuilding',
        category: categoryKey,
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
            deleteWorldbuildingNote(categoryKey as keyof WorldbuildingWithMaps, noteId);
          },
        },
      ]
    );
  };

  const handleAddMap = () => {
    if (mapName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const mapId = addWorldbuildingMap(categoryKey as keyof WorldbuildingWithMaps, mapName.trim());
      setMapName('');
      setShowAddMap(false);
      router.push({
        pathname: '/maps/builder',
        params: {
          mapId,
          source: 'worldbuilding',
          category: categoryKey,
        },
      });
    }
  };

  const handleDeleteMap = (mapId: string, name: string) => {
    Alert.alert(
      'Delete Map',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteWorldbuildingMap(categoryKey as keyof WorldbuildingWithMaps, mapId);
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
          {categoryInfo?.title}
        </Text>
        <Pressable onPress={handleAddNote} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Maps Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
            Maps
          </Text>
          
          {maps.length === 0 && !showAddMap && (
            <View style={styles.emptySection}>
              <IconSymbol name="map" size={32} color={theme.dark ? '#666' : '#ccc'} />
              <Text style={[styles.emptySectionText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                No maps yet
              </Text>
            </View>
          )}

          {maps.map((map) => (
            <Pressable
              key={map.id}
              style={[styles.mapCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/maps/builder',
                  params: {
                    mapId: map.id,
                    source: 'worldbuilding',
                    category: categoryKey,
                  },
                });
              }}
              onLongPress={() => handleDeleteMap(map.id, map.name)}
            >
              <IconSymbol name="map.fill" size={24} color={theme.colors.primary} />
              <Text style={[styles.mapName, { color: theme.colors.text, fontSize: baseFontSize }]}>
                {map.name}
              </Text>
              <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
            </Pressable>
          ))}

          {showAddMap ? (
            <View style={[styles.addMapForm, { backgroundColor: theme.colors.card }]}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                    fontSize: baseFontSize,
                  },
                ]}
                placeholder="Map name"
                placeholderTextColor={theme.dark ? '#666' : '#999'}
                value={mapName}
                onChangeText={setMapName}
                autoFocus
                onSubmitEditing={handleAddMap}
              />
              <View style={styles.formButtons}>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.dark ? '#333' : '#f0f0f0' }]}
                  onPress={() => {
                    setShowAddMap(false);
                    setMapName('');
                  }}
                >
                  <Text style={[styles.formButtonText, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.formButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddMap}
                >
                  <Text style={[styles.formButtonText, { color: '#fff', fontSize: baseFontSize - 2 }]}>
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.addMapButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAddMap(true);
              }}
            >
              <IconSymbol name="plus.circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.addMapButtonText, { color: theme.colors.primary, fontSize: baseFontSize - 2 }]}>
                New Map
              </Text>
            </Pressable>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
            Notes
          </Text>

          {notes.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" size={64} color={theme.dark ? '#666' : '#ccc'} />
              <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
                No notes yet. Tap + to create your first note.
              </Text>
            </View>
          ) : (
            notes.map((note) => (
              <Pressable
                key={note.id}
                style={[styles.noteCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: '/note-editor',
                    params: {
                      type: 'worldbuilding',
                      category: categoryKey,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptySectionText: {
    marginTop: 8,
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapName: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '500',
  },
  addMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addMapButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  addMapForm: {
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    fontWeight: '600',
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
  categoryTitle: {
    flex: 1,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
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
});
