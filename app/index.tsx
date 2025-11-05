import { Redirect } from 'expo-router';

// This serves as a fallback - the actual routing is handled in _layout.tsx
export default function Index() {
  // Default redirect to auth login - the root layout will handle the actual routing
  return <Redirect href="/(auth)/login" />;
}
