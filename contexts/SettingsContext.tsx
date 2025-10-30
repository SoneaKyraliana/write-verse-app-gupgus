
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface SettingsContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  getFontSizeValue: () => number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FONT_SIZE_MAP = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 20,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>('medium');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('darkMode');
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      
      if (darkMode !== null) {
        setIsDarkMode(darkMode === 'true');
      }
      if (savedFontSize !== null) {
        setFontSizeState(savedFontSize as FontSize);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkMode', newValue.toString());
    } catch (error) {
      console.log('Error saving dark mode:', error);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      setFontSizeState(size);
      await AsyncStorage.setItem('fontSize', size);
    } catch (error) {
      console.log('Error saving font size:', error);
    }
  };

  const getFontSizeValue = () => {
    return FONT_SIZE_MAP[fontSize];
  };

  return (
    <SettingsContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        fontSize,
        setFontSize,
        getFontSizeValue,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
