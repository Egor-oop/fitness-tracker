import { ExerciseData } from "./types.ts";

export const EXERCISES_DB: Record<string, ExerciseData> = {
  // ГРУДЬ
  "ex_001": {
    name: "Жим штанги лежа",
    muscle_groups: ["грудь", "трицепс", "передние дельты"],
    type: "базовое",
    category: "push/upper",
    equipment: "штанга",
  },
  "ex_002": {
    name: "Жим гантелей на наклонной скамье",
    muscle_groups: ["верх груди", "передние дельты"],
    type: "базовое",
    category: "push/upper",
    equipment: "гантели",
  },
  "ex_003": {
    name: "Разводка гантелей",
    muscle_groups: ["грудь"],
    type: "изолирующее",
    category: "push/upper",
    equipment: "гантели",
  },
  "ex_004": {
    name: "Отжимания на брусьях",
    muscle_groups: ["грудь", "трицепс"],
    type: "базовое",
    category: "push/upper",
    equipment: "брусья",
  },

  // СПИНА
  "ex_010": {
    name: "Становая тяга",
    muscle_groups: ["спина", "бицепс бедра", "ягодицы"],
    type: "базовое",
    category: "pull/back",
    equipment: "штанга",
  },
  "ex_011": {
    name: "Подтягивания",
    muscle_groups: ["широчайшие", "бицепс"],
    type: "базовое",
    category: "pull/upper",
    equipment: "турник",
  },
  "ex_012": {
    name: "Тяга штанги в наклоне",
    muscle_groups: ["спина", "задние дельты"],
    type: "базовое",
    category: "pull/upper",
    equipment: "штанга",
  },
  "ex_013": {
    name: "Тяга горизонтального блока",
    muscle_groups: ["спина", "бицепс"],
    type: "базовое",
    category: "pull/upper",
    equipment: "блок",
  },
  "ex_014": {
    name: "Тяга верхнего блока",
    muscle_groups: ["широчайшие"],
    type: "базовое",
    category: "pull/upper",
    equipment: "блок",
  },

  // НОГИ
  "ex_020": {
    name: "Приседания со штангой",
    muscle_groups: ["квадрицепс", "ягодицы"],
    type: "базовое",
    category: "legs/lower",
    equipment: "штанга",
  },
  "ex_021": {
    name: "Румынская тяга",
    muscle_groups: ["бицепс бедра", "ягодицы"],
    type: "базовое",
    category: "legs/lower",
    equipment: "штанга",
  },
  "ex_022": {
    name: "Жим ногами",
    muscle_groups: ["квадрицепс", "ягодицы"],
    type: "базовое",
    category: "legs/lower",
    equipment: "тренажер",
  },
  "ex_023": {
    name: "Сгибания ног лежа",
    muscle_groups: ["бицепс бедра"],
    type: "изолирующее",
    category: "legs/lower",
    equipment: "тренажер",
  },
  "ex_024": {
    name: "Разгибания ног сидя",
    muscle_groups: ["квадрицепс"],
    type: "изолирующее",
    category: "legs/lower",
    equipment: "тренажер",
  },
  "ex_025": {
    name: "Подъем на носки стоя",
    muscle_groups: ["икры"],
    type: "изолирующее",
    category: "legs/lower",
    equipment: "тренажер",
  },

  // ПЛЕЧИ
  "ex_030": {
    name: "Жим штанги стоя",
    muscle_groups: ["передние дельты", "средние дельты"],
    type: "базовое",
    category: "push/upper",
    equipment: "штанга",
  },
  "ex_031": {
    name: "Разводка гантелей в стороны",
    muscle_groups: ["средние дельты"],
    type: "изолирующее",
    category: "push/upper",
    equipment: "гантели",
  },
  "ex_032": {
    name: "Разводка в наклоне",
    muscle_groups: ["задние дельты"],
    type: "изолирующее",
    category: "pull/upper",
    equipment: "гантели",
  },
  "ex_033": {
    name: "Тяга к подбородку",
    muscle_groups: ["средние дельты", "трапеции"],
    type: "базовое",
    category: "pull/upper",
    equipment: "штанга",
  },

  // РУКИ
  "ex_040": {
    name: "Подъем штанги на бицепс",
    muscle_groups: ["бицепс"],
    type: "изолирующее",
    category: "pull/upper",
    equipment: "штанга",
  },
  "ex_041": {
    name: "Французский жим",
    muscle_groups: ["трицепс"],
    type: "изолирующее",
    category: "push/upper",
    equipment: "штанга",
  },
  "ex_042": {
    name: "Молотковые сгибания",
    muscle_groups: ["бицепс", "предплечья"],
    type: "изолирующее",
    category: "pull/upper",
    equipment: "гантели",
  },
  "ex_043": {
    name: "Разгибания на блоке",
    muscle_groups: ["трицепс"],
    type: "изолирующее",
    category: "push/upper",
    equipment: "блок",
  },
};

export function formatExercisesList(): string {
  return Object.entries(EXERCISES_DB)
    .map(
      ([uid, ex]) =>
        `${uid} | ${ex.name} | Группы: ${ex.muscle_groups.join(", ")} | Тип: ${ex.type} | Категория: ${ex.category}`
    )
    .join("\n");
}

export function validateExerciseUids(workouts: { exercises: { uid: string }[] }[]): void {
  const validUids = new Set(Object.keys(EXERCISES_DB));

  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (!validUids.has(exercise.uid)) {
        throw new Error(`Invalid exercise UID: ${exercise.uid}`);
      }
    }
  }
}
