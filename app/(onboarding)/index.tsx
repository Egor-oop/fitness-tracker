import { useOnboardingComplete } from "@/app/_layout";
import { useAuth } from "@/hooks/use-auth";
import * as workoutsApi from "@/lib/api/workouts";
import type { SplitType } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Step = "days" | "split" | "generating";

const SPLIT_OPTIONS: {
  value: SplitType;
  label: string;
  description: string;
}[] = [
  {
    value: "fullbody",
    label: "Full Body",
    description: "Всё тело за одну тренировку",
  },
  {
    value: "upper_lower",
    label: "Upper / Lower",
    description: "Верх и низ чередуются",
  },
  {
    value: "push_pull_legs",
    label: "Push / Pull / Legs",
    description: "Жим, тяга, ноги",
  },
  {
    value: "front_back",
    label: "Front / Back",
    description: "Передняя и задняя цепь",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const onboardingComplete = useOnboardingComplete();
  const { session, signOut } = useAuth();
  const [step, setStep] = useState<Step>("days");
  const [days, setDays] = useState<number | null>(null);

  const [splitType, setSplitType] = useState<SplitType | null>(null);

  const handleContinue = () => {
    if (step === "days" && days !== null) {
      setStep("split");
    } else if (step === "split" && splitType !== null) {
      handleGenerate(splitType);
    }
  };

  const handleGenerate = async (split: SplitType) => {
    setStep("generating");

    try {
      console.log({ accessToken: session!.access_token });
      await workoutsApi.generateWorkoutProgram(
        { days: days!, split_type: split },
        session!.access_token,
      );
      onboardingComplete();
      router.replace("/(tabs)/workouts");
    } catch (error) {
      console.error("[Onboarding] generate error:", error);
      Alert.alert("Ошибка", "Не удалось создать программу. Попробуйте снова.");
      setStep("split");
    }
  };

  const canContinue =
    (step === "days" && days !== null) ||
    (step === "split" && splitType !== null);

  if (step === "generating") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.generatingText}>Создаём программу тренировок…</Text>
      </View>
    );
  }

  if (step === "split") {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => setStep("days")} style={styles.backButton}>
          <Text style={styles.backText}>← Назад</Text>
        </Pressable>
        <Text style={styles.heading}>Выберите сплит</Text>
        <Text style={styles.subheading}>Как распределить нагрузку?</Text>
        <View style={styles.options}>
          {SPLIT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.splitCard,
                splitType === option.value && styles.selectedCard,
              ]}
              onPress={() => setSplitType(option.value)}
            >
              <Text style={styles.splitLabel}>{option.label}</Text>
              <Text style={styles.splitDesc}>{option.description}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.footer}>
          <Pressable
            style={[
              styles.continueButton,
              !canContinue && styles.continueDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text
              style={[
                styles.continueText,
                !canContinue && styles.continueTextDisabled,
              ]}
            >
              Продолжить
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // step === 'days'
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => signOut().catch(console.error)}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Назад</Text>
      </Pressable>
      <Text style={styles.heading}>Сколько дней в неделю?</Text>
      <Text style={styles.subheading}>Выберите количество тренировок</Text>
      <View style={styles.daysList}>
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <Pressable
            key={d}
            style={[styles.dayCard, days === d && styles.selectedCard]}
            onPress={() => setDays(d)}
          >
            <Text style={styles.dayCardNumber}>{d}</Text>
            <Text style={styles.dayCardLabel}>
              {d === 1 ? "день" : d < 5 ? "дня" : "дней"}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            !canContinue && styles.continueDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.continueText,
              !canContinue && styles.continueTextDisabled,
            ]}
          >
            Продолжить
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  generatingText: {
    color: "#8e8ea0",
    fontSize: 16,
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: "#8e8ea0",
    fontSize: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: "#8e8ea0",
    marginBottom: 32,
  },
  daysList: {
    gap: 8,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a4e",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dayCardNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    width: 28,
  },
  dayCardLabel: {
    fontSize: 16,
    color: "#8e8ea0",
  },
  selectedCard: {
    borderColor: "#6c63ff",
    backgroundColor: "#2a2a5e",
  },
  options: {
    gap: 8,
  },
  splitCard: {
    backgroundColor: "#2a2a4e",
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  splitLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  splitDesc: {
    fontSize: 14,
    color: "#8e8ea0",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 40,
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: "#6c63ff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueDisabled: {
    backgroundColor: "#2a2a4e",
  },
  continueText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  continueTextDisabled: {
    color: "#8e8ea0",
  },
});
