import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import * as workoutsApi from '@/lib/api/workouts';

const OnboardingCompleteContext = createContext<(() => void) | null>(null);

export function useOnboardingComplete() {
  const fn = useContext(OnboardingCompleteContext);
  if (!fn) throw new Error('useOnboardingComplete must be used within AuthGate');
  return fn;
}

function AuthGate() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasPrograms, setHasPrograms] = useState<boolean | null>(null);

  const markOnboardingComplete = useCallback(() => {
    setHasPrograms(true);
  }, []);

  // Check for existing programs when session changes
  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      setHasPrograms(null);
      return;
    }

    workoutsApi
      .hasAnyPrograms()
      .then(setHasPrograms)
      .catch(() => setHasPrograms(false));
  }, [session, isLoading]);

  // Navigate based on auth + program state
  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!session) {
      if (inTabs || inOnboarding) {
        router.replace('/');
      }
      return;
    }

    // Session exists but program check not done yet
    if (hasPrograms === null) return;

    if (hasPrograms) {
      if (!inTabs) {
        router.replace('/(tabs)');
      }
    } else {
      if (!inOnboarding) {
        router.replace('/(onboarding)');
      }
    }
    // Only react to auth/program state changes, not navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isLoading, hasPrograms]);

  return (
    <OnboardingCompleteContext.Provider value={markOnboardingComplete}>
      <Stack screenOptions={{ headerShown: false }} />
    </OnboardingCompleteContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
