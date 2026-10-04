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
  Plus,
  FileText,
  Calendar,
  Award,
  Clock,
  Trash2,
  ArrowLeft,
  Trophy,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { FormInput, FormModal } from "../components/ui/FormInput";
import { examsApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type ExamsScreenProps = {
  onBack?: () => void;
};

type Exam = {
  id: string;
  title: string;
  type: string;
  classRoom: string;
  subject: string;
  teacher: string;
  totalMarks: string;
  passingMarks: string;
  testDate: string;
  isPublished: boolean;
};

const emptyForm = {
  title: "",
  type: "EXAM",
  classRoom: "",
  subject: "",
  teacher: "",
  totalMarks: "100",
  passingMarks: "40",
  testDate: "",
};

export default function ExamsScreen({ onBack }: ExamsScreenProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
          type: e.type || "EXAM",
          classRoom: e.classRoom?.name || "",
          subject: e.subject?.name || "",
          teacher: e.teacher?.name || "",
          totalMarks: String(e.totalMarks || 100),
          passingMarks: String(e.passingMarks || 40),
          testDate: e.testDate || "",
          isPublished: !!e.isPublished,
        }))
      );
    } catch (err) {
      console.error("❌ Load exams error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadExams);

  const filtered = exams.filter((e) =>
    `${e.title} ${e.classRoom} ${e.subject}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const publishedCount = exams.filter((e) => e.isPublished).length;
  const upcomingCount = exams.filter(
    (e) => new Date(e.testDate) > new Date()
  ).length;

  function openAddForm() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.testDate.trim()) {
      Alert.alert("Missing Fields", "Please fill title and date.");
      return;
    }

    setSaving(true);
    try {
      await examsApi.create({
        title: form.title.trim(),
        type: form.type || "EXAM",
        classId: form.classRoom,
        subjectId: form.subject,
        teacherId: form.teacher,
        totalMarks: Number(form.totalMarks) || 100,
        passingMarks: Number(form.passingMarks) || 40,
        testDate: form.testDate,
      } as any);

      Alert.alert("Success", "Exam created.");
      setShowForm(false);
      setForm(emptyForm);
      await loadExams();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to create exam"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteExam(id: string) {
    Alert.alert("Delete Exam", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setExams((prev) => prev.filter((e) => e.id !== id));
          Alert.alert("Info", "Delete API not yet supported on backend.");
        },
      },
    ]);
  }

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
                <Text style={styles.badgeText}>EXAMINATIONS</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Exams & Tests</Text>
            <Text style={styles.heroSubtitle}>
              Create, schedule and publish exams for every class and subject.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Create Exam</Text>
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
              label="TOTAL EXAMS"
              value={exams.length}
              icon={FileText}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="PUBLISHED"
              value={publishedCount}
              icon={Trophy}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="UPCOMING"
              value={upcomingCount}
              icon={Clock}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
            <StatCard
              label="THIS MONTH"
              value={exams.filter((e) => {
                const d = new Date(e.testDate);
                const now = new Date();
                return (
                  d.getMonth() === now.getMonth() &&
                  d.getFullYear() === now.getFullYear()
                );
              }).length}
              icon={Calendar}
              gradient={["#F59E0B", "#EA580C"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Exam Schedule</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {exams.length} exams
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
                placeholder="Search exams..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading exams...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={loadExams}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !errorMsg && filtered.length === 0 && (
              <EmptyState
                icon={FileText}
                title={search.trim() ? "No exams found" : "No exams yet"}
                description={
                  search.trim()
                    ? "Try changing your search to find what you're looking for."
                    : "Create your first exam to get started with the school management system."
                }
                actionLabel={search.trim() ? undefined : "Create Exam"}
                onAction={search.trim() ? undefined : openAddForm}
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onDelete={deleteExam}
                  />
                ))}
              </View>
            )}
          </Card>
        </ScrollView>

        <FormModal
          visible={showForm}
          onClose={() => setShowForm(false)}
          title="Create Exam"
          subtitle="NEW EXAMINATION"
          onSubmit={handleSubmit}
          submitLabel="Create Exam"
          loading={saving}
        >
          <FormInput
            label="Title"
            value={form.title}
            onChangeText={(v) => updateField("title", v)}
            placeholder="Mid Term Mathematics"
            required
          />
          <FormInput
            label="Type"
            value={form.type}
            onChangeText={(v) => updateField("type", v)}
            placeholder="EXAM / QUIZ / TEST"
            autoCapitalize="characters"
          />
          <FormInput
            label="Class ID"
            value={form.classRoom}
            onChangeText={(v) => updateField("classRoom", v)}
            placeholder="Class ID (from DB)"
          />
          <FormInput
            label="Subject ID"
            value={form.subject}
            onChangeText={(v) => updateField("subject", v)}
            placeholder="Subject ID (from DB)"
          />
          <FormInput
            label="Teacher ID"
            value={form.teacher}
            onChangeText={(v) => updateField("teacher", v)}
            placeholder="Teacher ID (from DB)"
          />
          <FormInput
            label="Total Marks"
            value={form.totalMarks}
            onChangeText={(v) => updateField("totalMarks", v)}
            placeholder="100"
            keyboardType="numeric"
          />
          <FormInput
            label="Passing Marks"
            value={form.passingMarks}
            onChangeText={(v) => updateField("passingMarks", v)}
            placeholder="40"
            keyboardType="numeric"
          />
          <FormInput
            label="Exam Date"
            value={form.testDate}
            onChangeText={(v) => updateField("testDate", v)}
            placeholder="Select exam date"
            type="date"
            required
          />
        </FormModal>
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

function ExamCard({
  exam,
  onDelete,
}: {
  exam: Exam;
  onDelete: (id: string) => void;
}) {
  const date = new Date(exam.testDate);
  const isUpcoming = date > new Date();
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.examCard}>
      <View style={styles.examRow}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.examAvatar}
          >
            <FileText size={24} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.examInfo}>
          <Text style={styles.examTitle} numberOfLines={2}>
            {exam.title}
          </Text>
          <Text style={styles.examMeta}>
            {exam.subject || "—"} • {exam.classRoom || "—"}
          </Text>

          <View style={styles.badgesRow}>
            {exam.isPublished ? (
              <View style={[styles.badgeStatus, styles.badgePublished]}>
                <Text style={styles.badgeStatusText}>PUBLISHED</Text>
              </View>
            ) : (
              <View style={[styles.badgeStatus, styles.badgeDraft]}>
                <Text style={styles.badgeStatusText}>DRAFT</Text>
              </View>
            )}

            {isUpcoming ? (
              <View style={[styles.badgeStatus, styles.badgeUpcoming]}>
                <Text style={styles.badgeStatusText}>UPCOMING</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.infoRows}>
        <InfoRow icon={Calendar} label="Date" value={formattedDate} />
        <InfoRow
          icon={Trophy}
          label="Marks"
          value={`${exam.passingMarks} / ${exam.totalMarks}`}
        />
        {exam.teacher ? (
          <InfoRow icon={Award} label="Teacher" value={exam.teacher} />
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(exam.id)}
        >
          <Trash2 size={13} color={colors.redLight} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
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
        <Icon size={13} color={colors.textDim} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label.toUpperCase()}</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
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
  heroButtonsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  heroBtnText: {
    color: colors.navyDark,
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
    width: 140,
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

  examCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  examRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  examAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  examInfo: { flex: 1 },
  examTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    lineHeight: 20,
  },
  examMeta: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  badgeStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgePublished: {
    backgroundColor: `${colors.emerald}22`,
    borderColor: `${colors.emerald}55`,
  },
  badgeDraft: {
    backgroundColor: `${colors.amber}22`,
    borderColor: `${colors.amber}55`,
  },
  badgeUpcoming: {
    backgroundColor: `${colors.cyan}22`,
    borderColor: `${colors.cyan}55`,
  },
  badgeStatusText: {
    color: colors.text,
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },

  infoRows: { gap: spacing.sm, marginBottom: spacing.md },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "rgba(255,255,255,0.03)",
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
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },

  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  deleteBtn: {
    backgroundColor: `${colors.red}22`,
    borderColor: `${colors.red}55`,
  },
  deleteText: {
    color: colors.redLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});