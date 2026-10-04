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
  UserCheck,
  GraduationCap,
  UserX,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import { FormInput, FormModal, FormSelect } from "../components/ui/FormInput";
import { studentsApi } from "../api/client";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type StudentsScreenProps = {
  onBack?: () => void;
};

type Student = {
  id: string;
  fullName: string;
  studentId: string;
  admissionNumber: string;
  fatherName: string;
  motherName: string;
  guardianName: string;
  dateOfBirth: string;
  gender: string;
  rollNumber: string;
  contactNumber: string;
  parentContact: string;
  address: string;
  emergencyContact: string;
  previousSchool: string;
  medicalNotes: string;
  status: string;
};

const emptyForm = {
  fullName: "",
  studentId: "",
  admissionNumber: "",
  fatherName: "",
  motherName: "",
  guardianName: "",
  dateOfBirth: "",
  gender: "",
  rollNumber: "",
  contactNumber: "",
  parentContact: "",
  address: "",
  emergencyContact: "",
  previousSchool: "",
  medicalNotes: "",
};

export default function StudentsScreen({ onBack }: StudentsScreenProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await studentsApi.list();
      console.log("✅ Students loaded:", data.length);

      setStudents(
        data.map((s: any) => ({
          id: s.id,
          fullName: s.fullName || "",
          studentId: s.studentId || "",
          admissionNumber: s.admissionNumber || "",
          fatherName: s.fatherName || "",
          motherName: s.motherName || "",
          guardianName: s.guardianName || "",
          dateOfBirth: s.dateOfBirth || "",
          gender: s.gender || "",
          rollNumber: s.rollNumber || "",
          contactNumber: s.contactNumber || "",
          parentContact: s.parentContact || "",
          address: s.address || "",
          emergencyContact: s.emergencyContact || "",
          previousSchool: s.previousSchool || "",
          medicalNotes: s.medicalNotes || "",
          status: s.status || "ACTIVE",
        }))
      );
    } catch (err) {
      console.error("❌ Load students error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  // ✅ Pull-to-Refresh handler
  async function onRefresh() {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  }

  const filtered = students.filter((s) =>
    `${s.fullName} ${s.studentId} ${s.fatherName} ${s.admissionNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const maleCount = students.filter(
    (s) => (s.gender || "").toUpperCase() === "MALE"
  ).length;
  const femaleCount = students.filter(
    (s) => (s.gender || "").toUpperCase() === "FEMALE"
  ).length;

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(student: Student) {
    setEditingId(student.id);
    setForm({
      fullName: student.fullName,
      studentId: student.studentId,
      admissionNumber: student.admissionNumber,
      fatherName: student.fatherName,
      motherName: student.motherName,
      guardianName: student.guardianName,
      dateOfBirth: student.dateOfBirth
        ? student.dateOfBirth.slice(0, 10)
        : "",
      gender: student.gender,
      rollNumber: student.rollNumber,
      contactNumber: student.contactNumber,
      parentContact: student.parentContact,
      address: student.address,
      emergencyContact: student.emergencyContact,
      previousSchool: student.previousSchool,
      medicalNotes: student.medicalNotes,
    });
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.fullName.trim()) {
      Alert.alert("Missing Field", "Please enter student name.");
      return;
    }

    setSaving(true);
    try {
      const autoStudentId =
        form.studentId.trim() ||
        `STU-${Date.now().toString().slice(-6)}`;
      const autoAdmission =
        form.admissionNumber.trim() ||
        `ADM-${Date.now().toString().slice(-6)}`;

      const payload: any = {
        studentId: autoStudentId,
        admissionNumber: autoAdmission,
        fullName: form.fullName.trim(),
        fatherName: form.fatherName.trim() || null,
        motherName: form.motherName.trim() || null,
        guardianName: form.guardianName.trim() || null,
        dateOfBirth: form.dateOfBirth.trim() || null,
        gender: form.gender.trim() || null,
        rollNumber: form.rollNumber.trim() || null,
        contactNumber: form.contactNumber.trim() || null,
        parentContact: form.parentContact.trim() || null,
        address: form.address.trim() || null,
        emergencyContact: form.emergencyContact.trim() || null,
        previousSchool: form.previousSchool.trim() || null,
      };

      if (editingId) {
        await studentsApi.update({ id: editingId, ...payload });
        Alert.alert("Success", "Student updated.");
      } else {
        await studentsApi.create(payload);
        Alert.alert("Success", "Student registered.");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      console.error("Save error:", err);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save student"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteStudent(id: string) {
    Alert.alert("Delete Student", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await studentsApi.delete(id);
            Alert.alert("Success", "Student deleted.");
            await loadStudents();
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
                <Text style={styles.badgeText}>ACADEMIC RECORDS</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Student Management</Text>
            <Text style={styles.heroSubtitle}>
              Manage student registrations, profiles, contact information,
              academic identity and enrollment records.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Add New Student</Text>
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
              label="ACTIVE"
              value={activeCount}
              icon={UserCheck}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="MALE"
              value={maleCount}
              icon={GraduationCap}
              gradient={["#8B5CF6", "#6366F1"]}
            />
            <StatCard
              label="FEMALE"
              value={femaleCount}
              icon={UserX}
              gradient={["#EC4899", "#F43F5E"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Student Directory</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {students.length} students displayed
                </Text>
              </View>
            </View>

            <View style={styles.searchWrapper}>
              <Search size={16} color={colors.textDim} style={styles.searchIcon} />
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
                <Text style={styles.stateText}>Loading students...</Text>
              </View>
            )}

            {!loading && errorMsg !== "" && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {errorMsg}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={loadStudents}>
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
                    : "Add your first student to get started with the school management system."
                }
                actionLabel={search.trim() ? undefined : "Add Student"}
                onAction={search.trim() ? undefined : openAddForm}
              />
            )}

            {!loading && !errorMsg && filtered.length > 0 && (
              <View style={styles.listContainer}>
                {filtered.map((student, index) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={index}
                    onEdit={openEditForm}
                    onDelete={deleteStudent}
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
          title={editingId ? "Update Student" : "Register New Student"}
          subtitle={editingId ? "PROFILE EDITOR" : "NEW REGISTRATION"}
          onSubmit={handleSubmit}
          submitLabel={editingId ? "Save Changes" : "Register Student"}
          loading={saving}
        >
          <FormInput
            label="Full Name"
            value={form.fullName}
            onChangeText={(v) => updateField("fullName", v)}
            placeholder="Student full name"
            required
          />
          <FormInput
            label="Student ID (auto if empty)"
            value={form.studentId}
            onChangeText={(v) => updateField("studentId", v)}
            placeholder="STU-001 (optional)"
            autoCapitalize="characters"
          />
          <FormInput
            label="Admission Number (auto if empty)"
            value={form.admissionNumber}
            onChangeText={(v) => updateField("admissionNumber", v)}
            placeholder="ADM-2026-001 (optional)"
            autoCapitalize="characters"
          />
          <FormInput
            label="Father Name"
            value={form.fatherName}
            onChangeText={(v) => updateField("fatherName", v)}
            placeholder="Father name (optional)"
          />
          <FormInput
            label="Mother Name"
            value={form.motherName}
            onChangeText={(v) => updateField("motherName", v)}
            placeholder="Mother name (optional)"
          />
          <FormInput
            label="Guardian Name"
            value={form.guardianName}
            onChangeText={(v) => updateField("guardianName", v)}
            placeholder="Guardian name (optional)"
          />
          <FormInput
            label="Date of Birth"
            value={form.dateOfBirth}
            onChangeText={(v) => updateField("dateOfBirth", v)}
            placeholder="Select date of birth"
            type="date"
          />
          <FormSelect
            label="Gender"
            value={form.gender}
            onChangeText={(v) => updateField("gender", v)}
            options={["MALE", "FEMALE", "OTHER"]}
          />
          <FormInput
            label="Roll Number"
            value={form.rollNumber}
            onChangeText={(v) => updateField("rollNumber", v)}
            placeholder="01 (optional)"
          />
          <FormInput
            label="Student Contact"
            value={form.contactNumber}
            onChangeText={(v) => updateField("contactNumber", v)}
            placeholder="03XX-XXXXXXX (optional)"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Parent Contact"
            value={form.parentContact}
            onChangeText={(v) => updateField("parentContact", v)}
            placeholder="03XX-XXXXXXX (optional)"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Emergency Contact"
            value={form.emergencyContact}
            onChangeText={(v) => updateField("emergencyContact", v)}
            placeholder="Emergency contact (optional)"
            keyboardType="phone-pad"
          />
          <FormInput
            label="Address"
            value={form.address}
            onChangeText={(v) => updateField("address", v)}
            placeholder="Complete address (optional)"
          />
          <FormInput
            label="Previous School"
            value={form.previousSchool}
            onChangeText={(v) => updateField("previousSchool", v)}
            placeholder="Previous school (optional)"
          />
          <FormInput
            label="Medical Notes"
            value={form.medicalNotes}
            onChangeText={(v) => updateField("medicalNotes", v)}
            placeholder="Medical notes (optional)"
          />
        </FormModal>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────

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

function StudentCard({
  student,
  index,
  onEdit,
  onDelete,
}: {
  student: Student;
  index: number;
  onEdit: (s: Student) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.studentCard}>
      <View style={styles.studentRow}>
        <View style={styles.avatar}>
          <LinearGradient
            colors={["#8B5CF6", "#6366F1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>
              {student.fullName.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>{index + 1}</Text>
          </View>
        </View>

        <View style={styles.studentInfo}>
          <View style={styles.studentNameRow}>
            <Text style={styles.studentName}>{student.fullName}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{student.status}</Text>
            </View>
          </View>

          <Text style={styles.studentMeta}>
            ID: {student.studentId} • {student.admissionNumber || "—"}
          </Text>
          <Text style={styles.studentMeta}>
            {student.gender || "—"} • Roll: {student.rollNumber || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.studentDetails}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>FATHER</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {student.fatherName || "—"}
          </Text>
        </View>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>CONTACT</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {student.contactNumber || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(student)}
        >
          <Pencil size={13} color={colors.indigoLight} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(student.id)}
        >
          <Trash2 size={13} color={colors.redLight} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
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

  studentCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  studentRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: { width: 56, height: 56, borderRadius: radius.lg, position: "relative" },
  avatarGradient: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
  },
  avatarBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.navy,
  },
  avatarBadgeText: {
    color: colors.navy,
    fontSize: 10,
    fontWeight: fontWeight.black,
  },
  studentInfo: { flex: 1, justifyContent: "center" },
  studentNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  studentName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
  },
  statusBadge: {
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
  studentMeta: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  studentDetails: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailBox: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailLabel: {
    color: colors.textDim,
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.6,
  },
  detailValue: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    marginTop: 3,
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