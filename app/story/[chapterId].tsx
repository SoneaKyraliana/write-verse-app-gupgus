
import React from 'react';
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

export default function ChapterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { chapterId } = useLocalSearchParams();
  const { currentProject, addScene, deleteScene } = useProjects();
  const { getFontSizeValue } = useSettings();

  const baseFontSize = getFontSizeValue();

  if (!currentProject) {
    return null;
  }

  const chapter = currentProject.story?.find((c) => c.id === chapterId);

  if (!chapter) {
    return null;
  }

  const handleAddScene = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const sceneId = addScene(chapterId as string);
    router.push({
      pathname: '/note-editor',
      params: {
        type: 'story',
        chapterId: chapterId as string,
        noteId: sceneId,
      },
    });
  };

  const handleDeleteScene = (sceneId: string) => {
    Alert.alert(
      'Delete Scene',
      'Are you sure you want to delete this scene?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteScene(chapterId as string, sceneId);
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
          {chapter.name}
        </Text>
        <Pressable onPress={handleAddScene} style={styles.addButton}>
          <IconSymbol name="plus" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {chapter.notes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No scenes yet. Tap + to create your first scene.
            </Text>
          </View>
        ) : (
          chapter.notes.map((scene, index) => (
            <Pressable
              key={scene.id}
              style={[styles.sceneCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/note-editor',
                  params: {
                    type: 'story',
                    chapterId: chapterId as string,
                    noteId: scene.id,
                  },
                });
              }}
              onLongPress={() => handleDeleteScene(scene.id)}
            >
              <View style={styles.sceneHeader}>
                <View style={[styles.sceneNumber, { backgroundColor: '#5856D6' + '20' }]}>
                  <Text style={[styles.sceneNumberText, { color: '#5856D6', fontSize: baseFontSize - 2 }]}>
                    Scene {index + 1}
                  </Text>
                </View>
                <Text style={[styles.sceneDate, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                  {new Date(scene.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[styles.scenePreview, { color: theme.colors.text, fontSize: baseFontSize }]}
                numberOfLines={3}
              >
                {scene.content || 'Empty scene'}
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
  sceneCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sceneNumber: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sceneNumberText: {
    fontWeight: '600',
  },
  sceneDate: {
  },
  scenePreview: {
    lineHeight: 22,
  },
});
