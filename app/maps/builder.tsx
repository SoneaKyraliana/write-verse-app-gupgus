
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Text as SvgText, G, Polygon, Ellipse, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_SIZE = SCREEN_WIDTH - 40;

type BrushType = 'land' | 'water' | 'forest' | 'mountain' | 'desert' | 'snow' | 'swamp';
type MarkerType = 'house' | 'castle' | 'town' | 'windmill' | 'smith' | 'wooden-bridge' | 
  'stone-bridge' | 'mountain' | 'small-mountain' | 'lake' | 'river' | 'mountain-range' | 
  'crevice' | 'forest' | 'tree' | 'rock' | 'road' | 'tower';

interface DrawPath {
  id: string;
  type: BrushType;
  path: string;
  color: string;
}

interface MapMarker {
  id: string;
  type: MarkerType;
  x: number;
  y: number;
  name: string;
}

const BRUSH_COLORS: Record<BrushType, string> = {
  land: '#8B7355',
  water: '#4A90E2',
  forest: '#2D5016',
  mountain: '#6B6B6B',
  desert: '#EDC9AF',
  snow: '#F0F8FF',
  swamp: '#4A5D23',
};

const MARKER_ICONS: Record<MarkerType, { icon: string; color: string }> = {
  house: { icon: 'house.fill', color: '#8B4513' },
  castle: { icon: 'building.2.fill', color: '#696969' },
  town: { icon: 'building.2.crop.circle.fill', color: '#A0522D' },
  windmill: { icon: 'wind', color: '#8B7355' },
  smith: { icon: 'hammer.fill', color: '#CD853F' },
  'wooden-bridge': { icon: 'arrow.left.arrow.right', color: '#8B4513' },
  'stone-bridge': { icon: 'arrow.left.arrow.right', color: '#696969' },
  mountain: { icon: 'mountain.2.fill', color: '#4A4A4A' },
  'small-mountain': { icon: 'mountain.2', color: '#6B6B6B' },
  lake: { icon: 'drop.fill', color: '#4A90E2' },
  river: { icon: 'water.waves', color: '#5DADE2' },
  'mountain-range': { icon: 'mountain.2.fill', color: '#2F4F4F' },
  crevice: { icon: 'line.diagonal', color: '#1C1C1C' },
  forest: { icon: 'tree.fill', color: '#228B22' },
  tree: { icon: 'tree', color: '#32CD32' },
  rock: { icon: 'circle.fill', color: '#808080' },
  road: { icon: 'road.lanes', color: '#A9A9A9' },
  tower: { icon: 'antenna.radiowaves.left.and.right', color: '#696969' },
};

