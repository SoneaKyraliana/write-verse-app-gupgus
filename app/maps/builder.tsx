
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
import { IconSymbol } from '@/components/IconSymbol';
import { useProjects } from '@/contexts/ProjectContext';
import { useTheme } from '@react-navigation/native';
import Svg, { Path, Circle, Rect, Text as SvgText, G, Polygon, Ellipse, Line, Defs, ClipPath } from 'react-native-svg';
import React, { useState, useRef, useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring } from 'react-native-reanimated';
import { useSettings } from '@/contexts/SettingsContext';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';

type BrushType = 'grass' | 'water' | 'mountain' | 'forest' | 'desert' | 'snow';
type MarkerType = 'city' | 'village' | 'castle' | 'dungeon' | 'landmark' | 'road';

interface DrawPath {
  id: string;
  type: BrushType;
  path: string;
  color: string;
  strokeWidth: number;
}

interface MapMarker {
  id: string;
  type: MarkerType;
  x: number;
  y: number;
  name: string;
  nameX?: number;
  nameY?: number;
  nameFontSize?: number;
}

const MAP_SIZE = 800;

const BRUSH_COLORS: Record<BrushType, string> = {
  grass: '#7CB342',
  water: '#42A5F5',
  mountain: '#8D6E63',
  forest: '#2E7D32',
  desert: '#FFB74D',
  snow: '#E3F2FD',
};

function MarkerIcon({ type, x, y }: { type: MarkerType; x: number; y: number }) {
  const size = 40;
  const halfSize = size / 2;

  switch (type) {
    case 'city':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Rect x="5" y="15" width="10" height="20" fill="#424242" stroke="#212121" strokeWidth="1" />
          <Rect x="18" y="10" width="12" height="25" fill="#616161" stroke="#212121" strokeWidth="1" />
          <Rect x="25" y="5" width="10" height="30" fill="#757575" stroke="#212121" strokeWidth="1" />
          <Rect x="7" y="18" width="2" height="3" fill="#FFD54F" />
          <Rect x="11" y="18" width="2" height="3" fill="#FFD54F" />
          <Rect x="7" y="24" width="2" height="3" fill="#FFD54F" />
          <Rect x="11" y="24" width="2" height="3" fill="#FFD54F" />
          <Rect x="20" y="13" width="2" height="3" fill="#FFD54F" />
          <Rect x="24" y="13" width="2" height="3" fill="#FFD54F" />
          <Rect x="20" y="19" width="2" height="3" fill="#FFD54F" />
          <Rect x="24" y="19" width="2" height="3" fill="#FFD54F" />
          <Rect x="27" y="8" width="2" height="3" fill="#FFD54F" />
          <Rect x="31" y="8" width="2" height="3" fill="#FFD54F" />
          <Rect x="27" y="14" width="2" height="3" fill="#FFD54F" />
          <Rect x="31" y="14" width="2" height="3" fill="#FFD54F" />
        </G>
      );
    case 'village':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Polygon points="20,8 10,18 30,18" fill="#8D6E63" stroke="#5D4037" strokeWidth="1.5" />
          <Rect x="14" y="18" width="12" height="14" fill="#A1887F" stroke="#5D4037" strokeWidth="1" />
          <Rect x="18" y="24" width="4" height="8" fill="#6D4C41" />
          <Rect x="16" y="20" width="3" height="3" fill="#81C784" />
          <Rect x="21" y="20" width="3" height="3" fill="#81C784" />
        </G>
      );
    case 'castle':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Rect x="8" y="12" width="24" height="20" fill="#78909C" stroke="#37474F" strokeWidth="1.5" />
          <Rect x="6" y="8" width="6" height="8" fill="#90A4AE" stroke="#37474F" strokeWidth="1" />
          <Rect x="28" y="8" width="6" height="8" fill="#90A4AE" stroke="#37474F" strokeWidth="1" />
          <Rect x="6" y="6" width="2" height="3" fill="#37474F" />
          <Rect x="10" y="6" width="2" height="3" fill="#37474F" />
          <Rect x="28" y="6" width="2" height="3" fill="#37474F" />
          <Rect x="32" y="6" width="2" height="3" fill="#37474F" />
          <Rect x="17" y="22" width="6" height="10" fill="#455A64" />
          <Rect x="14" y="16" width="3" height="4" fill="#263238" />
          <Rect x="23" y="16" width="3" height="4" fill="#263238" />
        </G>
      );
    case 'dungeon':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Ellipse cx="20" cy="20" rx="14" ry="10" fill="#424242" stroke="#212121" strokeWidth="1.5" />
          <Rect x="14" y="15" width="12" height="15" fill="#212121" stroke="#000" strokeWidth="1" />
          <Path d="M 17 20 Q 20 23 23 20" fill="none" stroke="#616161" strokeWidth="2" />
          <Circle cx="18" cy="18" r="1.5" fill="#B71C1C" />
          <Circle cx="22" cy="18" r="1.5" fill="#B71C1C" />
        </G>
      );
    case 'landmark':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Polygon points="20,5 15,15 25,15" fill="#FFB74D" stroke="#E65100" strokeWidth="1.5" />
          <Rect x="18" y="15" width="4" height="17" fill="#8D6E63" stroke="#5D4037" strokeWidth="1" />
          <Circle cx="20" cy="8" r="3" fill="#FDD835" stroke="#F57F17" strokeWidth="1" />
        </G>
      );
    case 'road':
      return (
        <G x={x - halfSize} y={y - halfSize}>
          <Path
            d="M 5 20 Q 15 15 25 20 Q 30 22 35 20"
            fill="none"
            stroke="#8D6E63"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Path
            d="M 5 20 Q 15 15 25 20 Q 30 22 35 20"
            fill="none"
            stroke="#A1887F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="3,2"
          />
        </G>
      );
    default:
      return null;
  }
}

