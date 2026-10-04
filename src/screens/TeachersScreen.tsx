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
  Users,
  Award,
  GraduationCap,
  UserX,
  Pencil,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { FormInput, FormModal, FormSelect } from "../components/ui/FormInput";
import { teachersApi } from "../api/client";
import { useRefresh } from "../hooks/useRefresh";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type TeachersScreenProps = {
  onBack?: () => void;
};

type Teacher = {
  id: string;
  teacherId: string;
  name: string;
  qualification: string;
  contactNumber: string;
  email: string;
  address: string;
  joiningDate: string;
  employmentStatus: string;
};

const emptyForm = {
  teacherId: "",
  name: "",
  qualification: "",
  contactNumber: "",
  email: "",
  address: "",
  joiningDate: "",
  employmentStatus: "ACTIVE",
};

export default function TeachersScreen({ onBack }: TeachersScreenProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await teachersApi.list();
      console.log("✅ Teachers loaded:", data.length);

      setTeachers(
        data.map((t: any) => ({
          id: t.id,
          teacherId: t.teacherId || "",
          name: t.name || "",
          qualification: t.qualification || "",
          contactNumber: t.contactNumber || "",
          email: t.email || "",
          address: t.address || "",
          joiningDate: t.joiningDate || "",
          employmentStatus: t.employmentStatus || "ACTIVE",
        }))
      );
    } catch (err) {
      console.error("❌ Load teachers error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load teachers"
      );
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh hook
  const { refreshing, onRefresh } = useRefresh(loadTeachers);

  const filtered = teachers.filter((t) =>
    `${t.name} ${t.teacherId} ${t.email} ${t.qualification}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = teachers.filter(
    (t) => (t.employmentStatus || "").toUpperCase() === "ACTIVE"
  ).length;

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({
      teacherId: teacher.teacherId,
      name: teacher.name,
      qualification: teacher.qualification,
      contactNumber: teacher.contactNumber,
      email: teacher.email,
      address: teacher.address,
      joiningDate: teacher.joiningDate,
      employmentStatus: teacher.employmentStatus || "ACTIVE",
    });
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert("Missing Field", "Please enter teacher name.");
      return;
    }

    setSaving(true);
    try {
      const autoTeacherId =
        form.teacherId.trim() ||
        `TCH-${Date.now().toString().slice(-6)}`;

      const payload: any = {
        teacherId: autoTeacherId,
        name: form.name.trim(),
        qualification: form.qualification.trim() || null,
        contactNumber: form.contactNumber.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        joiningDate: form.joiningDate.trim() || null,
        employmentStatus: form.employmentStatus.trim() || "ACTIVE",
      };

      if (editingId) {
        await teachersApi.update({ id: editingId, ...payload });
        Alert.alert("Success", "Teacher updated.");
      } else {
        await teachersApi.create(payload);
        Alert.alert("Success", "Teacher registered.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadTeachers();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save teacher"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteTeacher(id: string) {
    Alert.alert("Delete Teacher", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await teachersApi.delete(id);
            Alert.alert("Success", "Teacher deleted.");
            await loadTeachers();
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
                <Text style={styles.badgeText}>FACULTY MANAGEMENT</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Our Teachers</Text>
            <Text style={styles.heroSubtitle}>
              Manage teaching staff, qualifications and academic
              responsibilities.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Add New Teacher</Text>
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
              label="TOTAL TEACHERS"
              value={teachers.length}
              icon={Users}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="ACTIVE"
              value={activeCount}
              icon={Award}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="INACTIVE"
              value={teachers.length - activeCount}
              icon={UserX}
              gradient={["#F43F5E", "#E11D48"]}
            />
            <StatCard
              label="FACULTY SIZE"
              value={teachers.length}
              icon={GraduationCap}
              gradient={["#06B6D4", "#0EA5E9"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Faculty Directory</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {teachers.length} teachers displayed
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
                placeholder="Search teachers..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {loading && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.cyan} />
                <Text style={styles.stateText}>Loading teachers...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={loadTeachers}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !errorMsg && filtered.length === 0 && (
              <EmptyState
                icon={Users}
                title={
                  search.trim() ? "No teachers found" : "No teachers yet"
                }
                description={
                  search.trim()
                    ? "Try changing your search to find what you're looking for."
                    : "Add your first teacher to get started with the school management system."
                }
                actionLabel={search.trim() ? undefined : "Add Teacher"}
                onAction={search.trim() ? undefined : openAddForm}
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onEdit={openEditForm}
                    onDelete={deleteTeacher}
                  />
                ))}
              </View>
            )}
          </Card>
        </ScrollView>

        <FormModal
          visible={showForm}
          onClose={() => setShowForm(false)}
          title={editingId ? "Update Teacher" : "Register New Teacher"}
          subtitle={editingId ? "FACULTY EDITOR" : "NEW TEACHER"}
          onSubmit={handleSubmit}
          submitLabel={editingId ? "Save Changes" : "Register Teacher"}
          loading={saving}
        >
          <FormInput
            label="Full Name"
            value={form.name}
            onChangeText={(v) => updateField("name", v)}
            placeholder="Teacher full name"
            required
          />
          <FormInput
            label="Teacher ID (auto if empty)"
            value={form.teacherId}
            onChangeText={(v) => updateField("teacherId", v)}
            placeholder="TCH-001 (optional)"
            autoCapitalize="characters"
          />
          <FormInput
            label="Qualification"
            value={form.qualification}
            onChangeText={(v) => updateField("qualification", v)}
            placeholder="M.Sc, B.Ed (optional)"
          />
          <FormInput
            label="Contact Number"
            value={form.contactNumber}
            onChangeText={(v) => updateField("contactNumber", v)}
            placeholder="03XX-XXXXXXX (optional)"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Email"
            value={form.email}
            onChangeText={(v) => updateField("email", v)}
            placeholder="teacher@school.com (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormInput
            label="Joining Date"
            value={form.joiningDate}
            onChangeText={(v) => updateField("joiningDate", v)}
            placeholder="Select joining date"
            type="date"
          />
          <FormSelect
            label="Employment Status"
            value={form.employmentStatus}
            onChangeText={(v) => updateField("employmentStatus", v)}
            options={["ACTIVE", "INACTIVE", "ON_LEAVE", "LEFT"]}
          />
          <FormInput
            label="Address"
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Complete address (optional)"
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

function TeacherCard({
  teacher,
  onEdit,
  onDelete,
}: {
  teacher: Teacher;
  onEdit: (t: Teacher) => void;
  onDelete: (id: string) => void;
}) {
  const isActive =
    (teacher.employmentStatus || "").toUpperCase() === "ACTIVE";

  const initials = teacher.name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const joinedDate = teacher.joiningDate
    ? new Date(teacher.joiningDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <View style={styles.teacherCard}>
      <View style={styles.teacherRow}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={["#06B6D4", "#3B82F6", "#F59E0B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials || "T"}</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacher.name}
          </Text>
          <Text style={styles.teacherQual} numberOfLines={1}>
            {teacher.qualification || "Faculty Member"}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isActive ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isActive
                  ? styles.statusTextActive
                  : styles.statusTextInactive,
              ]}
            >
              {teacher.employmentStatus || "ACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRows}>
        <InfoRow
          icon={GraduationCap}
          label="ID"
          value={teacher.teacherId || "—"}
        />
        {teacher.email ? (
          <InfoRow icon={Mail} label="Email" value={teacher.email} />
        ) : null}
        {teacher.contactNumber ? (
          <InfoRow icon={Phone} label="Phone" value={teacher.contactNumber} />
        ) : null}
        {joinedDate ? (
          <InfoRow icon={CalendarDays} label="Joined" value={joinedDate} />
        ) : null}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(teacher)}
        >
          <Pencil size={13} color={colors.indigoLight} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(teacher.id)}
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

  teacherCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  teacherRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  teacherInfo: { flex: 1, justifyContent: "center" },
  teacherName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  teacherQual: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    marginTop: 6,
  },
  statusActive: {
    backgroundColor: `${colors.emerald}22`,
    borderColor: `${colors.emerald}55`,
  },
  statusInactive: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusTextActive: { color: colors.emeraldLight },
  statusTextInactive: { color: colors.textMuted },

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