export default function MapBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mapId } = useLocalSearchParams();
  const { currentProject, getMap, updateMapData } = useProjects();
  const { getFontSizeValue } = useSettings();

  const [selectedBrush, setSelectedBrush] = useState<BrushType>('land');
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showBrushMenu, setShowBrushMenu] = useState(false);
  const [showMarkerMenu, setShowMarkerMenu] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerName, setMarkerName] = useState('');
  const [mode, setMode] = useState<'draw' | 'marker'>('draw');

  const baseFontSize = getFontSizeValue();

  React.useEffect(() => {
    if (mapId && currentProject) {
      const map = getMap(mapId as string);
      if (map) {
        setPaths(map.paths || []);
        setMarkers(map.markers || []);
      }
    }
  }, [mapId, currentProject]);

  React.useEffect(() => {
    if (mapId) {
      updateMapData(mapId as string, paths, markers);
    }
  }, [paths, markers]);

  const handleTouchStart = (event: any) => {
    if (mode === 'marker' && selectedMarker) {
      const { locationX, locationY } = event.nativeEvent;
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        type: selectedMarker,
        x: locationX,
        y: locationY,
        name: '',
      };
      setMarkers([...markers, newMarker]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (mode === 'draw') {
      const { locationX, locationY } = event.nativeEvent;
      setIsDrawing(true);
      setCurrentPath(`M ${locationX} ${locationY}`);
    }
  };

  const handleTouchMove = (event: any) => {
    if (isDrawing && mode === 'draw') {
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
    }
  };

  const handleTouchEnd = () => {
    if (isDrawing && currentPath && mode === 'draw') {
      const newPath: DrawPath = {
        id: Date.now().toString(),
        type: selectedBrush,
        path: currentPath,
        color: BRUSH_COLORS[selectedBrush],
      };
      setPaths([...paths, newPath]);
      setCurrentPath('');
      setIsDrawing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMarkerPress = (markerId: string) => {
    setSelectedMarkerId(markerId);
    const marker = markers.find(m => m.id === markerId);
    if (marker) {
      setMarkerName(marker.name);
      setShowNameModal(true);
    }
  };

  const handleSaveMarkerName = () => {
    if (selectedMarkerId) {
      setMarkers(markers.map(m => 
        m.id === selectedMarkerId ? { ...m, name: markerName } : m
      ));
      setShowNameModal(false);
      setSelectedMarkerId(null);
      setMarkerName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteMarker = () => {
    if (selectedMarkerId) {
      setMarkers(markers.filter(m => m.id !== selectedMarkerId));
      setShowNameModal(false);
      setSelectedMarkerId(null);
      setMarkerName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearMap = () => {
    Alert.alert(
      'Clear Map',
      'Are you sure you want to clear all drawings and markers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            setMarkers([]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleUndo = () => {
    if (mode === 'draw' && paths.length > 0) {
      setPaths(paths.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (mode === 'marker' && markers.length > 0) {
      setMarkers(markers.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: theme.colors.text, fontSize: baseFontSize + 4 }]}>
          Map Builder
        </Text>
        <Pressable onPress={handleClearMap} style={styles.clearButton}>
          <IconSymbol name="trash" size={20} color="#FF3B30" />
        </Pressable>
      </View>

      <View style={styles.modeSelector}>
        <Pressable
          style={[
            styles.modeButton,
            { backgroundColor: mode === 'draw' ? theme.colors.primary : theme.colors.card },
          ]}
          onPress={() => {
            setMode('draw');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol 
            name="paintbrush.fill" 
            size={20} 
            color={mode === 'draw' ? '#fff' : theme.colors.text} 
          />
          <Text style={[
            styles.modeText,
            { color: mode === 'draw' ? '#fff' : theme.colors.text, fontSize: baseFontSize - 2 }
          ]}>
            Draw
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.modeButton,
            { backgroundColor: mode === 'marker' ? theme.colors.primary : theme.colors.card },
          ]}
          onPress={() => {
            setMode('marker');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol 
            name="mappin.and.ellipse" 
            size={20} 
            color={mode === 'marker' ? '#fff' : theme.colors.text} 
          />
          <Text style={[
            styles.modeText,
            { color: mode === 'marker' ? '#fff' : theme.colors.text, fontSize: baseFontSize - 2 }
          ]}>
            Markers
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapContainer}>
        <View
          style={[styles.canvas, { backgroundColor: '#F5E6D3' }]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
        >
          <Svg width={MAP_SIZE} height={MAP_SIZE}>
            {paths.map((path) => (
              <Path
                key={path.id}
                d={path.path}
                stroke={path.color}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={BRUSH_COLORS[selectedBrush]}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            {markers.map((marker) => (
              <G key={marker.id}>
                <Circle
                  cx={marker.x}
                  cy={marker.y}
                  r={16}
                  fill={MARKER_ICONS[marker.type].color}
                  opacity={0.8}
                  onPress={() => handleMarkerPress(marker.id)}
                />
                {marker.name && (
                  <SvgText
                    x={marker.x}
                    y={marker.y + 30}
                    fontSize={10}
                    fill={theme.colors.text}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {marker.name}
                  </SvgText>
                )}
              </G>
            ))}
          </Svg>
        </View>
      </View>

      {mode === 'draw' && (
        <View style={[styles.toolbar, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brushContainer}>
            {(Object.keys(BRUSH_COLORS) as BrushType[]).map((brush) => (
              <Pressable
                key={brush}
                style={[
                  styles.brushButton,
                  { 
                    backgroundColor: BRUSH_COLORS[brush],
                    borderWidth: selectedBrush === brush ? 3 : 0,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => {
                  setSelectedBrush(brush);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.brushLabel, { fontSize: baseFontSize - 4 }]}>
                  {brush.charAt(0).toUpperCase() + brush.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={handleUndo} style={styles.undoButton}>
            <IconSymbol name="arrow.uturn.backward" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
      )}

      {mode === 'marker' && (
        <View style={[styles.toolbar, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.markerContainer}>
            {(Object.keys(MARKER_ICONS) as MarkerType[]).map((marker) => (
              <Pressable
                key={marker}
                style={[
                  styles.markerButton,
                  { 
                    backgroundColor: theme.colors.background,
                    borderWidth: selectedMarker === marker ? 3 : 1,
                    borderColor: selectedMarker === marker ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedMarker(marker);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <IconSymbol 
                  name={MARKER_ICONS[marker].icon as any} 
                  size={20} 
                  color={MARKER_ICONS[marker].color} 
                />
                <Text style={[styles.markerLabel, { color: theme.colors.text, fontSize: baseFontSize - 4 }]}>
                  {marker.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={handleUndo} style={styles.undoButton}>
            <IconSymbol name="arrow.uturn.backward" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowNameModal(false)}
        >
          <Pressable 
            style={[styles.modalContent, { backgroundColor: theme.colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
              Name Location
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                color: theme.colors.text, 
                borderColor: theme.colors.border,
                fontSize: baseFontSize,
              }]}
              placeholder="Enter location name..."
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              value={markerName}
              onChangeText={setMarkerName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleDeleteMarker}
              >
                <Text style={[styles.modalButtonText, { fontSize: baseFontSize }]}>Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveMarkerName}
              >
                <Text style={[styles.modalButtonText, { fontSize: baseFontSize }]}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  clearButton: {
    padding: 8,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modeText: {
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  canvas: {
    width: MAP_SIZE,
    height: MAP_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  brushContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  brushButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  brushLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  markerContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  markerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    gap: 4,
  },
  markerLabel: {
    fontWeight: '500',
    textAlign: 'center',
  },
  undoButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
