import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Users,
  GraduationCap,
  BookOpen,
  Wallet,
  ArrowRight,
  ClipboardCheck,
  FileText,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut,
  Bell,
  User,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";
import {
  studentsApi,
  teachersApi,
  classesApi,
  feeReportsApi,
  FeeSummary,
} from "../api/client";
import { useRefresh } from "../hooks/useRefresh";

type DashboardScreenProps = {
  onLogout?: () => void;
  onNavigate?: (target: string) => void;
};

const quickActions = [
  { label: "Manage Students", icon: Users, color: colors.indigo, screen: "students" },
  { label: "Manage Teachers", icon: GraduationCap, color: colors.cyan, screen: "teachers" },
  { label: "Manage Classes", icon: BookOpen, color: colors.violet, screen: "classes" },
  { label: "Subjects", icon: BookOpen, color: colors.pink, screen: "subjects" },
  { label: "Mark Attendance", icon: ClipboardCheck, color: colors.emerald, screen: "attendance" },
  { label: "Create Exam", icon: FileText, color: colors.cyan, screen: "exams" },
  { label: "Enter Marks", icon: BarChart3, color: colors.violet, screen: "marks" },
  { label: "Record Payment", icon: Wallet, color: colors.amber, screen: "fees" },
  { label: "Notices", icon: Bell, color: colors.amber, screen: "notices" },
  { label: "Profile", icon: User, color: colors.cyan, screen: "profile" },
];

