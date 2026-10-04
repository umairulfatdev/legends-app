import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  Lock,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type LoginScreenProps = {
  onLogin?: () => void;
  onSignup?: () => void;
  onForgotPassword?: () => void;
};

export default function LoginScreen({
  onLogin,
  onSignup,
  onForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      setTimeout(() => {
        setLoading(false);
        onLogin?.();
      }, 800);
    } catch (err) {
      setLoading(false);
      setError("Unable to connect to server.");
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.navy, "#1e1b4b", colors.navy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <GraduationCap size={32} color={colors.white} />
              </LinearGradient>

              <Text style={styles.brandName}>THE LEGENDS</Text>
              <Text style={styles.brandSub}>ACADEMY & SCHOOL</Text>
            </View>

            {/* Hero Text */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeBadge}>
                <Sparkles size={12} color={colors.cyan} />
                <Text style={styles.welcomeBadgeText}>ADMIN PORTAL</Text>
              </View>

              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to continue to your dashboard
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail
                    size={18}
                    color={colors.textDim}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="admin@legends.edu"
                    placeholderTextColor={colors.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TouchableOpacity onPress={onForgotPassword}>
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Lock
                    size={18}
                    color={colors.textDim}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    style={[styles.input, { paddingRight: 48 }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textDim} />
                    ) : (
                      <Eye size={18} color={colors.textDim} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me */}
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRemember(!remember)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    remember && styles.checkboxActive,
                  ]}
                >
                  {remember ? (
                    <Text style={styles.checkboxTick}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.rememberText}>
                  Remember me for 30 days
                </Text>
              </TouchableOpacity>

              {/* Error */}
              {error !== "" ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {error}</Text>
                </View>
              ) : null}

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitWrapper}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#4F46E5", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.submitText}>
                        Sign in to Dashboard
                      </Text>
                      <ArrowRight size={16} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Secure Access Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>SECURE ACCESS</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Info Note */}
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Authorized school administrators only. Your account and
                  school data are protected.
                </Text>
              </View>
            </View>

            {/* Signup Link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>
                Don&apos;t have an account?{" "}
              </Text>
              <TouchableOpacity onPress={onSignup}>
                <Text style={styles.signupLink}>Create an account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              © {new Date().getFullYear()} The Legends Academy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    justifyContent: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  brandName: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
  },
  brandSub: {
    color: colors.cyan,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
    marginTop: 4,
  },

  welcomeContainer: { marginBottom: spacing.xl },
  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: spacing.sm,
  },
  welcomeBadgeText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
  },
  welcomeTitle: {
    color: colors.text,
    fontSize: fontSize.huge,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.base,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },

  formCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.035)",
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  inputContainer: { marginBottom: spacing.base },
  inputLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  forgotLink: {
    color: colors.cyan,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingLeft: 46,
    paddingRight: 16,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    padding: 6,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.indigo,
    borderColor: colors.indigo,
  },
  checkboxTick: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.black,
  },
  rememberText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  errorBox: {
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.red}55`,
    backgroundColor: `${colors.red}15`,
    marginBottom: spacing.base,
  },
  errorText: {
    color: colors.redLight,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  submitWrapper: { marginTop: spacing.sm },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
  },

  infoBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    lineHeight: 16,
    textAlign: "center",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.base,
  },
  signupText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  signupLink: {
    color: colors.cyan,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },

  footer: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});