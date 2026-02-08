export type SplitType =
  | "fullbody"
  | "upper_lower"
  | "push_pull_legs"
  | "front_back";

export interface Exercise {
  uid: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tempo?: string;
  notes?: string;
}

export interface Workout {
  day: number;
  name: string;
  focus: string;
  exercises: Exercise[];
  estimated_duration_minutes: number;
}

export interface WorkoutProgram {
  program_name: string;
  split_type: SplitType;
  weeks: number;
  workouts: Workout[];
  notes?: string;
}

export interface GenerateWorkoutRequest {
  days: number;
  split_type: SplitType;
  preferences?: {
    level?: "beginner" | "intermediate" | "advanced";
    goal?: "strength" | "hypertrophy" | "endurance" | "general";
    equipment?: string[];
    exclude_exercises?: string[];
    focus_muscles?: string[];
  };
}

export interface ExerciseData {
  name: string;
  muscle_groups: string[];
  type: "базовое" | "изолирующее";
  category: string;
  equipment?: string;
}
