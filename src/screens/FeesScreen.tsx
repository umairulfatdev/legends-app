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
  Wallet,
  Layers,
  Receipt,
  BarChart3,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";

import Card from "../components/ui/Card";
import { FormInput, FormModal } from "../components/ui/FormInput";
import { feeTypesApi, feeReportsApi, FeeSummary } from "../api/client";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type FeesScreenProps = {
  onBack?: () => void;
};

type TabType = "types" | "structures" | "collections" | "reports";

type FeeType = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

export default function FeesScreen({ onBack }: FeesScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>("types");

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
                <Text style={styles.badgeText}>FINANCE MODULE</Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>Fees Management</Text>
            <Text style={styles.heroSubtitle}>
              Manage the complete fee lifecycle — from defining types to
              collecting payments and generating reports.
            </Text>
          </LinearGradient>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            style={styles.tabsScroll}
          >
            <TabButton
              label="Fee Types"
              icon={Wallet}
              active={activeTab === "types"}
              onPress={() => setActiveTab("types")}
            />
            <TabButton
              label="Structures"
              icon={Layers}
              active={activeTab === "structures"}
              onPress={() => setActiveTab("structures")}
            />
            <TabButton
              label="Collections"
              icon={Receipt}
              active={activeTab === "collections"}
              onPress={() => setActiveTab("collections")}
            />
            <TabButton
              label="Reports"
              icon={BarChart3}
              active={activeTab === "reports"}
              onPress={() => setActiveTab("reports")}
            />
          </ScrollView>

          {activeTab === "types" && <TypesTab />}
          {activeTab === "structures" && <StructuresTab />}
          {activeTab === "collections" && <CollectionsTab />}
          {activeTab === "reports" && <ReportsTab />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────
// TAB BUTTON
// ─────────────────────────────────────────

function TabButton({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: any;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Icon size={16} color={active ? colors.white : colors.textMuted} />
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────
// TYPES TAB — Real API
// ─────────────────────────────────────────

function TypesTab() {
  const [types, setTypes] = useState<FeeType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: "true",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await feeTypesApi.list();
      console.log("✅ Fee types loaded:", data.length);

      setTypes(
        data.map((t: any) => ({
          id: t.id,
          name: t.name || "",
          description: t.description || "",
          isActive: t.isActive !== false,
        }))
      );
    } catch (err) {
      console.error("❌ Load fee types error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const filtered = types.filter((t) =>
    `${t.name} ${t.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = types.filter((t) => t.isActive).length;

  function openAdd() {
    setEditingId(null);
    setForm({ name: "", description: "", isActive: "true" });
    setShowForm(true);
  }

  function openEdit(item: FeeType) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      isActive: item.isActive ? "true" : "false",
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      Alert.alert("Missing", "Please enter fee type name.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await feeTypesApi.update(editingId, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          isActive: form.isActive === "true",
        } as any);
        Alert.alert("Success", "Fee type updated.");
      } else {
        await feeTypesApi.create({
          name: form.name.trim(),
          description: form.description.trim() || null,
          isActive: form.isActive === "true",
        } as any);
        Alert.alert("Success", "Fee type created.");
      }
      setShowForm(false);
      setEditingId(null);
      await loadTypes();
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  }

  function deleteItem(id: string) {
    Alert.alert("Delete Fee Type", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await feeTypesApi.delete(id);
            Alert.alert("Success", "Fee type deleted.");
            await loadTypes();
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
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContent}
        style={styles.statsScroll}
      >
        <StatCard
          label="TOTAL TYPES"
          value={types.length}
          icon={Wallet}
          gradient={["#4F46E5", "#4338CA"]}
        />
        <StatCard
          label="ACTIVE"
          value={activeCount}
          icon={CheckCircle2}
          gradient={["#10B981", "#0D9488"]}
        />
        <StatCard
          label="INACTIVE"
          value={types.length - activeCount}
          icon={AlertCircle}
          gradient={["#EF4444", "#DC2626"]}
        />
      </ScrollView>

      <Card style={styles.contentCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Fee Types</Text>
            <Text style={styles.cardSubtitle}>
              {filtered.length} of {types.length} types
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Plus size={16} color={colors.navyDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <Search size={16} color={colors.textDim} style={styles.searchIcon} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search fee types..."
            placeholderTextColor={colors.textDim}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.divider} />

        {loading && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={colors.cyan} />
            <Text style={styles.stateText}>Loading fee types...</Text>
          </View>
        )}

        {!loading && errorMsg !== "" && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadTypes}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !errorMsg && filtered.length === 0 && (
          <View style={styles.stateBox}>
            <Wallet size={32} color={colors.textDim} />
            <Text style={styles.stateText}>No fee types yet</Text>
          </View>
        )}

        {!loading && !errorMsg && filtered.length > 0 && (
          <View style={styles.listContainer}>
            {filtered.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemAvatar}>
                    <LinearGradient
                      colors={["#4F46E5", "#6366F1"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.itemAvatarGradient}
                    >
                      <Wallet size={20} color={colors.white} />
                    </LinearGradient>
                  </View>

                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemSubtitle}>
                      {item.description || "No description"}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        item.isActive
                          ? styles.statusActive
                          : styles.statusInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item.isActive
                            ? styles.statusTextActive
                            : styles.statusTextInactive,
                        ]}
                      >
                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => openEdit(item)}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Trash2 size={13} color={colors.redLight} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <FormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Update Fee Type" : "Create Fee Type"}
        subtitle={editingId ? "EDIT CATEGORY" : "NEW CATEGORY"}
        onSubmit={handleSubmit}
        submitLabel={editingId ? "Save Changes" : "Create Type"}
        loading={saving}
      >
        <FormInput
          label="Fee Type Name"
          value={form.name}
          onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          placeholder="Tuition Fee"
          required
        />
        <FormInput
          label="Description"
          value={form.description}
          onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder="Monthly tuition charges (optional)"
        />
      </FormModal>
    </>
  );
}

// ─────────────────────────────────────────
// STRUCTURES TAB
// ─────────────────────────────────────────

function StructuresTab() {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContent}
        style={styles.statsScroll}
      >
        <StatCard
          label="STRUCTURES"
          value={0}
          icon={Layers}
          gradient={["#4F46E5", "#4338CA"]}
        />
        <StatCard
          label="ACTIVE"
          value={0}
          icon={CheckCircle2}
          gradient={["#10B981", "#0D9488"]}
        />
      </ScrollView>

      <Card style={styles.contentCard}>
        <Text style={styles.cardTitle}>Fee Structures</Text>
        <Text style={styles.cardSubtitle}>Amounts per class and fee type</Text>

        <View style={styles.stateBox}>
          <Layers size={32} color={colors.textDim} />
          <Text style={styles.stateText}>Coming soon</Text>
        </View>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────
// COLLECTIONS TAB
// ─────────────────────────────────────────

function CollectionsTab() {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContent}
        style={styles.statsScroll}
      >
        <StatCard
          label="TOTAL"
          value={0}
          icon={Receipt}
          gradient={["#4F46E5", "#4338CA"]}
        />
        <StatCard
          label="COLLECTED"
          value={0}
          icon={TrendingUp}
          gradient={["#10B981", "#0D9488"]}
        />
        <StatCard
          label="PENDING"
          value={0}
          icon={TrendingDown}
          gradient={["#F59E0B", "#EA580C"]}
        />
      </ScrollView>

      <Card style={styles.contentCard}>
        <Text style={styles.cardTitle}>Fee Collections</Text>
        <Text style={styles.cardSubtitle}>Record student payments</Text>

        <View style={styles.stateBox}>
          <Receipt size={32} color={colors.textDim} />
          <Text style={styles.stateText}>Coming soon</Text>
        </View>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────
// REPORTS TAB — Real API
// ─────────────────────────────────────────

function ReportsTab() {
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await feeReportsApi.get();
      console.log("✅ Fee report loaded:", data.summary);
      setSummary(data.summary);
    } catch (err) {
      console.error("❌ Load report error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  const collectionRate =
    summary && summary.totalBilled > 0
      ? Math.round((summary.totalCollected / summary.totalBilled) * 100)
      : 0;

  if (loading) {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={colors.cyan} />
          <Text style={styles.stateText}>Loading report...</Text>
        </View>
      </Card>
    );
  }

  if (errorMsg !== "") {
    return (
      <Card style={styles.contentCard}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadReport}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContent}
        style={styles.statsScroll}
      >
        <StatCard
          label="TOTAL BILLED"
          value={Math.round(summary?.totalBilled || 0)}
          icon={FileText}
          gradient={["#4F46E5", "#4338CA"]}
        />
        <StatCard
          label="COLLECTED"
          value={Math.round(summary?.totalCollected || 0)}
          icon={TrendingUp}
          gradient={["#10B981", "#0D9488"]}
        />
        <StatCard
          label="PENDING"
          value={Math.round(summary?.totalRemaining || 0)}
          icon={TrendingDown}
          gradient={["#F59E0B", "#EA580C"]}
        />
        <StatCard
          label="RATE"
          value={collectionRate}
          icon={BarChart3}
          gradient={["#06B6D4", "#0EA5E9"]}
        />
      </ScrollView>

      <Card style={styles.contentCard}>
        <Text style={styles.cardTitle}>Status Breakdown</Text>
        <Text style={styles.cardSubtitle}>Fee voucher overview</Text>

        <View style={styles.reportStatusGrid}>
          <ReportStatusCard
            label="PAID"
            value={summary?.paidCount || 0}
            icon={CheckCircle2}
            color={colors.emerald}
          />
          <ReportStatusCard
            label="PARTIAL"
            value={summary?.partialCount || 0}
            icon={Clock}
            color={colors.amber}
          />
          <ReportStatusCard
            label="UNPAID"
            value={summary?.unpaidCount || 0}
            icon={AlertCircle}
            color={colors.rose}
          />
          <ReportStatusCard
            label="OVERDUE"
            value={summary?.overdueCount || 0}
            icon={AlertCircle}
            color={colors.red}
          />
        </View>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────
// MINI COMPONENTS
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
      <Text style={styles.statValue}>
        {value > 999 ? value.toLocaleString() : value}
      </Text>
    </LinearGradient>
  );
}

function ReportStatusCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <View
      style={[
        styles.reportStatusCard,
        { borderColor: `${color}33`, backgroundColor: `${color}0d` },
      ]}
    >
      <View style={styles.reportStatusTop}>
        <Icon size={12} color={color} />
        <Text style={[styles.reportStatusLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.reportStatusValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safeArea: { flex: 1 },
  scrollContent: { padding: spacing.base, paddingBottom: 40 },

  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: spacing.base,
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

  tabsScroll: {
    marginBottom: spacing.base,
    marginHorizontal: -spacing.base,
  },
  tabsContent: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  tabBtnActive: {
    backgroundColor: `${colors.indigo}33`,
    borderColor: colors.indigo,
  },
  tabBtnText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  tabBtnTextActive: {
    color: colors.white,
  },

  statsScroll: {
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.base,
  },
  statsContent: {
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
    fontSize: 22,
    fontWeight: fontWeight.black,
    letterSpacing: -0.6,
  },

  contentCard: { padding: spacing.lg, marginBottom: spacing.base },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.base,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
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

  itemCard: {
    padding: spacing.base,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  itemAvatar: { width: 48, height: 48 },
  itemAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1, justifyContent: "center" },
  itemTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.black,
  },
  itemSubtitle: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
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
    fontSize: 8,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  statusTextActive: { color: colors.emeraldLight },
  statusTextInactive: { color: colors.textMuted },

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

  reportStatusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  reportStatusCard: {
    flex: 1,
    minWidth: "45%",
    padding: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  reportStatusTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  reportStatusLabel: {
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  reportStatusValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
  },
});