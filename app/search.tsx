
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { searchNotes } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof searchNotes>>([]);

  const baseFontSize = getFontSizeValue();

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const searchResults = searchNotes(text);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === highlight.toLowerCase()) {
        return (
          <Text key={index} style={[styles.highlight, { backgroundColor: theme.colors.primary + '40' }]}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <View style={[styles.searchContainer, { backgroundColor: theme.dark ? '#1c1c1e' : '#f0f0f0' }]}>
          <IconSymbol name="magnifyingglass" size={20} color={theme.dark ? '#666' : '#999'} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.colors.text,
                fontSize: baseFontSize,
              },
            ]}
            placeholder="Search notes..."
            placeholderTextColor={theme.dark ? '#666' : '#999'}
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={theme.dark ? '#666' : '#999'} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {query.trim() === '' ? (
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              Search for character names or any text across all your notes
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={64} color={theme.dark ? '#666' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              No results found for &quot;{query}&quot;
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </Text>
            {results.map((result, index) => (
              <Pressable
                key={`${result.projectId}-${result.section}-${result.category}-${result.noteId}-${index}`}
                style={[styles.resultCard, { backgroundColor: theme.colors.card }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log('Navigate to note:', result);
                }}
              >
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultProject, { color: theme.colors.primary, fontSize: baseFontSize - 2 }]}>
                    {result.projectName}
                  </Text>
                  <Text style={[styles.resultLocation, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
                    {result.section} → {result.category}
                  </Text>
                </View>
                <Text style={[styles.resultPreview, { color: theme.colors.text, fontSize: baseFontSize }]}>
                  {highlightText(result.preview, query)}
                </Text>
              </Pressable>
            ))}
          </>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
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
  resultCount: {
    marginBottom: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    marginBottom: 8,
  },
  resultProject: {
    fontWeight: '600',
    marginBottom: 4,
  },
  resultLocation: {
  },
  resultPreview: {
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '600',
  },
});
