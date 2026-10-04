import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type ForgotPasswordScreenProps = {
  onBack?: () => void;
};

export default function ForgotPasswordScreen({
  onBack,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSendReset() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
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
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <ArrowLeft size={20} color={colors.white} />
            </TouchableOpacity>

            {!sent ? (
              <>
                <View style={styles.welcomeContainer}>
                  <View style={styles.welcomeBadge}>
                    <Sparkles size={12} color={colors.cyan} />
                    <Text style={styles.welcomeBadgeText}>RESET PASSWORD</Text>
                  </View>

                  <Text style={styles.welcomeTitle}>Forgot password?</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </Text>
                </View>

                <View style={styles.formCard}>
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

                  {error !== "" ? (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>⚠ {error}</Text>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={styles.submitWrapper}
                    onPress={handleSendReset}
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
                          <Text style={styles.submitText}>Send Reset Link</Text>
                          <ArrowRight size={16} color={colors.white} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.bottomText}>Remember your password? </Text>
                  <TouchableOpacity onPress={onBack}>
                    <Text style={styles.bottomLink}>Sign in</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <CheckCircle2 size={48} color={colors.emerald} />
                </View>

                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successSubtitle}>
                  We've sent a password reset link to{"\n"}
                  <Text style={styles.successEmail}>{email}</Text>
                </Text>

                <TouchableOpacity
                  style={styles.submitWrapper}
                  onPress={onBack}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#06B6D4"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                  >
                    <Text style={styles.submitText}>Back to Login</Text>
                    <ArrowRight size={16} color={colors.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
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
    marginBottom: spacing.xl,
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
    fontSize: 32,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  welcomeSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
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
  submitWrapper: { marginTop: spacing.sm, width: "100%" },
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

  successContainer: { alignItems: "center" },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: `${colors.emerald}22`,
    borderWidth: 2,
    borderColor: `${colors.emerald}55`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  successTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: fontWeight.black,
    letterSpacing: -0.8,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  successSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  successEmail: {
    color: colors.cyan,
    fontWeight: fontWeight.black,
  },
});