import { supabase } from '@/lib/supabase';
import type {
  WorkoutProgramRow,
  ProgramWithDetails,
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
