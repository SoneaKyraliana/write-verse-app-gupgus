
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
import Svg, { Path, Circle, Rect, Text as SvgText, G, Polygon, Ellipse, Line, Defs, ClipPath } from 'react-native-svg';

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

const BRUSH_COLORS: Record<BrushType, string> = {
  land: '#8B7355',
  water: '#4A90E2',
  forest: '#2D5016',
  mountain: '#6B6B6B',
  desert: '#EDC9AF',
  snow: '#F0F8FF',
  swamp: '#4A5D23',
};

// Enhanced fine ink marker icon component with more elaborate details
const MarkerIcon = ({ type, x, y }: { type: MarkerType; x: number; y: number }) => {
  const inkColor = '#1a0f08';
  const lightInk = '#3d2817';
  const scale = 0.9;
  
  switch (type) {
    case 'house':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Roof */}
          <Path d="M0,-14 L-12,0 L-10,0 L-10,2 L10,2 L10,0 L12,0 Z" fill="none" stroke={inkColor} strokeWidth="1.8" strokeLinejoin="miter" />
          {/* Roof details */}
          <Line x1="-8" y1="-7" x2="-8" y2="0" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="-4" y1="-10.5" x2="-4" y2="0" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="4" y1="-10.5" x2="4" y2="0" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="8" y1="-7" x2="8" y2="0" stroke={lightInk} strokeWidth="0.8" />
          {/* Walls */}
          <Rect x="-10" y="2" width="20" height="12" fill="none" stroke={inkColor} strokeWidth="1.8" />
          {/* Door */}
          <Rect x="-3" y="6" width="6" height="8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Circle cx="-1" cy="10" r="0.5" fill={inkColor} />
          {/* Window */}
          <Rect x="4" y="5" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Line x1="6" y1="5" x2="6" y2="9" stroke={inkColor} strokeWidth="0.8" />
          <Line x1="4" y1="7" x2="8" y2="7" stroke={inkColor} strokeWidth="0.8" />
          {/* Chimney smoke */}
          <Path d="M-12,-2 Q-13,-4 -12,-6 Q-11,-8 -12,-10" stroke={lightInk} strokeWidth="0.6" opacity="0.5" />
        </G>
      );
    case 'castle':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Main walls */}
          <Rect x="-14" y="-6" width="28" height="20" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Battlements */}
          <Rect x="-16" y="-12" width="4" height="6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="-8" y="-12" width="4" height="6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="0" y="-12" width="4" height="6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="8" y="-12" width="4" height="6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          {/* Tower details */}
          <Line x1="-14" y1="-2" x2="14" y2="-2" stroke={lightInk} strokeWidth="1" />
          <Line x1="-14" y1="4" x2="14" y2="4" stroke={lightInk} strokeWidth="1" />
          <Line x1="-14" y1="10" x2="14" y2="10" stroke={lightInk} strokeWidth="1" />
          {/* Gate */}
          <Path d="M-6,14 L-6,4 Q-6,2 -4,2 L4,2 Q6,2 6,4 L6,14" fill="none" stroke={inkColor} strokeWidth="1.8" />
          {/* Gate details */}
          <Line x1="-4" y1="4" x2="-4" y2="14" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="0" y1="4" x2="0" y2="14" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="4" y1="4" x2="4" y2="14" stroke={lightInk} strokeWidth="0.8" />
          {/* Windows */}
          <Rect x="-11" y="0" width="3" height="4" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="8" y="0" width="3" height="4" fill="none" stroke={inkColor} strokeWidth="1" />
          {/* Flags */}
          <Line x1="-14" y1="-12" x2="-14" y2="-18" stroke={inkColor} strokeWidth="1" />
          <Path d="M-14,-18 L-10,-16 L-14,-14" fill="none" stroke={inkColor} strokeWidth="1" />
          <Line x1="2" y1="-12" x2="2" y2="-18" stroke={inkColor} strokeWidth="1" />
          <Path d="M2,-18 L6,-16 L2,-14" fill="none" stroke={inkColor} strokeWidth="1" />
        </G>
      );
    case 'town':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Left building */}
          <Rect x="-12" y="-4" width="8" height="14" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M-12,-4 L-8,-10 L-4,-4" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="-10" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="-7" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Line x1="-10" y1="-2" x2="-6" y2="-2" stroke={lightInk} strokeWidth="0.8" />
          {/* Center building (tallest) */}
          <Rect x="-5" y="-12" width="10" height="22" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M-5,-12 L0,-18 L5,-12" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="-3" y="-6" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="1" y="-6" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="-3" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="1" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="-2" y="6" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Line x1="-4" y1="-8" x2="4" y2="-8" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="-4" y1="0" x2="4" y2="0" stroke={lightInk} strokeWidth="0.8" />
          {/* Right building */}
          <Rect x="6" y="-2" width="8" height="12" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M6,-2 L10,-8 L14,-2" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="8" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Rect x="11" y="2" width="2" height="3" fill="none" stroke={inkColor} strokeWidth="1" />
          <Line x1="8" y1="0" x2="12" y2="0" stroke={lightInk} strokeWidth="0.8" />
        </G>
      );
    case 'windmill':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Tower base */}
          <Path d="M-5,12 L-3,-10 L3,-10 L5,12 Z" fill="none" stroke={inkColor} strokeWidth="1.8" />
          {/* Tower details */}
          <Line x1="-4" y1="0" x2="4" y2="0" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="-4.5" y1="6" x2="4.5" y2="6" stroke={lightInk} strokeWidth="0.8" />
          {/* Door */}
          <Rect x="-2" y="8" width="4" height="4" fill="none" stroke={inkColor} strokeWidth="1.2" />
          {/* Windmill blades center */}
          <Circle cx="0" cy="-10" r="2" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Blade 1 */}
          <Path d="M0,-10 L-2,-12 L-10,-14 L-12,-16 L-10,-18 L-2,-16 L0,-14" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-2" y1="-12" x2="-10" y2="-18" stroke={lightInk} strokeWidth="0.8" />
          {/* Blade 2 */}
          <Path d="M0,-10 L2,-12 L10,-14 L12,-16 L10,-18 L2,-16 L0,-14" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="2" y1="-12" x2="10" y2="-18" stroke={lightInk} strokeWidth="0.8" />
          {/* Blade 3 */}
          <Path d="M0,-10 L-2,-8 L-8,-4 L-10,-2 L-8,0 L-2,-4 L0,-6" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-2" y1="-8" x2="-8" y2="0" stroke={lightInk} strokeWidth="0.8" />
          {/* Blade 4 */}
          <Path d="M0,-10 L2,-8 L8,-4 L10,-2 L8,0 L2,-4 L0,-6" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="2" y1="-8" x2="8" y2="0" stroke={lightInk} strokeWidth="0.8" />
        </G>
      );
    case 'smith':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Building */}
          <Rect x="-10" y="-6" width="20" height="16" fill="none" stroke={inkColor} strokeWidth="1.8" />
          {/* Roof */}
          <Path d="M-12,-6 L0,-12 L12,-6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Line x1="-6" y1="-9" x2="-6" y2="-6" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="0" y1="-12" x2="0" y2="-6" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="6" y1="-9" x2="6" y2="-6" stroke={lightInk} strokeWidth="0.8" />
          {/* Anvil */}
          <Path d="M-6,2 L-4,-2 L4,-2 L6,2 L6,4 L-6,4 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-3" y="4" width="6" height="2" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Hammer */}
          <Circle cx="8" cy="0" r="2" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="8" y1="2" x2="6" y2="8" stroke={inkColor} strokeWidth="1.5" />
          {/* Forge fire */}
          <Path d="M-8,6 L-7,4 L-6,6 L-5,3 L-4,6" fill="none" stroke="#FF6B35" strokeWidth="1.2" />
          {/* Smoke */}
          <Path d="M-6,3 Q-7,0 -6,-2" stroke={lightInk} strokeWidth="0.6" opacity="0.4" />
        </G>
      );
    case 'wooden-bridge':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Bridge deck */}
          <Path d="M-14,0 L14,0" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-14,2 L14,2" stroke={inkColor} strokeWidth="1.5" />
          {/* Planks */}
          <Line x1="-12" y1="-4" x2="-12" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-8" y1="-4" x2="-8" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-4" y1="-4" x2="-4" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="0" y1="-4" x2="0" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="4" y1="-4" x2="4" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="8" y1="-4" x2="8" y2="6" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="12" y1="-4" x2="12" y2="6" stroke={inkColor} strokeWidth="1.5" />
          {/* Support beams */}
          <Line x1="-10" y1="-4" x2="-10" y2="2" stroke={lightInk} strokeWidth="1" />
          <Line x1="-6" y1="-4" x2="-6" y2="2" stroke={lightInk} strokeWidth="1" />
          <Line x1="-2" y1="-4" x2="-2" y2="2" stroke={lightInk} strokeWidth="1" />
          <Line x1="2" y1="-4" x2="2" y2="2" stroke={lightInk} strokeWidth="1" />
          <Line x1="6" y1="-4" x2="6" y2="2" stroke={lightInk} strokeWidth="1" />
          <Line x1="10" y1="-4" x2="10" y2="2" stroke={lightInk} strokeWidth="1" />
        </G>
      );
    case 'stone-bridge':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Main arch */}
          <Path d="M-14,6 Q-14,-2 -8,-5 Q0,-8 8,-5 Q14,-2 14,6" fill="none" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-14,8 Q-14,0 -8,-3 Q0,-6 8,-3 Q14,0 14,8" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Stone blocks */}
          <Line x1="-10" y1="6" x2="-10" y2="-2" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-6" y1="6" x2="-6" y2="-4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="-2" y1="6" x2="-2" y2="-5" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="2" y1="6" x2="2" y2="-5" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="6" y1="6" x2="6" y2="-4" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="10" y1="6" x2="10" y2="-2" stroke={inkColor} strokeWidth="1.5" />
          {/* Horizontal mortar lines */}
          <Path d="M-12,2 Q-8,0 -4,0 Q0,-1 4,0 Q8,0 12,2" stroke={lightInk} strokeWidth="1" />
          <Path d="M-10,-1 Q-6,-2 -2,-2 Q0,-3 2,-2 Q6,-2 10,-1" stroke={lightInk} strokeWidth="1" />
        </G>
      );
    case 'mountain':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Main peaks */}
          <Path d="M-14,10 L-6,-10 L-2,-6 L2,-12 L6,-8 L14,10 Z" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Snow caps */}
          <Path d="M-6,-10 L-7,-6 L-5,-6 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M2,-12 L1,-8 L3,-8 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Rock details */}
          <Path d="M-6,-10 L-8,-4 M-6,-10 L-4,-4" stroke={lightInk} strokeWidth="1" />
          <Path d="M2,-12 L0,-6 M2,-12 L4,-6" stroke={lightInk} strokeWidth="1" />
          <Path d="M-10,4 L-8,0 M-4,2 L-2,-2" stroke={lightInk} strokeWidth="1" />
          <Path d="M4,2 L6,-2 M8,4 L10,0" stroke={lightInk} strokeWidth="1" />
        </G>
      );
    case 'small-mountain':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale * 0.75})`}>
          {/* Single peak */}
          <Path d="M-12,8 L0,-10 L12,8 Z" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Snow cap */}
          <Path d="M0,-10 L-2,-6 L2,-6 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Rock details */}
          <Path d="M0,-10 L-3,-4 M0,-10 L3,-4" stroke={lightInk} strokeWidth="1" />
          <Path d="M-6,2 L-4,-2 M6,2 L4,-2" stroke={lightInk} strokeWidth="1" />
        </G>
      );
    case 'lake':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Lake outline */}
          <Ellipse cx="0" cy="0" rx="14" ry="9" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Water ripples */}
          <Path d="M-8,-3 Q-6,-5 -4,-3 Q-2,-1 0,-3 Q2,-5 4,-3 Q6,-1 8,-3" stroke={inkColor} strokeWidth="1.2" opacity="0.6" />
          <Path d="M-6,0 Q-4,-2 -2,0 Q0,2 2,0 Q4,-2 6,0" stroke={inkColor} strokeWidth="1.2" opacity="0.6" />
          <Path d="M-8,3 Q-6,1 -4,3 Q-2,5 0,3 Q2,1 4,3 Q6,5 8,3" stroke={inkColor} strokeWidth="1.2" opacity="0.6" />
          {/* Shore details */}
          <Path d="M-12,-4 Q-10,-3 -9,-4" stroke={lightInk} strokeWidth="1" />
          <Path d="M9,-4 Q10,-3 12,-4" stroke={lightInk} strokeWidth="1" />
        </G>
      );
    case 'river':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* River banks */}
          <Path d="M-14,-10 Q-10,-6 -6,-8 Q-2,-10 2,-6 Q6,-4 10,-6 Q12,-7 14,-4" fill="none" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-14,-6 Q-10,-2 -6,-4 Q-2,-6 2,-2 Q6,0 10,-2 Q12,-3 14,0" fill="none" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-14,6 Q-10,2 -6,4 Q-2,6 2,2 Q6,0 10,2 Q12,3 14,6" fill="none" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-14,10 Q-10,6 -6,8 Q-2,10 2,6 Q6,4 10,6 Q12,7 14,10" fill="none" stroke={inkColor} strokeWidth="2.5" />
          {/* Water flow lines */}
          <Path d="M-12,-8 Q-8,-4 -4,-6 Q0,-8 4,-4 Q8,-2 12,-4" stroke={lightInk} strokeWidth="1" opacity="0.5" />
          <Path d="M-12,0 Q-8,4 -4,2 Q0,0 4,4 Q8,6 12,4" stroke={lightInk} strokeWidth="1" opacity="0.5" />
          <Path d="M-12,8 Q-8,4 -4,6 Q0,8 4,4 Q8,2 12,4" stroke={lightInk} strokeWidth="1" opacity="0.5" />
        </G>
      );
    case 'mountain-range':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Multiple peaks */}
          <Path d="M-16,10 L-12,-4 L-10,-2 L-8,-8 L-6,-4 L-4,-10 L-2,-6 L0,-12 L2,-8 L4,-10 L6,-6 L8,-8 L10,-4 L12,-6 L16,10" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Snow caps */}
          <Path d="M-8,-8 L-9,-5 L-7,-5 Z" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M-4,-10 L-5,-7 L-3,-7 Z" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M0,-12 L-1,-9 L1,-9 Z" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M4,-10 L3,-7 L5,-7 Z" fill="none" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M8,-8 L7,-5 L9,-5 Z" fill="none" stroke={inkColor} strokeWidth="1.2" />
          {/* Rock details */}
          <Path d="M-12,-4 L-13,0 M-8,-8 L-9,-3" stroke={lightInk} strokeWidth="0.8" />
          <Path d="M-4,-10 L-5,-5 M0,-12 L-1,-7" stroke={lightInk} strokeWidth="0.8" />
          <Path d="M4,-10 L3,-5 M8,-8 L7,-3" stroke={lightInk} strokeWidth="0.8" />
        </G>
      );
    case 'crevice':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Crevice edges */}
          <Path d="M-12,-10 L-10,10" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-8,-10 L-6,10" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M-4,-10 L-2,10" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M0,-10 L2,10" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M4,-10 L6,10" stroke={inkColor} strokeWidth="2.5" />
          <Path d="M8,-10 L10,10" stroke={inkColor} strokeWidth="2.5" />
          {/* Depth lines */}
          <Line x1="-11" y1="-5" x2="-9" y2="-5" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="-11" y1="0" x2="-9" y2="0" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="-11" y1="5" x2="-9" y2="5" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="-7" y1="-2" x2="-5" y2="-2" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="-7" y1="3" x2="-5" y2="3" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="-3" y1="0" x2="-1" y2="0" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="1" y1="-3" x2="3" y2="-3" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="5" y1="2" x2="7" y2="2" stroke={lightInk} strokeWidth="1.2" />
          <Line x1="9" y1="-1" x2="11" y2="-1" stroke={lightInk} strokeWidth="1.2" />
        </G>
      );
    case 'forest':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Left tree */}
          <Line x1="-10" y1="10" x2="-10" y2="2" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-10,2 L-14,-2 L-12,-2 L-14,-6 L-12,-6 L-10,-10 L-8,-6 L-6,-6 L-8,-2 L-6,-2 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M-12,-4 L-10,-10 L-8,-4" stroke={lightInk} strokeWidth="0.8" />
          {/* Center tree */}
          <Line x1="0" y1="10" x2="0" y2="0" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M0,0 L-5,-5 L-3,-5 L-5,-9 L-3,-9 L0,-14 L3,-9 L5,-9 L3,-5 L5,-5 Z" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M-3,-7 L0,-14 L3,-7" stroke={lightInk} strokeWidth="1" />
          {/* Right tree */}
          <Line x1="10" y1="10" x2="10" y2="2" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M10,2 L6,-2 L8,-2 L6,-6 L8,-6 L10,-10 L12,-6 L14,-6 L12,-2 L14,-2 Z" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Path d="M8,-4 L10,-10 L12,-4" stroke={lightInk} strokeWidth="0.8" />
          {/* Ground bushes */}
          <Path d="M-14,10 Q-12,8 -10,10" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M-6,10 Q-4,8 -2,10" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M2,10 Q4,8 6,10" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M10,10 Q12,8 14,10" stroke={inkColor} strokeWidth="1.2" />
        </G>
      );
    case 'tree':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Trunk */}
          <Path d="M-2,10 L-2,0 L2,0 L2,10" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Line x1="-1" y1="10" x2="1" y2="10" stroke={inkColor} strokeWidth="2.5" />
          {/* Trunk texture */}
          <Line x1="-1" y1="3" x2="1" y2="3" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="-1" y1="6" x2="1" y2="6" stroke={lightInk} strokeWidth="0.8" />
          {/* Foliage layers */}
          <Path d="M0,0 L-6,-4 L-4,-4 L-6,-8 L-4,-8 L0,-12 L4,-8 L6,-8 L4,-4 L6,-4 Z" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Path d="M-4,-6 L0,-12 L4,-6" stroke={lightInk} strokeWidth="1" />
          <Path d="M-5,-2 L0,-6 L5,-2" stroke={lightInk} strokeWidth="1" />
          {/* Roots */}
          <Path d="M-2,10 Q-4,11 -5,12" stroke={inkColor} strokeWidth="1.2" />
          <Path d="M2,10 Q4,11 5,12" stroke={inkColor} strokeWidth="1.2" />
        </G>
      );
    case 'rock':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Main rock shape */}
          <Path d="M-10,6 L-8,-6 L-4,-8 L2,-7 L6,-4 L10,4 L6,8 L-2,8 L-6,7 Z" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Rock texture and cracks */}
          <Path d="M-6,-2 L-2,-4 L2,-2 L4,2" stroke={lightInk} strokeWidth="1.2" />
          <Path d="M-4,2 L0,0 L4,3 L6,6" stroke={lightInk} strokeWidth="1.2" />
          <Path d="M-8,-2 L-6,2 L-4,4" stroke={lightInk} strokeWidth="1" />
          <Path d="M2,-6 L4,-2 L6,0" stroke={lightInk} strokeWidth="1" />
          {/* Shading lines */}
          <Line x1="-7" y1="0" x2="-5" y2="2" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="-3" y1="5" x2="-1" y2="7" stroke={lightInk} strokeWidth="0.8" />
          <Line x1="3" y1="4" x2="5" y2="6" stroke={lightInk} strokeWidth="0.8" />
        </G>
      );
    case 'road':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Dirt path edges - irregular and natural */}
          <Path d="M-14,-4 Q-10,-5 -6,-3 Q-2,-4 2,-3 Q6,-5 10,-3 Q12,-4 14,-2" fill="none" stroke={inkColor} strokeWidth="2" />
          <Path d="M-14,4 Q-10,5 -6,3 Q-2,4 2,3 Q6,5 10,3 Q12,4 14,2" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Dirt texture - small stones and irregularities */}
          <Circle cx="-10" cy="-1" r="0.8" fill={inkColor} />
          <Circle cx="-6" cy="1" r="0.6" fill={inkColor} />
          <Circle cx="-2" cy="-0.5" r="0.7" fill={inkColor} />
          <Circle cx="2" cy="1.5" r="0.5" fill={inkColor} />
          <Circle cx="6" cy="-1" r="0.8" fill={inkColor} />
          <Circle cx="10" cy="0.5" r="0.6" fill={inkColor} />
          {/* Footprints and tracks */}
          <Path d="M-8,-2 L-7,-1 M-7,-1 L-8,0" stroke={lightInk} strokeWidth="0.8" opacity="0.5" />
          <Path d="M-4,1 L-3,2 M-3,2 L-4,3" stroke={lightInk} strokeWidth="0.8" opacity="0.5" />
          <Path d="M0,-1 L1,0 M1,0 L0,1" stroke={lightInk} strokeWidth="0.8" opacity="0.5" />
          <Path d="M4,2 L5,3 M5,3 L4,4" stroke={lightInk} strokeWidth="0.8" opacity="0.5" />
          <Path d="M8,-1 L9,0 M9,0 L8,1" stroke={lightInk} strokeWidth="0.8" opacity="0.5" />
          {/* Grass tufts along edges */}
          <Path d="M-12,-5 L-12,-7 M-11,-5 L-11,-6" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M-8,4 L-8,6 M-7,4 L-7,5" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M-4,-4 L-4,-6 M-3,-4 L-3,-5" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M0,5 L0,7 M1,5 L1,6" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M4,-4 L4,-6 M5,-4 L5,-5" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M8,4 L8,6 M9,4 L9,5" stroke={lightInk} strokeWidth="0.6" />
          <Path d="M12,-5 L12,-7 M13,-5 L13,-6" stroke={lightInk} strokeWidth="0.6" />
        </G>
      );
    case 'tower':
      return (
        <G transform={`translate(${x}, ${y}) scale(${scale})`}>
          {/* Tower base */}
          <Rect x="-5" y="-8" width="10" height="22" fill="none" stroke={inkColor} strokeWidth="2" />
          {/* Battlements */}
          <Rect x="-7" y="-14" width="14" height="6" fill="none" stroke={inkColor} strokeWidth="1.8" />
          <Rect x="-7" y="-14" width="3" height="3" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="-1.5" y="-14" width="3" height="3" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Rect x="4" y="-14" width="3" height="3" fill="none" stroke={inkColor} strokeWidth="1.5" />
          {/* Tower details */}
          <Line x1="-5" y1="-2" x2="5" y2="-2" stroke={lightInk} strokeWidth="1" />
          <Line x1="-5" y1="4" x2="5" y2="4" stroke={lightInk} strokeWidth="1" />
          <Line x1="-5" y1="10" x2="5" y2="10" stroke={lightInk} strokeWidth="1" />
          {/* Windows */}
          <Rect x="-2" y="-5" width="4" height="5" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="0" y1="-5" x2="0" y2="0" stroke={inkColor} strokeWidth="1" />
          <Line x1="-2" y1="-2.5" x2="2" y2="-2.5" stroke={inkColor} strokeWidth="1" />
          <Rect x="-2" y="1" width="4" height="5" fill="none" stroke={inkColor} strokeWidth="1.5" />
          <Line x1="0" y1="1" x2="0" y2="6" stroke={inkColor} strokeWidth="1" />
          <Line x1="-2" y1="3.5" x2="2" y2="3.5" stroke={inkColor} strokeWidth="1" />
          {/* Door */}
          <Path d="M-2,14 L-2,8 Q-2,7 0,7 Q2,7 2,8 L2,14" fill="none" stroke={inkColor} strokeWidth="1.5" />
        </G>
      );
    default:
      return <Circle cx={x} cy={y} r="8" fill="none" stroke={inkColor} strokeWidth="1.8" />;
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
  const [brushWidth, setBrushWidth] = useState(20);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [isDraggingName, setIsDraggingName] = useState(false);

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
        strokeWidth: brushWidth,
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
      Alert.alert(
        'Delete Marker',
        'Are you sure you want to delete this marker?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setMarkers(prev => prev.filter(m => m.id !== selectedMarkerId));
              setShowNameModal(false);
              setSelectedMarkerId(null);
              setMarkerName('');
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

  const handleNameLongPress = (markerId: string) => {
    setEditingNameId(markerId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleNameDrag = (event: any, markerId: string) => {
    if (editingNameId === markerId) {
      const { locationX, locationY } = event.nativeEvent;
      setMarkers(prev => prev.map(m => 
        m.id === markerId ? { ...m, nameX: locationX, nameY: locationY } : m
      ));
    }
  };

  const handleNameDragEnd = () => {
    setEditingNameId(null);
    setIsDraggingName(false);
  };

  const handleNameSizeChange = (markerId: string, delta: number) => {
    setMarkers(prev => prev.map(m => 
      m.id === markerId ? { 
        ...m, 
        nameFontSize: Math.max(8, Math.min(24, (m.nameFontSize || 12) + delta))
      } : m
    ));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

      <View style={[styles.infoBar, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <IconSymbol name="info.circle" size={16} color={theme.colors.primary} />
        <Text style={[styles.infoText, { color: theme.colors.text, fontSize: baseFontSize - 3 }]}>
          {mode === 'marker' ? 'Tap map to place marker, then tap marker to name it. Long press names to move/resize' : 'Draw on the map to create terrain. Adjust brush width with slider'}
        </Text>
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

      {mode === 'draw' && (
        <View style={[styles.brushWidthControl, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.brushWidthLabel, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
            Brush Width: {brushWidth}
          </Text>
          <View style={styles.brushWidthSlider}>
            <Pressable
              onPress={() => {
                setBrushWidth(Math.max(5, brushWidth - 5));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.brushWidthButton, { backgroundColor: theme.colors.primary }]}
            >
              <IconSymbol name="minus" size={16} color="#fff" />
            </Pressable>
            <View style={styles.brushWidthBar}>
              <View 
                style={[
                  styles.brushWidthIndicator, 
                  { 
                    width: `${(brushWidth / 50) * 100}%`,
                    backgroundColor: theme.colors.primary 
                  }
                ]} 
              />
            </View>
            <Pressable
              onPress={() => {
                setBrushWidth(Math.min(50, brushWidth + 5));
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.brushWidthButton, { backgroundColor: theme.colors.primary }]}
            >
              <IconSymbol name="plus" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}

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
                strokeWidth={path.strokeWidth || 20}
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
                strokeWidth={brushWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
            
            {/* Render markers with fine ink icons */}
            {markers.map((marker) => (
              <G key={marker.id}>
                <G onPress={() => handleMarkerPress(marker.id)}>
                  <MarkerIcon type={marker.type} x={marker.x} y={marker.y} />
                </G>
                {marker.name && (
                  <G
                    onLongPress={() => handleNameLongPress(marker.id)}
                    onResponderMove={(e) => handleNameDrag(e, marker.id)}
                    onResponderRelease={handleNameDragEnd}
                  >
                    <SvgText
                      x={marker.nameX || marker.x}
                      y={marker.nameY || (marker.y + 28)}
                      fontSize={marker.nameFontSize || 12}
                      fill="#1a0f08"
                      textAnchor="middle"
                      fontWeight="bold"
                      fontFamily="serif"
                    >
                      {marker.name}
                    </SvgText>
                  </G>
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
                  <Svg width={56} height={56} viewBox="-28 -28 56 56">
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
              Edit Location
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize - 2 }]}>
              Add a name to this marker or delete it. Long press the name on the map to move or resize it.
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
            {selectedMarkerId && markers.find(m => m.id === selectedMarkerId)?.name && (
              <View style={styles.nameSizeControls}>
                <Text style={[styles.nameSizeLabel, { color: theme.colors.text, fontSize: baseFontSize - 2 }]}>
                  Name Size:
                </Text>
                <View style={styles.nameSizeButtons}>
                  <Pressable
                    onPress={() => handleNameSizeChange(selectedMarkerId, -2)}
                    style={[styles.nameSizeButton, { backgroundColor: theme.colors.border }]}
                  >
                    <IconSymbol name="textformat.size.smaller" size={18} color={theme.colors.text} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleNameSizeChange(selectedMarkerId, 2)}
                    style={[styles.nameSizeButton, { backgroundColor: theme.colors.border }]}
                  >
                    <IconSymbol name="textformat.size.larger" size={18} color={theme.colors.text} />
                  </Pressable>
                </View>
              </View>
            )}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleDeleteMarker}
              >
                <IconSymbol name="trash" size={18} color="#fff" />
                <Text style={[styles.modalButtonText, { fontSize: baseFontSize }]}>Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveMarkerName}
              >
                <IconSymbol name="checkmark" size={18} color="#fff" />
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  infoText: {
    flex: 1,
    fontStyle: 'italic',
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
  brushWidthControl: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brushWidthLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  brushWidthSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brushWidthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushWidthBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  brushWidthIndicator: {
    height: '100%',
    borderRadius: 4,
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
    width: 56,
    height: 56,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  nameSizeControls: {
    marginBottom: 16,
  },
  nameSizeLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  nameSizeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  nameSizeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  deleteButton: {
    flex: 0.9,
  },
  saveButton: {
    flex: 1.1,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
