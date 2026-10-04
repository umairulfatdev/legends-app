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
  User,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type SignupScreenProps = {
  onBack?: () => void;
  onSignupSuccess?: () => void;
};

export default function SignupScreen({
  onBack,
  onSignupSuccess,
}: SignupScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://the-legends-academy-school-system.vercel.app/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      Alert.alert("Success", "Account created! Please sign in.");
      onSignupSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server."
      );
    } finally {
      setLoading(false);
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
            {/* Back Button */}
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <ArrowLeft size={20} color={colors.white} />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <GraduationCap size={28} color={colors.white} />
              </LinearGradient>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeBadge}>
                <Sparkles size={12} color={colors.cyan} />
                <Text style={styles.welcomeBadgeText}>CREATE ACCOUNT</Text>
              </View>

              <Text style={styles.welcomeTitle}>Sign up</Text>
              <Text style={styles.welcomeSubtitle}>
                Create your account to get started
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              {/* Name */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User
                    size={18}
                    color={colors.textDim}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textDim}
                    style={styles.input}
                  />
                </View>
              </View>

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
                    placeholder="you@example.com"
                    placeholderTextColor={colors.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock
                    size={18}
                    color={colors.textDim}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock
                    size={18}
                    color={colors.textDim}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    style={[styles.input, { paddingRight: 48 }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeBtn}
                  >
                    {showConfirm ? (
                      <EyeOff size={18} color={colors.textDim} />
                    ) : (
                      <Eye size={18} color={colors.textDim} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxActive,
                  ]}
                >
                  {termsAccepted ? (
                    <Text style={styles.checkboxTick}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the Terms & Privacy Policy
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
                onPress={handleSignup}
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
                      <Text style={styles.submitText}>Create Account</Text>
                      <ArrowRight size={16} color={colors.white} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Sign in Link */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account? </Text>
              <TouchableOpacity onPress={onBack}>
                <Text style={styles.bottomLink}>Sign in</Text>
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

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },

  logoContainer: { alignItems: "center", marginBottom: spacing.lg },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  welcomeContainer: { marginBottom: spacing.lg },
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
    fontSize: 32,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
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
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: { position: "absolute", left: 16, zIndex: 1 },
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
  eyeBtn: { position: "absolute", right: 12, padding: 6 },

  termsRow: {
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
  termsText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    flex: 1,
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

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomText: { color: colors.textMuted, fontSize: fontSize.sm },
  bottomLink: {
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