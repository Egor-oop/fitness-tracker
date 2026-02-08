import * as authApi from "@/lib/api/auth";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const handleGoogleSignIn = async () => {
    try {
      const url = await authApi.getGoogleOAuthUrl();
      if (!url) return;

      const result = await WebBrowser.openAuthSessionAsync(
        url,
        "fitnesstracker://",
      );

      if (result.type === "success") {
        await authApi.createSessionFromUrl(result.url);
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось войти через Google");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Ionicons name="barbell-outline" size={64} color="#fff" />
        <Text style={styles.title}>Gym Мастер</Text>
        <Text style={styles.subtitle}>Твой персональный фитнес-трекер</Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.googleButton,
            pressed && styles.pressed,
          ]}
          onPress={handleGoogleSignIn}
        >
          <Ionicons name="logo-google" size={22} color="#000" />
          <Text style={styles.googleButtonText}>Войти через Google</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.gosButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            // TODO: Gosuslugi OAuth
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
          <Text style={styles.gosButtonText}>Войти через Госуслуги</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#8e8ea0",
    marginTop: 8,
  },
  bottom: {
    gap: 12,
    paddingBottom: 48,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.75,
  },
  googleButton: {
    backgroundColor: "#fff",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  gosButton: {
    backgroundColor: "#0066b3",
  },
  gosButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
