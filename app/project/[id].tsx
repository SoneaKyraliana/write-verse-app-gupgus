
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function ProjectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { currentProject } = useProjects();
  const { getFontSizeValue } = useSettings();

  const baseFontSize = getFontSizeValue();

  const sections = [
    {
      title: 'Worldbuilding',
      icon: 'globe',
      color: '#007AFF',
      route: '/worldbuilding/menu',
    },
    {
      title: 'Characters',
      icon: 'person.2.fill',
      color: '#34C759',
      route: `/custom/characters/menu`,
    },
    {
      title: 'Settings',
      icon: 'map.fill',
      color: '#FF9500',
      route: `/custom/settings/menu`,
    },
    {
      title: 'Miscellaneous',
      icon: 'folder.fill',
      color: '#AF52DE',
      route: `/custom/miscellaneous/menu`,
    },
  ];

  if (!currentProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Project not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 8 }]}>
          {currentProject.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.subtitle, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
          Writing Aspects
        </Text>

        {sections.map((section) => (
          <Pressable
            key={section.title}
            style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(section.route as any);
            }}
          >
            <View style={[styles.sectionIcon, { backgroundColor: section.color + '20' }]}>
              <IconSymbol name={section.icon as any} size={32} color={section.color} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                {section.title}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#666' : '#ccc'} />
          </Pressable>
        ))}
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
  subtitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionCard: {
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
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