export default function MapBuilderScreen() {
  const router = useRouter();
  const { mapId, source } = useLocalSearchParams();
  const { currentProject, getMap, updateMapData } = useProjects();
  const theme = useTheme();
  const { getFontSizeValue } = useSettings();

  const [selectedBrush, setSelectedBrush] = useState<BrushType>('grass');
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showMarkerNameInput, setShowMarkerNameInput] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerName, setMarkerName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(20);
  const [isDraggingName, setIsDraggingName] = useState(false);
  const [draggedNameId, setDraggedNameId] = useState<string | null>(null);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const baseFontSize = getFontSizeValue();

  useEffect(() => {
    if (mapId && currentProject) {
      const map = getMap(mapId as string);
      if (map) {
        console.log('Loading map:', map.name, 'Paths:', map.paths?.length, 'Markers:', map.markers?.length);
        setPaths(map.paths || []);
        setMarkers(map.markers || []);
        setIsLoaded(true);
      } else {
        console.log('Map not found:', mapId);
        setIsLoaded(true);
      }
    }
  }, [mapId, currentProject]);

  useEffect(() => {
    if (isLoaded && mapId) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Saving map data:', paths.length, 'paths,', markers.length, 'markers');
        updateMapData(mapId as string, paths, markers);
      }, 500);
    }
  }, [paths, markers, isLoaded]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = Math.max(0.5, Math.min(3, event.scale));
    },
  });

  const handleZoomIn = () => {
    scale.value = withSpring(Math.min(3, scale.value + 0.2));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleZoomOut = () => {
    scale.value = withSpring(Math.max(0.5, scale.value - 0.2));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResetZoom = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTouchStart = (event: any) => {
    if (isDraggingName) return;

    const { locationX, locationY } = event.nativeEvent;
    const adjustedX = (locationX - translateX.value) / scale.value;
    const adjustedY = (locationY - translateY.value) / scale.value;

    if (selectedMarker) {
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        type: selectedMarker,
        x: adjustedX,
        y: adjustedY,
        name: '',
        nameX: adjustedX,
        nameY: adjustedY + 30,
        nameFontSize: 14,
      };
      setMarkers([...markers, newMarker]);
      setSelectedMarkerId(newMarker.id);
      setShowMarkerNameInput(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      setIsDrawing(true);
      setCurrentPath(`M ${adjustedX} ${adjustedY}`);
    }
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing || selectedMarker || isDraggingName) return;

    const { locationX, locationY } = event.nativeEvent;
    const adjustedX = (locationX - translateX.value) / scale.value;
    const adjustedY = (locationY - translateY.value) / scale.value;

    setCurrentPath((prev) => `${prev} L ${adjustedX} ${adjustedY}`);
  };

  const handleTouchEnd = () => {
    if (isDrawing && currentPath) {
      const newPath: DrawPath = {
        id: Date.now().toString(),
        type: selectedBrush,
        path: currentPath,
        color: BRUSH_COLORS[selectedBrush],
        strokeWidth: strokeWidth,
      };
      setPaths([...paths, newPath]);
      setCurrentPath('');
      setIsDrawing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleMarkerPress = (markerId: string) => {
    const marker = markers.find((m) => m.id === markerId);
    if (marker) {
      setSelectedMarkerId(markerId);
      setMarkerName(marker.name);
      setShowMarkerNameInput(true);
    }
  };

  const handleSaveMarkerName = () => {
    if (selectedMarkerId) {
      setMarkers(
        markers.map((m) =>
          m.id === selectedMarkerId ? { ...m, name: markerName } : m
        )
      );
      setShowMarkerNameInput(false);
      setMarkerName('');
      setSelectedMarkerId(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDeleteMarker = () => {
    if (selectedMarkerId) {
      Alert.alert(
        'Delete Marker',
        'Are you sure you want to delete this marker?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setMarkers(markers.filter((m) => m.id !== selectedMarkerId));
              setShowMarkerNameInput(false);
              setMarkerName('');
              setSelectedMarkerId(null);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    }
  };

  const handleClearMap = () => {
    Alert.alert(
      'Clear Map',
      'Are you sure you want to clear the entire map?',
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
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNameLongPress = (markerId: string) => {
    setIsDraggingName(true);
    setDraggedNameId(markerId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleNameDrag = (event: any, markerId: string) => {
    if (!isDraggingName || draggedNameId !== markerId) return;

    const { locationX, locationY } = event.nativeEvent;
    const adjustedX = (locationX - translateX.value) / scale.value;
    const adjustedY = (locationY - translateY.value) / scale.value;

    setMarkers(
      markers.map((m) =>
        m.id === markerId
          ? { ...m, nameX: adjustedX, nameY: adjustedY }
          : m
      )
    );
  };

  const handleNameDragEnd = () => {
    setIsDraggingName(false);
    setDraggedNameId(null);
  };

  const handleNameSizeChange = (markerId: string, delta: number) => {
    setMarkers(
      markers.map((m) =>
        m.id === markerId
          ? { ...m, nameFontSize: Math.max(10, Math.min(24, (m.nameFontSize || 14) + delta)) }
          : m
      )
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

        <View style={styles.toolsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brushes}>
            {(Object.keys(BRUSH_COLORS) as BrushType[]).map((brush) => (
              <Pressable
                key={brush}
                style={[
                  styles.brushButton,
                  { backgroundColor: BRUSH_COLORS[brush] },
                  selectedBrush === brush && !selectedMarker && styles.selectedBrush,
                ]}
                onPress={() => {
                  setSelectedBrush(brush);
                  setSelectedMarker(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.brushLabel}>{brush}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.strokeWidthContainer}>
            <Pressable
              style={[styles.strokeButton, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                setStrokeWidth(Math.max(5, strokeWidth - 5));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.strokeButtonText, { color: theme.colors.text }]}>-</Text>
            </Pressable>
            <Text style={[styles.strokeWidthText, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
              {strokeWidth}
            </Text>
            <Pressable
              style={[styles.strokeButton, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                setStrokeWidth(Math.min(50, strokeWidth + 5));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.strokeButtonText, { color: theme.colors.text }]}>+</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.markers}>
            {(['city', 'village', 'castle', 'dungeon', 'landmark', 'road'] as MarkerType[]).map((marker) => (
              <Pressable
                key={marker}
                style={[
                  styles.markerButton,
                  { backgroundColor: theme.colors.card },
                  selectedMarker === marker && styles.selectedMarker,
                ]}
                onPress={() => {
                  setSelectedMarker(marker);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Svg width={40} height={40}>
                  <MarkerIcon type={marker} x={20} y={20} />
                </Svg>
                <Text style={[styles.markerLabel, { color: theme.colors.text, fontSize: baseFontSize - 4 }]}>
                  {marker}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.zoomControls}>
          <Pressable style={[styles.zoomButton, { backgroundColor: theme.colors.card }]} onPress={handleZoomIn}>
            <IconSymbol name="plus" size={20} color={theme.colors.text} />
          </Pressable>
          <Pressable style={[styles.zoomButton, { backgroundColor: theme.colors.card }]} onPress={handleResetZoom}>
            <IconSymbol name="arrow.counterclockwise" size={20} color={theme.colors.text} />
          </Pressable>
          <Pressable style={[styles.zoomButton, { backgroundColor: theme.colors.card }]} onPress={handleZoomOut}>
            <IconSymbol name="minus" size={20} color={theme.colors.text} />
          </Pressable>
          <Pressable style={[styles.zoomButton, { backgroundColor: theme.colors.card }]} onPress={handleUndo}>
            <IconSymbol name="arrow.uturn.backward" size={20} color={theme.colors.text} />
          </Pressable>
        </View>

        <PinchGestureHandler onGestureEvent={pinchHandler}>
          <Animated.View style={[styles.canvasContainer, animatedStyle]}>
            <View
              style={styles.canvas}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Svg width={MAP_SIZE} height={MAP_SIZE} style={styles.svg}>
                <Rect width={MAP_SIZE} height={MAP_SIZE} fill="#F5F5DC" />

                {paths.map((path) => (
                  <Path
                    key={path.id}
                    d={path.path}
                    stroke={path.color}
                    strokeWidth={path.strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {currentPath && (
                  <Path
                    d={currentPath}
                    stroke={BRUSH_COLORS[selectedBrush]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.7}
                  />
                )}

                {markers.map((marker) => (
                  <G key={marker.id}>
                    <G onPress={() => handleMarkerPress(marker.id)}>
                      <MarkerIcon type={marker.type} x={marker.x} y={marker.y} />
                    </G>
                    {marker.name && (
                      <SvgText
                        x={marker.nameX || marker.x}
                        y={marker.nameY || marker.y + 30}
                        fontSize={marker.nameFontSize || 14}
                        fontWeight="bold"
                        fill="#000"
                        textAnchor="middle"
                        onLongPress={() => handleNameLongPress(marker.id)}
                        onPressIn={(e) => handleNameDrag(e, marker.id)}
                        onPressOut={handleNameDragEnd}
                      >
                        {marker.name}
                      </SvgText>
                    )}
                  </G>
                ))}
              </Svg>
            </View>
          </Animated.View>
        </PinchGestureHandler>

        <Modal visible={showMarkerNameInput} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
                Marker Name
              </Text>
              <TextInput
                style={[styles.modalInput, { color: theme.colors.text, borderColor: theme.colors.border, fontSize: baseFontSize }]}
                placeholder="Enter marker name..."
                placeholderTextColor={theme.dark ? '#666' : '#999'}
                value={markerName}
                onChangeText={setMarkerName}
                autoFocus
              />
              {selectedMarkerId && markers.find((m) => m.id === selectedMarkerId)?.name && (
                <View style={styles.nameSizeControls}>
                  <Text style={[styles.nameSizeLabel, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
                    Text Size:
                  </Text>
                  <Pressable
                    style={[styles.nameSizeButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => handleNameSizeChange(selectedMarkerId, -2)}
                  >
                    <Text style={[styles.nameSizeButtonText, { color: theme.colors.text }]}>A-</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.nameSizeButton, { backgroundColor: theme.colors.background }]}
                    onPress={() => handleNameSizeChange(selectedMarkerId, 2)}
                  >
                    <Text style={[styles.nameSizeButtonText, { color: theme.colors.text }]}>A+</Text>
                  </Pressable>
                </View>
              )}
              <View style={styles.modalButtons}>
                {selectedMarkerId && markers.find((m) => m.id === selectedMarkerId)?.name && (
                  <Pressable
                    style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                    onPress={handleDeleteMarker}
                  >
                    <Text style={[styles.modalButtonText, { fontSize: baseFontSize }]}>Delete</Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.modalButton, { backgroundColor: theme.colors.border }]}
                  onPress={() => {
                    setShowMarkerNameInput(false);
                    setMarkerName('');
                    setSelectedMarkerId(null);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.text, fontSize: baseFontSize }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSaveMarkerName}
                >
                  <Text style={[styles.modalButtonText, { fontSize: baseFontSize }]}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
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
  title: {
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  toolsContainer: {
    padding: 12,
    gap: 12,
  },
  brushes: {
    flexDirection: 'row',
  },
  brushButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBrush: {
    borderColor: '#000',
  },
  brushLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  strokeWidthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  strokeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  strokeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  strokeWidthText: {
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  markers: {
    flexDirection: 'row',
  },
  markerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMarker: {
    borderColor: '#007AFF',
  },
  markerLabel: {
    marginTop: 4,
    textTransform: 'capitalize',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: 120,
    gap: 8,
    zIndex: 10,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: MAP_SIZE,
    height: MAP_SIZE,
  },
  svg: {
    backgroundColor: '#F5F5DC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  nameSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameSizeLabel: {
    fontWeight: '600',
  },
  nameSizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nameSizeButtonText: {
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
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
