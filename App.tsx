import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SplashScreen from "./src/screens/SplashScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import StudentsScreen from "./src/screens/StudentsScreen";
import TeachersScreen from "./src/screens/TeachersScreen";
import ClassesScreen from "./src/screens/ClassesScreen";
import SubjectsScreen from "./src/screens/SubjectsScreen";
import AttendanceScreen from "./src/screens/AttendanceScreen";
import ExamsScreen from "./src/screens/ExamsScreen";
import MarksScreen from "./src/screens/MarksScreen";
import FeesScreen from "./src/screens/FeesScreen";
import NoticesScreen from "./src/screens/NoticesScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import BottomTabs, { TabName } from "./src/components/BottomTabs";
import { colors } from "./src/theme/tokens";

type Screen =
  | "splash"
  | "login"
  | "signup"
  | "forgot"
  | "dashboard"
  | "students"
  | "teachers"
  | "classes"
  | "subjects"
  | "attendance"
  | "exams"
  | "marks"
  | "fees"
  | "notices"
  | "profile";

const STORAGE_KEY = "legends_session";

const TAB_SCREENS: Screen[] = ["dashboard", "students", "fees", "profile"];

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        (globalThis as any).__savedScreen = saved || null;
      } catch (err) {
        console.error("Load session error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  function handleSplashFinish() {
    const saved = (globalThis as any).__savedScreen;
    setScreen(saved ? (saved as Screen) : "login");
  }

  async function navigateTo(target: Screen) {
    setScreen(target);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, target);
    } catch (err) {
      console.error("Save session error:", err);
    }
  }

  async function handleLogout() {
    setScreen("login");
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.navy} />
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.cyan} />
        </View>
      </SafeAreaProvider>
    );
  }

  const showTabs = TAB_SCREENS.includes(screen);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.navy} />

      <View style={styles.appContainer}>
        {screen === "splash" && <SplashScreen onFinish={handleSplashFinish} />}

        {screen === "login" && (
          <LoginScreen
            onLogin={() => navigateTo("dashboard")}
            onSignup={() => setScreen("signup")}
            onForgotPassword={() => setScreen("forgot")}
          />
        )}

        {screen === "signup" && (
          <SignupScreen
            onBack={() => setScreen("login")}
            onSignupSuccess={() => setScreen("login")}
          />
        )}

        {screen === "forgot" && (
          <ForgotPasswordScreen onBack={() => setScreen("login")} />
        )}

        {screen === "dashboard" && (
          <DashboardScreen
            onLogout={handleLogout}
            onNavigate={(target) => navigateTo(target as Screen)}
          />
        )}

        {screen === "students" && (
          <StudentsScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "teachers" && (
          <TeachersScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "classes" && (
          <ClassesScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "subjects" && (
          <SubjectsScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "attendance" && (
          <AttendanceScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "exams" && (
          <ExamsScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "marks" && (
          <MarksScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "fees" && (
          <FeesScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "notices" && (
          <NoticesScreen onBack={() => navigateTo("dashboard")} />
        )}

        {screen === "profile" && (
          <ProfileScreen
            onBack={() => navigateTo("dashboard")}
            onLogout={handleLogout}
          />
        )}

        {showTabs && (
          <BottomTabs
            active={screen as TabName}
            onChange={(tab) => navigateTo(tab as Screen)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: colors.navy },
  loading: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
});