import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { studentsApi, attendanceApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type AttendanceScreenProps = {
  onBack?: () => void;
};

type StatusType = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

type Student = {
  id: string;
  fullName: string;
  studentId: string;
  rollNumber: string;
  status: StatusType | null;
  attendanceId: string | null;
};

const statusConfig: Record<
  StatusType,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  PRESENT: {
    label: "PRESENT",
    color: colors.emerald,
    bgColor: `${colors.emerald}22`,
    borderColor: `${colors.emerald}66`,
  },
  ABSENT: {
    label: "ABSENT",
    color: colors.red,
    bgColor: `${colors.red}22`,
    borderColor: `${colors.red}66`,
  },
  LATE: {
    label: "LATE",
    color: colors.amber,
    bgColor: `${colors.amber}22`,
    borderColor: `${colors.amber}66`,
  },
  LEAVE: {
    label: "LEAVE",
    color: colors.cyan,
    bgColor: `${colors.cyan}22`,
    borderColor: `${colors.cyan}66`,
  },
};

export default function AttendanceScreen({ onBack }: AttendanceScreenProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDate] = useState(new Date().toISOString().slice(0, 10));

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const [studentsData, attendanceData] = await Promise.all([
        studentsApi.list().catch(() => []),
        attendanceApi.list(selectedDate).catch(() => []),
      ]);

      console.log("✅ Students loaded:", studentsData.length);
      console.log("✅ Attendance records:", attendanceData.length);

      const attendanceMap = new Map<string, any>();
      attendanceData.forEach((rec: any) => {
        attendanceMap.set(rec.studentId, rec);
      });

      setStudents(
        studentsData.map((s: any) => {
          const record = attendanceMap.get(s.id);
          return {
            id: s.id,
            fullName: s.fullName || "",
            studentId: s.studentId || "",
            rollNumber: s.rollNumber || "",
            status: record?.status || null,
            attendanceId: record?.id || null,
          };
        })
      );
    } catch (err) {
      console.error("❌ Load error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadData);

  async function markAttendance(studentId: string, status: StatusType) {
    setSavingId(studentId);
    try {
      await attendanceApi.mark({
        studentId,
        date: selectedDate,
        status,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, status } : s))
      );
      console.log(`✅ Marked ${studentId} as ${status}`);
    } catch (err) {
      console.error("❌ Mark error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to mark attendance"
      );
    } finally {
      setSavingId(null);
    }
  }

  async function markAll(status: StatusType) {
    Alert.alert(
      "Mark All",
      `Mark all students as ${status}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            for (const s of students) {
              await markAttendance(s.id, status);
            }
          },
        },
      ]
    );
  }

  const filtered = students.filter((s) =>
    `${s.fullName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;
  const rate =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

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
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ArrowLeft size={18} color={colors.white} />
              </TouchableOpacity>

              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>DAILY RECORDS</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Attendance Management</Text>
            <Text style={styles.heroSubtitle}>
              Track daily attendance for every student with real-time updates.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <View style={styles.dateBox}>
                <Calendar size={14} color={colors.navyDark} />
                <Text style={styles.dateBoxText}>{selectedDate}</Text>
              </View>

              <TouchableOpacity
                style={styles.heroBtnSecondary}
                onPress={() => markAll("PRESENT")}
                activeOpacity={0.85}
              >
                <CheckCircle2 size={14} color={colors.emeraldLight} />
                <Text style={styles.heroBtnSecondaryText}>All Present</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Stats */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
            style={styles.statsScrollView}
          >
            <StatCard
              label="TOTAL"
              value={students.length}
              icon={Users}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="PRESENT"
              value={presentCount}
              icon={CheckCircle2}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="ABSENT"
              value={absentCount}
              icon={XCircle}
              gradient={["#EF4444", "#DC2626"]}
            />
            <StatCard
              label="RATE"
              value={rate}
              icon={Clock}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Student Attendance</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {students.length} students
                </Text>
              </View>
            </View>

            <View style={styles.searchWrapper}>
              <Search
                size={16}
                color={colors.textDim}
                style={styles.searchIcon}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search students..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading attendance...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !errorMsg && filtered.length === 0 && (
              <EmptyState
                icon={Users}
                title={
                  search.trim() ? "No students found" : "No students yet"
                }
                description={
                  search.trim()
                    ? "Try changing your search to find what you're looking for."
                    : "Add students first to mark their attendance."
                }
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((student) => (
                  <View key={student.id} style={styles.attendanceCard}>
                    <View style={styles.attendanceRow}>
                      <View style={styles.avatar}>
                        <LinearGradient
                          colors={["#4F46E5", "#6366F1"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.avatarGradient}
                        >
                          <Text style={styles.avatarText}>
                            {student.fullName.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.studentInfo}>
                        <View style={styles.studentNameRow}>
                          <Text style={styles.studentName}>
                            {student.fullName}
                          </Text>
                          {student.status ? (
                            <StatusBadge status={student.status} />
                          ) : null}
                        </View>
                        <Text style={styles.studentMeta}>
                          ID: {student.studentId} • Roll:{" "}
                          {student.rollNumber || "—"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statusButtons}>
                      {(
                        ["PRESENT", "ABSENT", "LATE", "LEAVE"] as StatusType[]
                      ).map((status) => {
                        const config = statusConfig[status];
                        const isActive = student.status === status;
                        const isSaving = savingId === student.id && isActive;

                        return (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusBtn,
                              isActive && {
                                backgroundColor: config.bgColor,
                                borderColor: config.borderColor,
                              },
                            ]}
                            onPress={() =>
                              markAttendance(student.id, status)
                            }
                            disabled={savingId === student.id}
                          >
                            {isSaving ? (
                              <ActivityIndicator
                                size="small"
                                color={config.color}
                              />
                            ) : (
                              <Text
                                style={[
                                  styles.statusBtnText,
                                  isActive && { color: config.color },
                                ]}
                              >
                                {config.label}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: number;
  icon: any;
  gradient: string[];
}) {
  return (
    <LinearGradient
      colors={gradient as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statIconBox}>
          <Icon size={18} color={colors.white} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </LinearGradient>
  );
}

function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
      ]}
    >
      <Text style={[styles.statusBadgeText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
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
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.base,
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
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: fontWeight.black,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  heroButtonsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  dateBoxText: {
    color: colors.navyDark,
    fontSize: 12,
    fontWeight: fontWeight.black,
  },
  heroBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: `${colors.emerald}22`,
    borderWidth: 1,
    borderColor: `${colors.emerald}55`,
  },
  heroBtnSecondaryText: {
    color: colors.emeraldLight,
    fontSize: 12,
    fontWeight: fontWeight.black,
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
    width: 130,
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    minHeight: 90,
    justifyContent: "space-between",
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  statLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.8,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: colors.white,
    fontSize: 24,
    fontWeight: fontWeight.black,
    letterSpacing: -0.6,
  },

  directoryCard: { padding: spacing.lg },
  directoryHeader: { marginBottom: spacing.base },
  directoryTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  directoryCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  searchWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  searchIcon: { position: "absolute", left: 14, zIndex: 1 },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 14,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.base,
  },
  listContainer: { gap: spacing.md },

  stateBox: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
  },
  stateText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginTop: spacing.sm,
  },
  errorBox: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: `${colors.red}55`,
    backgroundColor: `${colors.red}15`,
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    color: colors.redLight,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.red,
    marginTop: spacing.sm,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
  },

  attendanceCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  attendanceRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: radius.md },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  studentInfo: { flex: 1, justifyContent: "center" },
  studentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  studentName: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
  },
  studentMeta: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  statusBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  statusBtnText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
});