
import { Stack } from 'expo-router';

export default function StoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="menu" />
      <Stack.Screen name="[chapterId]" />
    </Stack>
  );
}
