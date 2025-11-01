
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

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { projects, addProject, deleteProject, selectProject } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleAddProject = () => {
    if (projectName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addProject(projectName.trim());
      setProjectName('');
      setShowAddProject(false);
    }
  };

  const handleSelectProject = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectProject(id);
    router.push(`/project/${id}`);
  };

  const handleDeleteProject = (id: string, name: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteProject(id);
          },
        },
      ]
    );
  };

  const baseFontSize = getFontSizeValue();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 12 }]}>
          Wriven
        </Text>
        <View style={styles.headerButtons}>
          <Pressable
            onPress={() => router.push('/search')}
            style={styles.headerButton}
          >
            <IconSymbol name="magnifyingglass" size={24} color={theme.colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/settings')}
            style={styles.headerButton}
          >
            <IconSymbol name="gear" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
          Your Projects
        </Text>

        {projects.length === 0 && !showAddProject && (
          <View style={styles.emptyState}>
            <IconSymbol name="book.closed" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No projects yet. Create your first project to start writing!
            </Text>
          </View>
        )}

        {projects.map((project) => (
          <Pressable
            key={project.id}
            style={[styles.projectCard, { backgroundColor: theme.colors.card }]}
            onPress={() => handleSelectProject(project.id)}
            onLongPress={() => handleDeleteProject(project.id, project.name)}
          >
            <View style={styles.projectIcon}>
              <IconSymbol name="book.fill" size={28} color={theme.colors.primary} />
            </View>
            <View style={styles.projectInfo}>
              <Text style={[styles.projectName, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                {project.name}
              </Text>
              <Text style={[styles.projectDate, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
          </Pressable>
        ))}

        {showAddProject ? (
          <View style={[styles.addProjectForm, { backgroundColor: theme.colors.card }]}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  fontSize: baseFontSize,
                },
              ]}
              placeholder="Project name"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              value={projectName}
              onChangeText={setProjectName}
              autoFocus
              onSubmitEditing={handleAddProject}
            />
            <View style={styles.formButtons}>
              <Pressable
                style={[styles.formButton, { backgroundColor: theme.dark ? '#333' : '#f0f0f0' }]}
                onPress={() => {
                  setShowAddProject(false);
                  setProjectName('');
                }}
              >
                <Text style={[styles.formButtonText, { color: theme.colors.text, fontSize: baseFontSize }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.formButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleAddProject}
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
              setShowAddProject(true);
            }}
          >
            <IconSymbol name="plus" size={24} color="#fff" />
            <Text style={[styles.addButtonText, { fontSize: baseFontSize }]}>
              New Project
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
  title: {
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  subtitle: {
    fontWeight: '600',
    marginBottom: 16,
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
  projectCard: {
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
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDate: {
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
  addProjectForm: {
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
