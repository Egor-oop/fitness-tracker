import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as workoutsApi from '@/lib/api/workouts';
import type { WorkoutProgramRow } from '@/lib/types';

const SPLIT_LABELS: Record<string, string> = {
  fullbody: 'Full Body',
  upper_lower: 'Upper / Lower',
  push_pull_legs: 'Push / Pull / Legs',
  front_back: 'Front / Back',
};

export default function WorkoutsIndex() {
  const [programs, setPrograms] = useState<WorkoutProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    workoutsApi
      .fetchUserPrograms()
      .then(setPrograms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои программы</Text>
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.program_name}</Text>
            <Text style={styles.cardSub}>
              {SPLIT_LABELS[item.split_type] ?? item.split_type} ·{' '}
              {item.requested_days} дн/нед
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#2a2a4e',
    borderRadius: 14,
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: '#8e8ea0',
  },
});
