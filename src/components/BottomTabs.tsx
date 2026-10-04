import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Home,
  Users,
  Wallet,
  User,
} from "lucide-react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

export type TabName = "dashboard" | "students" | "fees" | "profile";

type BottomTabsProps = {
  active: TabName;
  onChange: (tab: TabName) => void;
};

const tabs: { key: TabName; label: string; icon: any }[] = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "students", label: "Students", icon: Users },
  { key: "fees", label: "Fees", icon: Wallet },
  { key: "profile", label: "Profile", icon: User },
];

export default function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(10,22,40,0.95)", "rgba(10,22,40,1)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.tabsRow}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onChange(tab.key)}
              activeOpacity={0.7}
              style={styles.tab}
            >
              {isActive ? (
                <LinearGradient
                  colors={["#4F46E5", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIcon}
                >
                  <Icon size={20} color={colors.white} />
                </LinearGradient>
              ) : (
                <View style={styles.iconWrapper}>
                  <Icon size={20} color={colors.textDim} />
                </View>
              )}

              <Text
                style={[styles.label, isActive && styles.labelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 12,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  activeIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    marginBottom: 2,
  },
  label: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 4,
  },
  labelActive: {
    color: colors.cyan,
    fontWeight: fontWeight.black,
  },
});