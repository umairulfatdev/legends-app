import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { colors, spacing, fontSize, fontWeight, radius } from "../theme/tokens";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animated values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(30)).current;
  const dividerOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 12,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(brandOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(brandTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(dividerOpacity, {
      toValue: 1,
      duration: 400,
      delay: 900,
      useNativeDriver: true,
    }).start();

    Animated.timing(taglineOpacity, {
      toValue: 1,
      duration: 500,
      delay: 1100,
      useNativeDriver: true,
    }).start();

    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 500,
      delay: 1400,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.navy, "#1e1b4b", "#155e75"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Image */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Brand Name */}
          <Animated.View
            style={[
              styles.brandWrapper,
              {
                opacity: brandOpacity,
                transform: [{ translateY: brandTranslateY }],
              },
            ]}
          >
            <Text style={styles.brandName}>THE LEGENDS</Text>
            <Text style={styles.brandSub}>ACADEMY & SCHOOL SYSTEM</Text>
          </Animated.View>

          {/* Divider */}
          <Animated.View style={[styles.divider, { opacity: dividerOpacity }]} />

          {/* Tagline */}
          <Animated.View style={[styles.taglineRow, { opacity: taglineOpacity }]}>
            <Sparkles size={14} color={colors.cyan} />
            <Text style={styles.tagline}>SMART SCHOOL MANAGEMENT</Text>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <ActivityIndicator size="small" color={colors.cyan} />
          <Text style={styles.footerText}>Loading...</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy },
  safeArea: { flex: 1, justifyContent: "space-between" },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logoImage: {
    width: 160,
    height: 160,
    marginBottom: spacing.xxl,
  },
  brandWrapper: { alignItems: "center" },
  brandName: {
    color: colors.text,
    fontSize: 32,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
    textAlign: "center",
  },
  brandSub: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: fontWeight.black,
    letterSpacing: 3,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: colors.cyan,
    borderRadius: 2,
    marginVertical: spacing.xl,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
  },
  footer: {
    alignItems: "center",
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  footerText: {
    color: colors.textDim,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
});