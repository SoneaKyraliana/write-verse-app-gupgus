
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

export default function MapsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { currentProject, getMaps, addMap, deleteMap } = useProjects();
  const { getFontSizeValue } = useSettings();
  const [showInput, setShowInput] = useState(false);
  const [mapName, setMapName] = useState('');

  const baseFontSize = getFontSizeValue();

  if (!currentProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          No project selected
        </Text>
      </View>
    );
  }

  const maps = getMaps();

  const handleAddMap = () => {
    if (mapName.trim()) {
      const mapId = addMap(mapName.trim());
      setMapName('');
      setShowInput(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/maps/builder?mapId=${mapId}` as any);
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
            deleteMap(mapId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

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
          Maps
        </Text>
        <Pressable
          onPress={() => setShowInput(!showInput)}
          style={styles.addButton}
        >
          <IconSymbol name="plus" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>

      {showInput && (
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, fontSize: baseFontSize }]}
            placeholder="Map name..."
            placeholderTextColor={theme.dark ? '#666' : '#999'}
            value={mapName}
            onChangeText={setMapName}
            onSubmitEditing={handleAddMap}
            autoFocus
          />
          <Pressable
            onPress={handleAddMap}
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          >
            <IconSymbol name="checkmark" size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {maps.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="map" size={64} color={theme.dark ? '#444' : '#ccc'} />
            <Text style={[styles.emptyText, { color: theme.dark ? '#666' : '#999', fontSize: baseFontSize }]}>
              No maps yet. Create your first map!
            </Text>
          </View>
        ) : (
          maps.map((map) => (
            <Pressable
              key={map.id}
              style={[styles.mapCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/maps/builder?mapId=${map.id}` as any);
              }}
            >
              <View style={styles.mapInfo}>
                <IconSymbol name="map.fill" size={24} color={theme.colors.primary} />
                <Text style={[styles.mapName, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                  {map.name}
                </Text>
              </View>
              <View style={styles.mapActions}>
                <Text style={[styles.markerCount, { color: theme.dark ? '#666' : '#999', fontSize: baseFontSize - 2 }]}>
                  {map.markers.length} markers
                </Text>
                <Pressable
                  onPress={() => handleDeleteMap(map.id, map.name)}
                  style={styles.deleteButton}
                >
                  <IconSymbol name="trash" size={20} color="#FF3B30" />
                </Pressable>
              </View>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mapName: {
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  mapActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerCount: {
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
  },
});
