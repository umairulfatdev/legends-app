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
  BookMarked,
  Hash,
  Target,
  Award,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { FormInput, FormModal } from "../components/ui/FormInput";
import { subjectsApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type SubjectsScreenProps = {
  onBack?: () => void;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  totalMarks: string;
  passingMarks: string;
};

const emptyForm = {
  name: "",
  code: "",
  totalMarks: "100",
  passingMarks: "40",
};

export default function SubjectsScreen({ onBack }: SubjectsScreenProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await subjectsApi.list();
      console.log("✅ Subjects loaded:", data.length);

      setSubjects(
        data.map((s: any) => ({
          id: s.id,
          name: s.name || "",
          code: s.code || "",
          totalMarks: String(s.totalMarks || 100),
          passingMarks: String(s.passingMarks || 40),
        }))
      );
    } catch (err) {
      console.error("❌ Load subjects error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load subjects"
      );
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadSubjects);

  const filtered = subjects.filter((s) =>
    `${s.name} ${s.code || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(item: Subject) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      code: item.code || "",
      totalMarks: item.totalMarks || "100",
      passingMarks: item.passingMarks || "40",
    });
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert("Missing Fields", "Please enter subject name.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || null,
        totalMarks: Number(form.totalMarks) || 100,
        passingMarks: Number(form.passingMarks) || 40,
      };

      if (editingId) {
        await subjectsApi.update(editingId, payload as any);
        Alert.alert("Success", "Subject updated.");
      } else {
        await subjectsApi.create(payload as any);
        Alert.alert("Success", "Subject created.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadSubjects();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save subject"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteSubject(id: string) {
    Alert.alert("Delete Subject", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await subjectsApi.delete(id);
            Alert.alert("Success", "Subject deleted.");
            await loadSubjects();
          } catch (err) {
            Alert.alert(
              "Error",
              err instanceof Error ? err.message : "Failed to delete"
            );
          }
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
                <Text style={styles.badgeText}>ACADEMIC SUBJECTS</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Subjects</Text>
            <Text style={styles.heroSubtitle}>
              Manage the subjects offered across classes, along with their
              total marks and passing criteria.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Add Subject</Text>
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
              label="TOTAL SUBJECTS"
              value={subjects.length}
              icon={BookMarked}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="WITH CODES"
              value={subjects.filter((s) => s.code).length}
              icon={Hash}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
            <StatCard
              label="AVG TOTAL"
              value={100}
              icon={Target}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="AVG PASSING"
              value={39}
              icon={Award}
              gradient={["#F59E0B", "#EA580C"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Subject Directory</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {subjects.length} subjects
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
                placeholder="Search subjects..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading subjects...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={loadSubjects}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !errorMsg && filtered.length === 0 && (
              <EmptyState
                icon={BookMarked}
                title={
                  search.trim() ? "No subjects found" : "No subjects yet"
                }
                description={
                  search.trim()
                    ? "Try changing your search to find what you're looking for."
                    : "Add your first subject to get started with the school management system."
                }
                actionLabel={search.trim() ? undefined : "Add Subject"}
                onAction={search.trim() ? undefined : openAddForm}
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((item) => (
                  <SubjectCard
                    key={item.id}
                    item={item}
                    onEdit={openEditForm}
                    onDelete={deleteSubject}
                  />
                ))}
              </View>
            )}
          </Card>
        </ScrollView>

        {/* Form Modal */}
        <FormModal
          visible={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? "Update Subject" : "Create Subject"}
          subtitle={editingId ? "SUBJECT EDITOR" : "NEW SUBJECT"}
          onSubmit={handleSubmit}
          submitLabel={editingId ? "Save Changes" : "Create Subject"}
          loading={saving}
        >
          <FormInput
            label="Subject Name"
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Mathematics"
            required
          />
          <FormInput
            label="Subject Code"
            value={form.code}
            onChangeText={(v) => updateField("code", v)}
            placeholder="MATH-101 (optional)"
            autoCapitalize="characters"
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

function SubjectCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Subject;
  onEdit: (s: Subject) => void;
  onDelete: (id: string) => void;
}) {
  const total = Number(item.totalMarks) || 100;
  const passing = Number(item.passingMarks) || 40;
  const passPercent = Math.round((passing / total) * 100);

  return (
    <View style={styles.subjectCard}>
      <View style={styles.subjectRow}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={["#4F46E5", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subjectAvatar}
          >
            <BookMarked size={24} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          {item.code ? (
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.infoRows}>
        <InfoRow icon={Target} label="Total Marks" value={item.totalMarks} />
        <InfoRow icon={Award} label="Passing Marks" value={item.passingMarks} />
        <InfoRow icon={Hash} label="Pass %" value={`${passPercent}%`} />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(item)}
        >
          <Pencil size={13} color={colors.indigoLight} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(item.id)}
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
        <Text style={styles.infoValue}>{value}</Text>
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
    width: 150,
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

  subjectCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  subjectRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  subjectAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectInfo: { flex: 1, justifyContent: "center" },
  subjectName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  codeBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: `${colors.cyan}22`,
    borderWidth: 1,
    borderColor: `${colors.cyan}55`,
  },
  codeText: {
    color: colors.cyan,
    fontSize: 9,
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
  editBtn: {
    backgroundColor: `${colors.indigo}22`,
    borderColor: `${colors.indigo}55`,
  },
  deleteBtn: {
    backgroundColor: `${colors.red}22`,
    borderColor: `${colors.red}55`,
  },
  editText: {
    color: colors.indigoLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  deleteText: {
    color: colors.redLight,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});