export default function DashboardScreen({
  onLogout,
  onNavigate,
}: DashboardScreenProps) {
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      setLoading(true);

      const [students, teachers, classes, feeReport] = await Promise.all([
        studentsApi.list().catch(() => []),
        teachersApi.list().catch(() => []),
        classesApi.list().catch(() => []),
        feeReportsApi.get().catch(() => null),
      ]);

      setTotalStudents(students.length);
      setActiveStudents(
        students.filter((s: any) => s.status === "ACTIVE").length
      );
      setTotalTeachers(teachers.length);
      setTotalClasses(classes.length);
      setFeeSummary(feeReport?.summary || null);

      console.log("✅ Dashboard loaded:", {
        students: students.length,
        teachers: teachers.length,
        classes: classes.length,
        feeSummary: feeReport?.summary,
      });
    } catch (err) {
      console.error("❌ Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadStats);

  const collectionRate =
    feeSummary && feeSummary.totalBilled > 0
      ? Math.round(
          (feeSummary.totalCollected / feeSummary.totalBilled) * 100
        )
      : 0;

  const stats = [
    {
      label: "TOTAL STUDENTS",
      value: totalStudents,
      subtext: `${activeStudents} active`,
      icon: Users,
      gradient: ["#4F46E5", "#4338CA"],
    },
    {
      label: "TEACHERS",
      value: totalTeachers,
      subtext: "Faculty members",
      icon: GraduationCap,
      gradient: ["#06B6D4", "#0EA5E9"],
    },
    {
      label: "CLASSES",
      value: totalClasses,
      subtext: "Across all grades",
      icon: BookOpen,
      gradient: ["#8B5CF6", "#6366F1"],
    },
    {
      label: "FEES COLLECTED",
      value: Math.round(feeSummary?.totalCollected || 0),
      subtext: `${collectionRate}% collection rate`,
      icon: Wallet,
      gradient: ["#10B981", "#0D9488"],
    },
  ];

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.cyan}
              colors={[colors.cyan]}
            />
          }
        >
          {/* Hero */}
          <LinearGradient
            colors={["#1e1b4b", "#0A1628", "#155e75"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <View style={styles.dateBadge}>
                <Sparkles size={11} color={colors.cyan} />
                <Text style={styles.dateText}>
                  {new Date()
                    .toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    .toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                <LogOut size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>Welcome back 👋</Text>
            <Text style={styles.heroSubtitle}>
              Here&apos;s everything happening at The Legends Academy today.
            </Text>
          </LinearGradient>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.cyan} />
              <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
          )}

          {!loading && (
            <>
              {/* Stats */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statsScrollContent}
                style={styles.statsScrollView}
              >
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <LinearGradient
                      key={stat.label}
                      colors={stat.gradient as [string, string]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.statCard}
                    >
                      <View style={styles.statTop}>
                        <View style={styles.statInfo}>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                          <Text style={styles.statValue}>
                            {stat.value > 999
                              ? stat.value.toLocaleString()
                              : stat.value}
                          </Text>
                          <Text style={styles.statSubtext}>
                            {stat.subtext}
                          </Text>
                        </View>
                        <View style={styles.statIconBox}>
                          <Icon size={20} color={colors.white} />
                        </View>
                      </View>
                    </LinearGradient>
                  );
                })}
              </ScrollView>

              {/* Fee Overview */}
              <Card style={styles.feeCard}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={styles.sectionTitle}>Fee Overview</Text>
                    <Text style={styles.sectionSubtitle}>
                      Billing and collection summary
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.linkRow}
                    onPress={() => onNavigate?.("fees")}
                  >
                    <Text style={styles.linkText}>Full Report</Text>
                    <ArrowRight size={14} color={colors.cyan} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.feeMiniScrollContent}
                  style={styles.feeMiniScrollView}
                >
                  <FeeMini
                    label="TOTAL BILLED"
                    value={`Rs ${Math.round(feeSummary?.totalBilled || 0)}`}
                    icon={FileText}
                    color={colors.cyan}
                  />
                  <FeeMini
                    label="COLLECTED"
                    value={`Rs ${Math.round(feeSummary?.totalCollected || 0)}`}
                    icon={CheckCircle2}
                    color={colors.emerald}
                  />
                  <FeeMini
                    label="PENDING"
                    value={`Rs ${Math.round(feeSummary?.totalRemaining || 0)}`}
                    icon={AlertCircle}
                    color={colors.amber}
                  />
                </ScrollView>

                <View style={styles.progressSection}>
                  <View style={styles.progressTop}>
                    <Text style={styles.progressLabel}>
                      COLLECTION PROGRESS
                    </Text>
                    <Text style={styles.progressValue}>
                      {collectionRate}%
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={["#4F46E5", "#06B6D4", "#10B981"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${collectionRate}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.statusGrid}>
                  <StatusPill
                    label="PAID"
                    value={String(feeSummary?.paidCount || 0)}
                    icon={CheckCircle2}
                    color={colors.emerald}
                  />
                  <StatusPill
                    label="PARTIAL"
                    value={String(feeSummary?.partialCount || 0)}
                    icon={Clock}
                    color={colors.amber}
                  />
                  <StatusPill
                    label="UNPAID"
                    value={String(feeSummary?.unpaidCount || 0)}
                    icon={AlertCircle}
                    color={colors.rose}
                  />
                  <StatusPill
                    label="OVERDUE"
                    value={String(feeSummary?.overdueCount || 0)}
                    icon={AlertCircle}
                    color={colors.red}
                  />
                </View>
              </Card>

              {/* Quick Actions */}
              <Card style={styles.quickCard}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>
                  Jump to any module
                </Text>

                <View style={styles.quickList}>
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <TouchableOpacity
                        key={action.label}
                        activeOpacity={0.7}
                        style={styles.quickItem}
                        onPress={() => onNavigate?.(action.screen)}
                      >
                        <View
                          style={[
                            styles.quickIcon,
                            { backgroundColor: `${action.color}22` },
                          ]}
                        >
                          <Icon size={18} color={action.color} />
                        </View>
                        <Text style={styles.quickLabel}>{action.label}</Text>
                        <ArrowRight size={16} color={colors.textDim} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Card>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeeMini({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <View
      style={[
        styles.feeMini,
        { borderColor: `${color}33`, backgroundColor: `${color}0d` },
      ]}
    >
      <View style={styles.feeMiniTop}>
        <Text style={[styles.feeMiniLabel, { color: `${color}cc` }]}>
          {label}
        </Text>
        <Icon size={14} color={`${color}aa`} />
      </View>
      <Text style={[styles.feeMiniValue, { color }]}>{value}</Text>
    </View>
  );
}

function StatusPill({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <View
      style={[
        styles.statusPill,
        { borderColor: `${color}33`, backgroundColor: `${color}0d` },
      ]}
    >
      <View style={styles.statusPillTop}>
        <Icon size={11} color={color} />
        <Text style={[styles.statusPillLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.statusPillValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safeArea: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: 100 },

  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  dateBadge: {
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
  dateText: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.2,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  loadingBox: {
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  statsScrollView: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.base,
  },
  statsScrollContent: {
    gap: spacing.md,
    paddingHorizontal: spacing.base,
  },
  statCard: {
    width: 180,
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    minHeight: 130,
    justifyContent: "space-between",
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statInfo: { flex: 1 },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.8,
  },
  statValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: fontWeight.black,
    letterSpacing: -0.6,
    marginTop: 4,
  },
  statSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  feeCard: { padding: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.base,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    color: colors.cyan,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  feeMiniScrollView: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.lg,
  },
  feeMiniScrollContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  feeMini: {
    width: 130,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  feeMiniTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feeMiniLabel: {
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  feeMiniValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },

  progressSection: { marginBottom: spacing.lg },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  progressValue: {
    color: colors.cyan,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
  },
  statusGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statusPill: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  statusPillTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  statusPillLabel: {
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusPillValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },

  quickCard: { padding: spacing.lg, marginBottom: spacing.lg },
  quickList: { marginTop: spacing.base, gap: spacing.sm },
  quickItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});