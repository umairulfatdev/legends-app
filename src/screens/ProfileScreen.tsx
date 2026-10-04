import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  LogOut,
  Shield,
  Bell,
  HelpCircle,
  ArrowRight,
  Settings,
  ChevronRight,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type ProfileScreenProps = {
  onBack?: () => void;
  onLogout?: () => void;
};

export default function ProfileScreen({
  onBack,
  onLogout,
}: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.navy, "#1e1b4b", colors.navy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={["#1e1b4b", "#0A1628", "#155e75"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ArrowRight
                  size={18}
                  color={colors.white}
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </TouchableOpacity>

              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>ACCOUNT</Text>
              </View>
            </View>

            <View style={styles.profileHeader}>
              <LinearGradient
                colors={["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>A</Text>
                </View>
              </LinearGradient>

              <Text style={styles.profileName}>Administrator</Text>
              <Text style={styles.profileRole}>SUPER ADMIN</Text>
            </View>
          </LinearGradient>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Account Information</Text>

            <View style={styles.infoList}>
              <InfoRow
                icon={User}
                label="Full Name"
                value="Administrator"
              />
              <InfoRow
                icon={Mail}
                label="Email"
                value="admin@legends.edu"
              />
              <InfoRow
                icon={Phone}
                label="Phone"
                value="0300-1234567"
              />
              <InfoRow
                icon={MapPin}
                label="Address"
                value="Lahore, Pakistan"
              />
            </View>
          </Card>

          {/* Settings Card */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <View style={styles.settingsList}>
              <SettingItem
                icon={Bell}
                label="Notifications"
                onPress={() => Alert.alert("Notifications", "Coming soon!")}
              />
              <SettingItem
                icon={Shield}
                label="Privacy & Security"
                onPress={() => Alert.alert("Privacy", "Coming soon!")}
              />
              <SettingItem
                icon={Settings}
                label="App Settings"
                onPress={() => Alert.alert("Settings", "Coming soon!")}
              />
              <SettingItem
                icon={HelpCircle}
                label="Help & Support"
                onPress={() => Alert.alert("Help", "Coming soon!")}
              />
            </View>
          </Card>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => {
              Alert.alert("Logout", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: onLogout,
                },
              ]);
            }}
            activeOpacity={0.85}
          >
            <LogOut size={18} color={colors.redLight} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconBox}>
        <Icon size={16} color={colors.cyan} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function SettingItem({
  icon: Icon,
  label,
  onPress,
}: {
  icon: any;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIconBox}>
        <Icon size={16} color={colors.indigoLight} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <ChevronRight size={18} color={colors.textDim} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safeArea: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: 40 },

  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: spacing.lg,
    overflow: "hidden",
    alignItems: "center",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
    alignSelf: "stretch",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.cyan,
  },
  badgeText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
  },

  profileHeader: {
    alignItems: "center",
    paddingVertical: spacing.base,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: fontWeight.black,
  },
  profileName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    marginTop: spacing.base,
    letterSpacing: -0.5,
  },
  profileRole: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
    marginTop: 4,
  },

  infoCard: { padding: spacing.lg, marginBottom: spacing.base },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    marginBottom: spacing.base,
    letterSpacing: -0.3,
  },
  infoList: { gap: spacing.base },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: `${colors.cyan}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.8,
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },

  settingsList: { gap: spacing.sm },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: `${colors.indigo}22`,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.red}55`,
    backgroundColor: `${colors.red}15`,
    marginTop: spacing.base,
  },
  logoutText: {
    color: colors.redLight,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },

  version: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});