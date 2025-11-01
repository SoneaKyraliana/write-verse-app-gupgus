
import React, { useState, useRef, useEffect } from 'react';
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
import { useProjects, WorldbuildingWithMaps } from '@/contexts/ProjectContext';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect, Text as SvgText, G, Polygon, Ellipse, Line, Defs } from 'react-native-svg';

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

// Fine ink marker icon component
const MarkerIcon = ({ type, x, y }: { type: MarkerType; x: number; y: number }) => {
  const inkColor = '#2C1810';
  const scale = 0.8;
  
  switch (type) {
    case 'house':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M0,-12 L-10,0 L-8,0 L-8,10 L8,10 L8,0 L10,0 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-3" y="2" width="6" height="8" fill="none" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    case 'castle':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Rect x="-12" y="-8" width="24" height="18" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-14" y="-12" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-4" y="-12" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="6" y="-12" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-5,10 L-5,2 L5,2 L5,10" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'town':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Rect x="-10" y="-6" width="8" height="12" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="2" y="-4" width="8" height="10" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-4" y="-10" width="8" height="16" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'windmill':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-4,10 L-2,-8 L2,-8 L4,10 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="0" y1="-8" x2="0" y2="-14" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M0,-14 L-8,-10 M0,-14 L8,-10 M0,-14 L-6,-18 M0,-14 L6,-18" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'smith':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Rect x="-8" y="-6" width="16" height="14" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-6,-2 L-2,-6 L2,-6 L6,-2" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Circle cx="0" cy="2" r="3" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'wooden-bridge':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-12,0 L12,0" stroke={inkColor} strokeWidth="2" />
          <Line x1="-10" y1="-4" x2="-10" y2="4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-5" y1="-4" x2="-5" y2="4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="0" y1="-4" x2="0" y2="4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="5" y1="-4" x2="5" y2="4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="10" y1="-4" x2="10" y2="4" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'stone-bridge':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-12,4 Q-12,-4 -6,-6 Q0,-8 6,-6 Q12,-4 12,4" fill="none" stroke={inkColor} strokeWidth="2" />
          <Path d="M-8,4 L-8,-2 M0,4 L0,-4 M8,4 L8,-2" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'mountain':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-12,8 L-4,-8 L0,-4 L4,-10 L12,8 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-4,-8 L-6,-2 M4,-10 L2,-4" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    case 'small-mountain':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale * 0.7})`}>
          <Path d="M-10,6 L0,-8 L10,6 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M0,-8 L-2,-2" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    case 'lake':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Ellipse cx="0" cy="0" rx="12" ry="8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-6,-2 Q-4,-4 -2,-2 Q0,0 2,-2 Q4,-4 6,-2" stroke={inkColor} strokeWidth="1" opacity="0.6" />
        </G>
      );
    case 'river':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-12,-8 Q-8,-4 -4,-6 Q0,-8 4,-4 Q8,-2 12,0" fill="none" stroke={inkColor} strokeWidth="2" />
          <Path d="M-12,-4 Q-8,0 -4,-2 Q0,-4 4,0 Q8,2 12,4" fill="none" stroke={inkColor} strokeWidth="2" />
        </G>
      );
    case 'mountain-range':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-14,8 L-8,-6 L-4,-2 L0,-8 L4,-4 L8,-10 L14,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'crevice':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-10,-8 L-8,8 M-6,-8 L-4,8 M-2,-8 L0,8 M2,-8 L4,8 M6,-8 L8,8" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'forest':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-8,8 L-8,2 L-10,-2 L-8,-2 L-8,-6 L-6,-2 L-4,-2 L-6,2 L-6,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M0,8 L0,0 L-2,-4 L0,-4 L0,-8 L2,-4 L4,-4 L2,0 L2,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M6,8 L6,2 L4,-2 L6,-2 L6,-6 L8,-2 L10,-2 L8,2 L8,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    case 'tree':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M0,8 L0,0 L-3,-4 L0,-4 L0,-8 L3,-4 L6,-4 L3,0 L3,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-1" y1="8" x2="1" y2="8" stroke={inkColor} strokeWidth="2" />
        </G>
      );
    case 'rock':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-8,4 L-6,-4 L-2,-6 L4,-4 L8,2 L4,6 L-4,6 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-4,0 L2,-2 M0,4 L4,2" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    case 'road':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Path d="M-12,-4 L12,-4 M-12,4 L12,4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-8" y1="0" x2="-4" y2="0" stroke={inkColor} strokeWidth="1.5" strokeDasharray="2,2" />
          <Line x1="0" y1="0" x2="4" y2="0" stroke={inkColor} strokeWidth="1.5" strokeDasharray="2,2" />
          <Line x1="8" y1="0" x2="12" y2="0" stroke={inkColor} strokeWidth="1.5" strokeDasharray="2,2" />
        </G>
      );
    case 'tower':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          <Rect x="-4" y="-10" width="8" height="20" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-6" y="-14" width="12" height="4" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-2" y="-4" width="4" height="6" fill="none" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    default:
      return <Circle cx={x} cy={y} r="8" fill="none" stroke={inkColor} strokeWidth="1.5" />;
  }
};

