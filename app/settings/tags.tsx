/**
 * Tag Management Route
 * /settings/tags
 */

import TagManagementScreen from '@/src/screens/Settings/TagManagementScreen';
import { Stack } from 'expo-router';

export default function TagsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Tags', headerShown: false }} />
      <TagManagementScreen />
    </>
  );
}
