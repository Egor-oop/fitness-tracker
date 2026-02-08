import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

function AuthGate() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedRoute = segments[0] === '(tabs)';

    if (session && !inProtectedRoute) {
      router.replace('/(tabs)');
    } else if (!session && inProtectedRoute) {
      router.replace('/');
    }
    // Only react to auth state changes, not navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isLoading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
