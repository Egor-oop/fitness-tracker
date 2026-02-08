-- ============================================================================
-- EXERCISES REFERENCE TABLE
-- ============================================================================
CREATE TABLE exercises (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO exercises (uid, name) VALUES
  ('ex_001', 'Жим штанги лежа'),
  ('ex_002', 'Жим гантелей на наклонной скамье'),
  ('ex_003', 'Разводка гантелей'),
  ('ex_004', 'Отжимания на брусьях'),
  ('ex_010', 'Становая тяга'),
  ('ex_011', 'Подтягивания'),
  ('ex_012', 'Тяга штанги в наклоне'),
  ('ex_013', 'Тяга горизонтального блока'),
  ('ex_014', 'Тяга верхнего блока'),
  ('ex_020', 'Приседания со штангой'),
  ('ex_021', 'Румынская тяга'),
  ('ex_022', 'Жим ногами'),
  ('ex_023', 'Сгибания ног лежа'),
  ('ex_024', 'Разгибания ног сидя'),
  ('ex_025', 'Подъем на носки стоя'),
  ('ex_030', 'Жим штанги стоя'),
  ('ex_031', 'Разводка гантелей в стороны'),
  ('ex_032', 'Разводка в наклоне'),
  ('ex_033', 'Тяга к подбородку'),
  ('ex_040', 'Подъем штанги на бицепс'),
  ('ex_041', 'Французский жим'),
  ('ex_042', 'Молотковые сгибания'),
  ('ex_043', 'Разгибания на блоке');

-- ============================================================================
-- WORKOUT PROGRAMS
-- ============================================================================
CREATE TABLE workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  program_name TEXT NOT NULL,
  split_type TEXT NOT NULL CHECK (split_type IN ('fullbody', 'upper_lower', 'push_pull_legs', 'front_back')),
  weeks INTEGER NOT NULL CHECK (weeks BETWEEN 1 AND 12),
  notes TEXT,

  requested_days INTEGER NOT NULL CHECK (requested_days BETWEEN 1 AND 7),
  preferences JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_workout_programs_user_id ON workout_programs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_workout_programs_created_at ON workout_programs(created_at DESC);

-- ============================================================================
-- WORKOUTS (days within a program)
-- ============================================================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,

  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 7),
  name TEXT NOT NULL,
  focus TEXT NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
  position INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(program_id, day)
);

CREATE INDEX idx_workouts_program_id ON workouts(program_id);

-- ============================================================================
-- WORKOUT EXERCISES
-- ============================================================================
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_uid TEXT NOT NULL REFERENCES exercises(uid),

  sets INTEGER NOT NULL CHECK (sets BETWEEN 1 AND 10),
  reps TEXT NOT NULL,
  rest_seconds INTEGER NOT NULL CHECK (rest_seconds BETWEEN 30 AND 300),
  tempo TEXT,
  notes TEXT,
  position INTEGER NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(workout_id, position)
);

CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- exercises: public read
CREATE POLICY "exercises_public_read" ON exercises
  FOR SELECT USING (true);

-- workout_programs: own records only
CREATE POLICY "programs_select_own" ON workout_programs
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "programs_insert_own" ON workout_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "programs_update_own" ON workout_programs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "programs_delete_own" ON workout_programs
  FOR DELETE USING (auth.uid() = user_id);

-- workouts: access via program ownership
CREATE POLICY "workouts_select_own" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = workouts.program_id
        AND user_id = auth.uid()
        AND deleted_at IS NULL
    )
  );

CREATE POLICY "workouts_insert_own" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = workouts.program_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "workouts_delete_own" ON workouts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_programs
      WHERE id = workouts.program_id AND user_id = auth.uid()
    )
  );

-- workout_exercises: access via workout → program ownership
CREATE POLICY "exercises_select_own" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN workout_programs ON workout_programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
        AND workout_programs.user_id = auth.uid()
        AND workout_programs.deleted_at IS NULL
    )
  );

CREATE POLICY "exercises_insert_own" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN workout_programs ON workout_programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
        AND workout_programs.user_id = auth.uid()
    )
  );

CREATE POLICY "exercises_delete_own" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts
      JOIN workout_programs ON workout_programs.id = workouts.program_id
      WHERE workouts.id = workout_exercises.workout_id
        AND workout_programs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workout_programs_updated_at
  BEFORE UPDATE ON workout_programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
