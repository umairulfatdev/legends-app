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
  BookOpen,
  Hash,
  Users,
  GraduationCap,
  Trash2,
  ArrowLeft,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { FormInput, FormModal } from "../components/ui/FormInput";
import { classesApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type ClassesScreenProps = {
  onBack?: () => void;
};

type ClassRoom = {
  id: string;
  name: string;
  section: string;
  roomNumber: string;
  capacity: string;
  classTeacher: string;
  status: string;
};

const emptyForm = {
  name: "",
  section: "",
  roomNumber: "",
  capacity: "",
  classTeacher: "",
  status: "ACTIVE",
};

export default function ClassesScreen({ onBack }: ClassesScreenProps) {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    try {
      setLoading(true);
      setErrorMsg("");

      const raw = await classesApi.list();
      console.log("📦 Raw classes data:", raw);

      const dataArray = Array.isArray(raw)
        ? raw
        : (raw as any)?.classes || [];

      console.log("✅ Classes loaded:", dataArray.length);

      setClasses(
        dataArray.map((c: any) => ({
          id: c.id,
          name: c.name || "",
          section: c.section || "",
          roomNumber: c.roomNumber || "",
          capacity: c.capacity ? String(c.capacity) : "",
          classTeacher: c.classTeacher?.name || c.classTeacher || "",
          status: c.status || "ACTIVE",
        }))
      );
    } catch (err) {
      console.error("❌ Load classes error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load classes"
      );
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadClasses);

  const filtered = classes.filter((c) =>
    `${c.name} ${c.section} ${c.roomNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalCapacity = classes.reduce(
    (sum, c) => sum + (Number(c.capacity) || 0),
    0
  );
  const sections = classes.filter((c) => c.section).length;

  function openAddForm() {
    setForm(emptyForm);
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert("Missing Field", "Please enter class name.");
      return;
    }

    setSaving(true);
    try {
      await classesApi.create({
        name: form.name.trim(),
        code: form.section.trim() || null,
      } as any);

      Alert.alert("Success", "Class created.");
      setShowForm(false);
      setForm(emptyForm);
      await loadClasses();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save class"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteClass(id: string) {
    Alert.alert("Delete Class", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await classesApi.delete(id);
            Alert.alert("Success", "Class deleted.");
            await loadClasses();
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
                <Text style={styles.badgeText}>ACADEMIC STRUCTURE</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Classes & Sections</Text>
            <Text style={styles.heroSubtitle}>
              Manage classrooms, sections, room allocations and academic
              structure.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Add New Class</Text>
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
              label="TOTAL CLASSES"
              value={classes.length}
              icon={BookOpen}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="SECTIONS"
              value={sections}
              icon={Hash}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
            <StatCard
              label="TOTAL CAPACITY"
              value={totalCapacity}
              icon={Users}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="ACADEMIC YEAR"
              value={new Date().getFullYear()}
              icon={GraduationCap}
              gradient={["#F59E0B", "#EA580C"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Class Directory</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {classes.length} classes
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
                placeholder="Search classes..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading classes...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={loadClasses}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !errorMsg && filtered.length === 0 && (
              <EmptyState
                icon={BookOpen}
                title={search.trim() ? "No classes found" : "No classes yet"}
                description={
                  search.trim()
                    ? "Try changing your search to find what you're looking for."
                    : "Add your first class to get started with the school management system."
                }
                actionLabel={search.trim() ? undefined : "Add Class"}
                onAction={search.trim() ? undefined : openAddForm}
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((item) => (
                  <ClassCard
                    key={item.id}
                    item={item}
                    onDelete={deleteClass}
                  />
                ))}
              </View>
            )}
          </Card>
        </ScrollView>

        <FormModal
          visible={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Class"
          subtitle="NEW CLASSROOM"
          onSubmit={handleSubmit}
          submitLabel="Create Class"
          loading={saving}
        >
          <FormInput
            label="Class Name"
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Class 10"
            required
          />
          <FormInput
            label="Section"
            value={form.section}
            onChangeText={(v) => updateField("section", v)}
            placeholder="A (optional)"
            autoCapitalize="characters"
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

function ClassCard({
  item,
  onDelete,
}: {
  item: ClassRoom;
  onDelete: (id: string) => void;
}) {
  const classNumber =
    item.name.replace(/[^0-9]/g, "").slice(0, 2) || "CL";

  return (
    <View style={styles.classCard}>
      <View style={styles.classRow}>
        <View style={styles.classAvatarWrapper}>
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.classAvatar}
          >
            <Text style={styles.classAvatarText}>{classNumber}</Text>
          </LinearGradient>
        </View>

        <View style={styles.classInfo}>
          <View style={styles.classNameRow}>
            <Text style={styles.className}>{item.name}</Text>
            {item.section ? (
              <Text style={styles.classSection}>• {item.section}</Text>
            ) : null}
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.status || "ACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRows}>
        {item.classTeacher ? (
          <InfoRow
            icon={GraduationCap}
            label="Class Teacher"
            value={item.classTeacher}
          />
        ) : null}
      </View>

      <View style={styles.actionsRow}>
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

  classCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  classRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  classAvatarWrapper: { position: "relative" },
  classAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  classAvatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: fontWeight.black,
  },
  classInfo: { flex: 1, justifyContent: "center" },
  classNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 4,
  },
  className: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  classSection: {
    color: colors.cyan,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: `${colors.emerald}22`,
    borderWidth: 1,
    borderColor: `${colors.emerald}55`,
  },
  statusText: {
    color: colors.emeraldLight,
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