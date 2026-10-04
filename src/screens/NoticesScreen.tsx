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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  Plus,
  Bell,
  FileText,
  CalendarDays,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import { FormInput, FormModal } from "../components/ui/FormInput";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type NoticesScreenProps = {
  onBack?: () => void;
};

type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  publishDate: string;
};

const emptyForm = {
  title: "",
  content: "",
  category: "GENERAL",
  status: "PUBLISHED",
  publishDate: "",
};

// Demo data — backend API for notices not yet created
const demoNotices: Notice[] = [
  {
    id: "1",
    title: "Mid Term Exams Start Next Week",
    content:
      "All students are informed that mid term examinations will commence from 15th January 2026. Please check your exam schedule.",
    category: "ACADEMIC",
    status: "PUBLISHED",
    publishDate: "2026-01-08",
  },
  {
    id: "2",
    title: "Annual Sports Day Announcement",
    content:
      "The annual sports day will be held on 25th January 2026. All students are encouraged to participate.",
    category: "EVENT",
    status: "PUBLISHED",
    publishDate: "2026-01-05",
  },
  {
    id: "3",
    title: "Winter Break Notice",
    content:
      "School will remain closed from 22nd December to 2nd January for winter break.",
    category: "HOLIDAY",
    status: "DRAFT",
    publishDate: "2025-12-15",
  },
];

export default function NoticesScreen({ onBack }: NoticesScreenProps) {
  const [notices, setNotices] = useState<Notice[]>(demoNotices);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = notices.filter((n) =>
    `${n.title} ${n.content} ${n.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const publishedCount = notices.filter(
    (n) => n.status === "PUBLISHED"
  ).length;
  const draftCount = notices.filter((n) => n.status === "DRAFT").length;

  function openAddForm() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      publishDate: new Date().toISOString().slice(0, 10),
    });
    setShowForm(true);
  }

  function openEditForm(notice: Notice) {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      status: notice.status,
      publishDate: notice.publishDate,
    });
    setShowForm(true);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert("Missing Fields", "Please fill title and content.");
      return;
    }

    setSaving(true);

    setTimeout(() => {
      if (editingId) {
        setNotices((prev) =>
          prev.map((n) => (n.id === editingId ? { ...n, ...form } : n))
        );
        Alert.alert("Success", "Notice updated.");
      } else {
        const newNotice: Notice = {
          id: Date.now().toString(),
          ...form,
        };
        setNotices((prev) => [newNotice, ...prev]);
        Alert.alert("Success", "Notice published.");
      }

      setSaving(false);
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
    }, 500);
  }

  function deleteNotice(id: string) {
    Alert.alert("Delete Notice", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          setNotices((prev) => prev.filter((n) => n.id !== id)),
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
                <Text style={styles.badgeText}>ANNOUNCEMENTS</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Notices & Updates</Text>
            <Text style={styles.heroSubtitle}>
              Publish announcements, events and important updates for students,
              teachers and parents.
            </Text>

            <View style={styles.heroButtonsWrap}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={openAddForm}
                activeOpacity={0.85}
              >
                <Plus size={14} color={colors.navyDark} />
                <Text style={styles.heroBtnText}>Create Notice</Text>
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
              label="TOTAL NOTICES"
              value={notices.length}
              icon={Bell}
              gradient={["#4F46E5", "#4338CA"]}
            />
            <StatCard
              label="PUBLISHED"
              value={publishedCount}
              icon={CheckCircle2}
              gradient={["#10B981", "#0D9488"]}
            />
            <StatCard
              label="DRAFTS"
              value={draftCount}
              icon={Clock}
              gradient={["#F59E0B", "#EA580C"]}
            />
          </ScrollView>

          {/* Directory */}
          <Card style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View>
                <Text style={styles.directoryTitle}>Notice Board</Text>
                <Text style={styles.directoryCount}>
                  {filtered.length} of {notices.length} notices
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
                placeholder="Search notices..."
                placeholderTextColor={colors.textDim}
                style={styles.searchInput}
              />
            </View>

            <View style={styles.divider} />

            {filtered.length === 0 ? (
              <View style={styles.stateBox}>
                <Bell size={32} color={colors.textDim} />
                <Text style={styles.stateText}>No notices found</Text>
                <Text style={styles.stateSubtext}>
                  Create your first notice to get started
                </Text>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filtered.map((item) => (
                  <NoticeCard
                    key={item.id}
                    notice={item}
                    onEdit={openEditForm}
                    onDelete={deleteNotice}
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
          title={editingId ? "Update Notice" : "Create Notice"}
          subtitle={editingId ? "NOTICE EDITOR" : "NEW ANNOUNCEMENT"}
          onSubmit={handleSubmit}
          submitLabel={editingId ? "Save Changes" : "Publish Notice"}
          loading={saving}
        >
          <FormInput
            label="Title"
            value={form.title}
            onChangeText={(v) => updateField("title", v)}
            placeholder="Notice title"
            required
          />
          <FormInput
            label="Content"
            value={form.content}
            onChangeText={(v) => updateField("content", v)}
            placeholder="Notice details..."
            required
          />
          <FormInput
            label="Category"
            value={form.category}
            onChangeText={(v) => updateField("category", v)}
            placeholder="ACADEMIC / EVENT / HOLIDAY"
            autoCapitalize="characters"
          />
          <FormInput
            label="Status"
            value={form.status}
            onChangeText={(v) => updateField("status", v)}
            placeholder="PUBLISHED / DRAFT"
            autoCapitalize="characters"
          />
          <FormInput
            label="Publish Date"
            value={form.publishDate}
            onChangeText={(v) => updateField("publishDate", v)}
            placeholder="Select publish date"
            type="date"
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

function NoticeCard({
  notice,
  onEdit,
  onDelete,
}: {
  notice: Notice;
  onEdit: (n: Notice) => void;
  onDelete: (id: string) => void;
}) {
  const isPublished = notice.status === "PUBLISHED";
  const date = new Date(notice.publishDate);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.noticeCard}>
      <View style={styles.noticeRow}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={["#F59E0B", "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noticeAvatar}
          >
            <Bell size={22} color={colors.white} />
          </LinearGradient>
        </View>

        <View style={styles.noticeInfo}>
          <Text style={styles.noticeTitle} numberOfLines={2}>
            {notice.title}
          </Text>
          <Text style={styles.noticeContent} numberOfLines={2}>
            {notice.content}
          </Text>

          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{notice.category}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isPublished
                  ? styles.statusPublished
                  : styles.statusDraft,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isPublished
                    ? styles.statusTextPublished
                    : styles.statusTextDraft,
                ]}
              >
                {notice.status}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.infoRows}>
        <InfoRow
          icon={CalendarDays}
          label="Published"
          value={formattedDate}
        />
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(notice)}
        >
          <FileText size={13} color={colors.indigoLight} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(notice.id)}
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
  stateSubtext: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },

  noticeCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  noticeRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarWrapper: { position: "relative" },
  noticeAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeInfo: { flex: 1 },
  noticeTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
    lineHeight: 20,
  },
  noticeContent: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 4,
    lineHeight: 16,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: `${colors.cyan}22`,
    borderWidth: 1,
    borderColor: `${colors.cyan}55`,
  },
  categoryText: {
    color: colors.cyan,
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPublished: {
    backgroundColor: `${colors.emerald}22`,
    borderColor: `${colors.emerald}55`,
  },
  statusDraft: {
    backgroundColor: `${colors.amber}22`,
    borderColor: `${colors.amber}55`,
  },
  statusText: {
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusTextPublished: { color: colors.emeraldLight },
  statusTextDraft: { color: colors.amber },

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