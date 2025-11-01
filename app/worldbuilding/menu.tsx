
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

const WORLDBUILDING_CATEGORIES = [
  { key: 'religion', title: 'Religion', icon: 'sparkles', color: '#FF6B6B' },
  { key: 'culture', title: 'Culture', icon: 'theatermasks.fill', color: '#4ECDC4' },
  { key: 'dailyLife', title: 'Daily Life', icon: 'house.fill', color: '#45B7D1' },
  { key: 'socialStructure', title: 'Social Structure', icon: 'person.3.fill', color: '#96CEB4' },
  { key: 'politicalStructure', title: 'Political Structure', icon: 'building.columns.fill', color: '#FFEAA7' },
  { key: 'mythology', title: 'Mythology', icon: 'moon.stars.fill', color: '#DFE6E9' },
  { key: 'history', title: 'History', icon: 'book.fill', color: '#74B9FF' },
  { key: 'geography', title: 'Geography', icon: 'globe', color: '#A29BFE' },
  { key: 'environment', title: 'Environment', icon: 'leaf.fill', color: '#55EFC4' },
];

export default function WorldbuildingMenuScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentProject } = useProjects();
  const { getFontSizeValue } = useSettings();

  const baseFontSize = getFontSizeValue();

  if (!currentProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            Worldbuilding
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <View style={styles.headerContent}>
          <IconSymbol name="globe" size={28} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
            Worldbuilding
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
          Categories
        </Text>

        {WORLDBUILDING_CATEGORIES.map((category) => {
          const notes = currentProject.worldbuilding[category.key as keyof typeof currentProject.worldbuilding] || [];
          return (
            <Pressable
              key={category.key}
              style={[styles.categoryCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/worldbuilding/${category.key}` as any);
              }}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <IconSymbol name={category.icon as any} size={28} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                  {category.title}
                </Text>
                <Text style={[styles.categoryCount, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
            </Pressable>
          );
        })}
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
});
