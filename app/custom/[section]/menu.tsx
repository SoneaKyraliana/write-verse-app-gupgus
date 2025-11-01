
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

export default function CustomSectionMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { section } = useLocalSearchParams();
  const { currentProject, addCustomCategory, deleteCustomCategory } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const baseFontSize = getFontSizeValue();

  const sectionKey = section as 'characters' | 'settings' | 'miscellaneous';

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
        return 'person.2.fill';
      case 'settings':
        return 'map.fill';
      case 'miscellaneous':
        return 'folder.fill';
      default:
        return 'folder.fill';
    }
  };

  const getSectionColor = () => {
    switch (section) {
      case 'characters':
        return '#34C759';
      case 'settings':
        return '#FF9500';
      case 'miscellaneous':
        return '#AF52DE';
      default:
        return '#007AFF';
    }
  };

  const handleAddCategory = () => {
    if (categoryName.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      addCustomCategory(sectionKey, categoryName.trim());
      setCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? All notes in this category will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteCustomCategory(sectionKey, categoryId);
          },
        },
      ]
    );
  };

  if (!currentProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            {getSectionTitle()}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text, fontSize: baseFontSize }]}>
            No project selected. Please go back and select a project.
          </Text>
        </View>
      </View>
    );
  }

  const categories = currentProject[sectionKey] || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <IconSymbol name={getSectionIcon() as any} size={28} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            {getSectionTitle()}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
          Categories
        </Text>

        {categories.length === 0 && !showAddCategory && (
          <View style={styles.emptyState}>
            <IconSymbol name={getSectionIcon() as any} size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No categories yet. Create your first category to start organizing!
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
            <View style={[styles.categoryIcon, { backgroundColor: getSectionColor() + '20' }]}>
              <IconSymbol name={getSectionIcon() as any} size={28} color={getSectionColor()} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryCount, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
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
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    opacity: 0.6,
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
