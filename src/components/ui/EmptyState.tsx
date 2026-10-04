import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon, Plus } from "lucide-react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "../../theme/tokens";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4F46E5", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrapper}
      >
        <Icon size={40} color={colors.white} />
      </LinearGradient>

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}

      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.actionWrapper}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#4F46E5", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtn}
          >
            <Plus size={16} color={colors.white} />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  actionWrapper: { marginTop: spacing.base },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  actionText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
});