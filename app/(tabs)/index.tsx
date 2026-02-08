import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          Привет, {user?.user_metadata?.full_name ?? user?.email ?? 'User'}!
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutText}>Выйти</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8e8ea0',
  },
  pressed: {
    opacity: 0.75,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e8ea0',
  },
});