export default function MapBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mapId, source, category, section, categoryId } = useLocalSearchParams();
  const { 
    currentProject, 
    getMap, 
    updateMapData,
    getWorldbuildingMap,
    updateWorldbuildingMapData,
    getCustomCategoryMap,
    updateCustomCategoryMapData
  } = useProjects();
  const { getFontSizeValue } = useSettings();

  const [selectedBrush, setSelectedBrush] = useState<BrushType>('land');
  const [selectedMarker, setSelectedMarker] = useState<MarkerType | null>(null);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [markerName, setMarkerName] = useState('');
  const [mode, setMode] = useState<'draw' | 'marker'>('draw');
  const [isLoaded, setIsLoaded] = useState(false);

  const baseFontSize = getFontSizeValue();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load map data once on mount
  useEffect(() => {
    if (mapId && currentProject && !isLoaded) {
      let map;
      
      if (source === 'worldbuilding' && category) {
        map = getWorldbuildingMap(category as keyof WorldbuildingWithMaps, mapId as string);
      } else if (source === 'custom' && section && categoryId) {
        map = getCustomCategoryMap(
          section as 'characters' | 'settings' | 'miscellaneous',
          categoryId as string,
          mapId as string
        );
      } else {
        map = getMap(mapId as string);
      }
      
      if (map) {
        console.log('Loaded map with paths:', map.paths?.length || 0, 'markers:', map.markers?.length || 0);
        setPaths(map.paths || []);
        setMarkers(map.markers || []);
      }
      setIsLoaded(true);
    }
  }, [mapId, currentProject, source, category, section, categoryId, isLoaded]);

  // Debounced save - only save after user stops drawing for 500ms
  useEffect(() => {
    if (!isLoaded || !mapId) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      console.log('Auto-saving map data - paths:', paths.length, 'markers:', markers.length);
      
      if (source === 'worldbuilding' && category) {
        updateWorldbuildingMapData(
          category as keyof WorldbuildingWithMaps,
          mapId as string,
          paths,
          markers
        );
      } else if (source === 'custom' && section && categoryId) {
        updateCustomCategoryMapData(
          section as 'characters' | 'settings' | 'miscellaneous',
          categoryId as string,
          mapId as string,
          paths,
          markers
        );
      } else {
        updateMapData(mapId as string, paths, markers);
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [paths, markers, isLoaded]);

  const handleTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    if (mode === 'marker' && selectedMarker) {
      const newMarker: MapMarker = {
        id: Date.now().toString(),
        type: selectedMarker,
        x: locationX,
        y: locationY,
        name: '',
      };
      console.log('Adding marker at:', locationX, locationY);
      setMarkers(prev => [...prev, newMarker]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (mode === 'draw') {
      console.log('Starting draw at:', locationX, locationY);
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
      console.log('Completed path, adding to paths array');
      setPaths(prev => [...prev, newPath]);
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
      setMarkers(prev => prev.map(m => 
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
      setMarkers(prev => prev.filter(m => m.id !== selectedMarkerId));
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
            setCurrentPath('');
            setIsDrawing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleUndo = () => {
    if (mode === 'draw' && paths.length > 0) {
      setPaths(prev => prev.slice(0, -1));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (mode === 'marker' && markers.length > 0) {
      setMarkers(prev => prev.slice(0, -1));
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
            {/* Render saved paths */}
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
            
            {/* Render current drawing path */}
            {currentPath && isDrawing && (
              <Path
                d={currentPath}
                stroke={BRUSH_COLORS[selectedBrush]}
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            
            {/* Render markers with fine ink icons */}
            {markers.map((marker) => (
              <G key={marker.id} onPress={() => handleMarkerPress(marker.id)}>
                <MarkerIcon type={marker.type} x={marker.x} y={marker.y} />
                {marker.name && (
                  <SvgText
                    x={marker.x}
                    y={marker.y + 25}
                    fontSize={11}
                    fill="#2C1810"
                    textAnchor="middle"
                    fontWeight="bold"
                    fontFamily="serif"
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
            {(Object.keys(BRUSH_COLORS).length > 0 ? [
              'house', 'castle', 'town', 'windmill', 'smith', 'wooden-bridge',
              'stone-bridge', 'mountain', 'small-mountain', 'lake', 'river',
              'mountain-range', 'crevice', 'forest', 'tree', 'rock', 'road', 'tower'
            ] as MarkerType[] : []).map((marker) => (
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
                <View style={styles.markerIconPreview}>
                  <Svg width={48} height={48} viewBox="-24 -24 48 48">
                    <MarkerIcon type={marker} x={0} y={0} />
                  </Svg>
                </View>
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
    minWidth: 100,
    gap: 6,
  },
  markerIconPreview: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
