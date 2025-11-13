/**
 * Document Route Layout
 * Layout for all document-related screens
 */

import { Stack } from 'expo-router';

export default function DocumentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="edit/[id]" />
    </Stack>
  );
}
