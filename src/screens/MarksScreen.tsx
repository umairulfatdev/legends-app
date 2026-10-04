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
  Save,
  Users,
  Trophy,
  Award,
  XCircle,
  ArrowLeft,
  FileText,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { examsApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type MarksScreenProps = {
  onBack?: () => void;
};

type StudentMark = {
  id: string;
  name: string;
  rollNumber: string;
  obtained: string;
};

type Exam = {
  id: string;
  title: string;
  subject: string;
  classRoom: string;
  totalMarks: number;
  passingMarks: number;
};

export default function MarksScreen({ onBack }: MarksScreenProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [marks, setMarks] = useState<StudentMark[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await examsApi.list();
      console.log("✅ Exams loaded:", data.length);

      setExams(
        data.map((e: any) => ({
          id: e.id,
          title: e.title || "",
          subject: e.subject?.name || "",
          classRoom: e.classRoom?.name || "",
          totalMarks: e.totalMarks || 100,
          passingMarks: e.passingMarks || 40,
        }))
      );

      // Auto-select first exam
      if (data.length > 0) {
        handleSelectExam(data[0].id);
      }
    } catch (err) {
      console.error("❌ Load exams error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadExams);

  async function handleSelectExam(examId: string) {
    setSelectedExamId(examId);
    setLoadingMarks(true);
    setMarks([]);

    try {
      const examData = exams.find((e) => e.id === examId) || null;
      setSelectedExam(examData);

      const demoStudents: StudentMark[] = [
        { id: "1", name: "ali", rollNumber: "01", obtained: "" },
        { id: "2", name: "umer", rollNumber: "02", obtained: "" },
        { id: "3", name: "Umair Ulfat", rollNumber: "03", obtained: "" },
        { id: "4", name: "muniba bibi", rollNumber: "04", obtained: "" },
      ];
      setMarks(demoStudents);

      console.log("✅ Marks loaded for exam:", examId);
    } catch (err) {
      console.error("❌ Load marks error:", err);
      Alert.alert("Error", "Failed to load marks");
    } finally {
      setLoadingMarks(false);
    }
  }

  function updateMark(id: string, value: string) {
    const numericValue = value.replace(/[^0-9]/g, "");
    setMarks((prev) =>
      prev.map((m) => (m.id === id ? { ...m, obtained: numericValue } : m))
    );
  }

  function handleSave() {
    const filled = marks.filter((m) => m.obtained !== "");
    if (filled.length === 0) {
      Alert.alert("No Marks", "Please enter marks for at least one student.");
      return;
    }
    Alert.alert("Success", `Marks saved for ${filled.length} students (demo).`);
  }

  function getGrade(obtained: string): string {
    if (!obtained || !selectedExam) return "—";
    const percent = (Number(obtained) / selectedExam.totalMarks) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    if (percent >= 33) return "E";
    return "F";
  }

  function getGradeColor(grade: string): string {
    switch (grade) {
      case "A+":
      case "A":
        return colors.emerald;
      case "B":
        return colors.cyan;
      case "C":
        return colors.indigo;
      case "D":
      case "E":
        return colors.amber;
      case "F":
        return colors.red;
      default:
        return colors.textDim;
    }
  }

  const enteredCount = marks.filter((m) => m.obtained !== "").length;
  const passedCount = marks.filter(
    (m) =>
      m.obtained !== "" &&
      selectedExam &&
      Number(m.obtained) >= selectedExam.passingMarks
  ).length;
  const failedCount = enteredCount - passedCount;

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
                <Text style={styles.badgeText}>MARKS ENTRY</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Enter Marks</Text>
            <Text style={styles.heroSubtitle}>
              Select an exam and enter marks for every student.
            </Text>
          </LinearGradient>

          {/* Exam Selector */}
          {!loading && exams.length > 0 && (
            <Card style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>SELECT EXAM</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorContent}
              >
                {exams.map((exam) => {
                  const isActive = selectedExamId === exam.id;
                  return (
                    <TouchableOpacity
                      key={exam.id}
                      style={[
                        styles.examBtn,
                        isActive && styles.examBtnActive,
                      ]}
                      onPress={() => handleSelectExam(exam.id)}
                      activeOpacity={0.7}
                    >
                      <FileText
                        size={14}
                        color={isActive ? colors.white : colors.textDim}
                      />
                      <Text
                        style={[
                          styles.examBtnText,
                          isActive && styles.examBtnTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {exam.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Card>
          )}

          {/* Stats */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
            style={styles.statsScrollView}
          >
            <StatCard
              label="TOTAL"
              value={marks.length}
              icon={Users}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="ENTERED"
              value={enteredCount}
              icon={Trophy}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
            <StatCard
              label="PASSED"
              value={passedCount}
              icon={Award}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="FAILED"
              value={failedCount}
              icon={XCircle}
              gradient={["#EF4444", "#DC2626"]}
            />
          </ScrollView>

          {/* Marks Card */}
          {loading && (
            <Card style={styles.marksCard}>
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading exams...</Text>
              </View>
            </Card>
          )}

          {!loading && errorMsg !== "" && (
            <Card style={styles.marksCard}>
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadExams}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {!loading && !errorMsg && exams.length === 0 && (
            <Card style={styles.marksCard}>
              <EmptyState
                icon={FileText}
                title="No exams yet"
                description="Create an exam first to enter marks for students."
              />
            </Card>
          )}

          {!loading && selectedExam && (
            <Card style={styles.marksCard}>
              <View style={styles.marksHeader}>
                <View>
                  <Text style={styles.marksTitle}>{selectedExam.title}</Text>
                  <Text style={styles.marksSubtitle}>
                    Total: {selectedExam.totalMarks} • Passing:{" "}
                    {selectedExam.passingMarks}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {loadingMarks && (
                <View style={styles.stateBox}>
                  <ActivityIndicator size="small" color={colors.cyan} />
                  <Text style={styles.stateText}>Loading students...</Text>
                </View>
              )}

              {!loadingMarks && marks.length === 0 && (
                <EmptyState
                  icon={Users}
                  title="No students enrolled"
                  description="Enroll students in this class first."
                />
              )}

              {!loadingMarks && marks.length > 0 && (
                <>
                  <View style={styles.listContainer}>
                    {marks.map((student) => {
                      const grade = getGrade(student.obtained);
                      const gradeColor = getGradeColor(grade);

                      return (
                        <View key={student.id} style={styles.markRow}>
                          <View style={styles.avatar}>
                            <LinearGradient
                              colors={["#4F46E5", "#6366F1"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.avatarGradient}
                            >
                              <Text style={styles.avatarText}>
                                {student.name.charAt(0).toUpperCase()}
                              </Text>
                            </LinearGradient>
                          </View>

                          <View style={styles.studentInfo}>
                            <Text style={styles.studentName}>
                              {student.name}
                            </Text>
                            <Text style={styles.studentMeta}>
                              Roll: {student.rollNumber}
                            </Text>
                          </View>

                          <TextInput
                            value={student.obtained}
                            onChangeText={(v) => updateMark(student.id, v)}
                            placeholder="—"
                            placeholderTextColor={colors.textDim}
                            keyboardType="numeric"
                            style={styles.markInput}
                          />

                          <View
                            style={[
                              styles.gradeBadge,
                              {
                                backgroundColor: `${gradeColor}22`,
                                borderColor: `${gradeColor}55`,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.gradeText,
                                { color: gradeColor },
                              ]}
                            >
                              {grade}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  <TouchableOpacity
                    style={styles.saveWrapper}
                    onPress={handleSave}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={["#4F46E5", "#06B6D4"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.saveBtn}
                    >
                      <Save size={16} color={colors.white} />
                      <Text style={styles.saveText}>Save All Marks</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </Card>
          )}
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
    fontSize: 30,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },

  selectorCard: {
    padding: spacing.lg,
    marginBottom: spacing.base,
  },
  selectorLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  selectorContent: {
    gap: spacing.sm,
  },
  examBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    maxWidth: 200,
  },
  examBtnActive: {
    backgroundColor: `${colors.indigo}44`,
    borderColor: colors.indigo,
  },
  examBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  examBtnTextActive: {
    color: colors.white,
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

  marksCard: { padding: spacing.lg, marginBottom: spacing.lg },
  marksHeader: { marginBottom: spacing.base },
  marksTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  marksSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
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

  markRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  avatar: { width: 40, height: 40, borderRadius: radius.md },
  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  studentInfo: { flex: 1 },
  studentName: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
  studentMeta: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  markInput: {
    width: 60,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    textAlign: "center",
  },
  gradeBadge: {
    width: 40,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  gradeText: {
    fontSize: 11,
    fontWeight: fontWeight.black,
  },

  saveWrapper: { marginTop: spacing.lg },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
    borderRadius: radius.lg,
  },
  saveText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
});