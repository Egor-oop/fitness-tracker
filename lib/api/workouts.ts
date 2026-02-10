import { supabase } from '@/lib/supabase';
import type {
  ProgramWithDetails,
  SplitType,
  WorkoutProgramRow,
} from '@/lib/types';

export async function fetchUserPrograms(): Promise<WorkoutProgramRow[]> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchProgramWithDetails(
  programId: string
): Promise<ProgramWithDetails> {
  const { data, error } = await supabase
    .from('workout_programs')
    .select(
      `
      *,
      workouts (
        *,
        workout_exercises (
          *,
          exercise:exercises (uid, name)
        )
      )
    `
    )
    .eq('id', programId)
    .single();

  if (error) throw error;
  return data as ProgramWithDetails;
}

export async function deleteProgram(programId: string): Promise<void> {
  const { error } = await supabase
    .from('workout_programs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', programId);

  if (error) throw error;
}

export async function hasAnyPrograms(): Promise<boolean> {
  const { count, error } = await supabase
    .from('workout_programs')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function generateWorkoutProgram(
  params: { days: number; split_type: SplitType },
  accessToken: string,
): Promise<{ id: string }> {
  const url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-workout`;

  console.log('[generateWorkoutProgram] URL:', url);
  console.log('[generateWorkoutProgram] token preview:', accessToken.substring(0, 40));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(params),
  });

  console.log('[generateWorkoutProgram] status:', res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error('[generateWorkoutProgram] error response:', text);
    throw new Error(text);
  }

  const data = await res.json();

  if (!data?.success) {
    throw new Error(data?.error ?? 'Unknown error from generate-workout');
  }
  return { id: data.data.id };
}
