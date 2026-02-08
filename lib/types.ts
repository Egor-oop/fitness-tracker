export type SplitType =
  | "fullbody"
  | "upper_lower"
  | "push_pull_legs"
  | "front_back";

export interface WorkoutProgramRow {
  id: string;
  user_id: string;
  program_name: string;
  split_type: SplitType;
  weeks: number;
  notes: string | null;
  requested_days: number;
  preferences: {
    level?: "beginner" | "intermediate" | "advanced";
    goal?: "strength" | "hypertrophy" | "endurance" | "general";
    equipment?: string[];
    exclude_exercises?: string[];
    focus_muscles?: string[];
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkoutRow {
  id: string;
  program_id: string;
  day: number;
  name: string;
  focus: string;
  estimated_duration_minutes: number;
  position: number;
  created_at: string;
}

export interface WorkoutExerciseRow {
  id: string;
  workout_id: string;
  exercise_uid: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tempo: string | null;
  notes: string | null;
  position: number;
  created_at: string;
}

export interface ExerciseRow {
  uid: string;
  name: string;
  created_at: string;
}

export interface WorkoutWithExercises extends WorkoutRow {
  workout_exercises: (WorkoutExerciseRow & {
    exercise: ExerciseRow;
  })[];
}

export interface ProgramWithDetails extends WorkoutProgramRow {
  workouts: WorkoutWithExercises[];
}
