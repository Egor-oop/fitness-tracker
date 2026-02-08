import { SplitType } from "./types.ts";
import { formatExercisesList } from "./exercises-db.ts";

const SPLIT_RULES: Record<SplitType, string> = {
  fullbody: `
- Каждая тренировка включает все основные группы мышц
- 1-2 упражнения на группу мышц
- Фокус: базовые многосуставные движения
- Чередуй акценты между тренировками`,

  upper_lower: `
- Верх тела: грудь, спина, плечи, руки (6-8 упражнений)
- Низ тела: квадрицепс, бицепс бедра, ягодицы, икры (5-7 упражнений)
- Чередуй верх и низ`,

  push_pull_legs: `
- Push: грудь, передние/средние дельты, трицепс (5-7 упражнений)
- Pull: спина, задние дельты, бицепс (5-7 упражнений)
- Legs: квадрицепс, бицепс бедра, ягодицы, икры (5-7 упражнений)`,

  front_back: `
- Передняя часть: грудь, квадрицепс, передние дельты
- Задняя часть: спина, бицепс бедра, задние дельты
- Баланс push/pull движений`,
};

export function buildPrompt(
  days: number,
  splitType: SplitType,
  preferences?: {
    level?: string;
    goal?: string;
    equipment?: string[];
    exclude_exercises?: string[];
    focus_muscles?: string[];
  }
): string {
  const exercisesList = formatExercisesList();
  const splitRules = SPLIT_RULES[splitType];

  return `Ты - профессиональный тренер по составлению программ тренировок.

ДОСТУПНЫЕ УПРАЖНЕНИЯ:
${exercisesList}

ПАРАМЕТРЫ ПРОГРАММЫ:
- Тренировочных дней: ${days}
- Тип сплита: ${splitType}
- Уровень: ${preferences?.level || "intermediate"}
- Цель: ${preferences?.goal || "hypertrophy"}
- Оборудование: ${preferences?.equipment?.join(", ") || "полный зал"}
${preferences?.exclude_exercises ? `- Исключить упражнения: ${preferences.exclude_exercises.join(", ")}` : ""}
${preferences?.focus_muscles ? `- Акцент на мышцы: ${preferences.focus_muscles.join(", ")}` : ""}

ПРАВИЛА РАСПРЕДЕЛЕНИЯ ДЛЯ ${splitType.toUpperCase()}:
${splitRules}

ОБЩИЕ ПРИНЦИПЫ:
1. Базовые многосуставные упражнения - в начале тренировки
2. Изолирующие упражнения - в конце
3. Большие мышечные группы тренируй раньше малых
4. Варьируй диапазоны повторений: 4-6 (сила), 8-12 (гипертрофия), 12-15 (выносливость)
5. Базовые: отдых 120-180 сек, изоляция: 60-90 сек
6. Используй ТОЛЬКО uid упражнений из списка выше
7. Каждая тренировка должна длиться 45-90 минут
8. Балансируй объем нагрузки между мышечными группами

Создай сбалансированную, эффективную программу в формате JSON.`;
}
