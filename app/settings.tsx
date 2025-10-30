
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSettings } from '@/contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, fontSize, setFontSize, getFontSizeValue } = useSettings();

  const fontSizes = [
    { label: 'Small', value: 'small' as const },
    { label: 'Medium', value: 'medium' as const },
    { label: 'Large', value: 'large' as const },
    { label: 'Extra Large', value: 'xlarge' as const },
  ];

  const baseFontSize = getFontSizeValue();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
            Appearance
          </Text>
          
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.settingLabel, { color: theme.colors.text, fontSize: baseFontSize }]}>
              Dark Mode
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleDarkMode();
              }}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
            Font Size
          </Text>
          
          {fontSizes.map((size, index) => (
            <Pressable
              key={size.value}
              style={[
                styles.settingRow,
                index < fontSizes.length - 1 && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFontSize(size.value);
              }}
            >
              <Text style={[styles.settingLabel, { color: theme.colors.text, fontSize: baseFontSize }]}>
                {size.label}
              </Text>
              {fontSize === size.value && (
                <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: baseFontSize + 2 }]}>
            About
          </Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text, fontSize: baseFontSize }]}>
              Version
            </Text>
            <Text style={[styles.settingValue, { color: theme.dark ? '#999' : '#666', fontSize: baseFontSize }]}>
              1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '600',
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    flex: 1,
  },
  settingValue: {
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
