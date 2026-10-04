import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, spacing, fontSize, fontWeight, radius } from "../../theme/tokens";
import { ReactNode, useState } from "react";

// ─────────────────────────────────────────
// FORM INPUT
// ─────────────────────────────────────────

type FormInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  type?: "text" | "date";
};

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  type = "text",
}: FormInputProps) {
  const [showPicker, setShowPicker] = useState(false);

  // ✅ DATE PICKER MODE
  if (type === "date") {
    // 🌐 WEB — HTML5 date input
    if (Platform.OS === "web") {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          <input
            type="date"
            value={value}
            onChange={(e: any) => onChangeText(e.target.value)}
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: "14px 16px",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: 600,
              width: "100%",
              outline: "none",
              fontFamily: "inherit",
              colorScheme: "dark",
              boxSizing: "border-box",
            }}
          />
        </View>
      );
    }

    // 📱 MOBILE — Native DateTimePicker
    const dateValue = value ? new Date(value) : new Date();

    const handleDateChange = (event: any, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShowPicker(false);
      }
      if (selectedDate) {
        const iso = selectedDate.toISOString().slice(0, 10);
        onChangeText(iso);
      }
    };

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: value ? colors.text : colors.textDim,
              fontSize: fontSize.base,
              fontWeight: fontWeight.semibold,
            }}
          >
            {value || placeholder || "Select date"}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
          />
        )}
      </View>
    );
  }

  // ✅ TEXT INPUT MODE
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDim}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

// ─────────────────────────────────────────
// FORM SELECT
// ─────────────────────────────────────────

type FormSelectProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: string[];
  required?: boolean;
};

export function FormSelect({
  label,
  value,
  onChangeText,
  options,
  required = false,
}: FormSelectProps) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={styles.selectWrapper}>
        {options.map((opt) => {
          const isActive = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.selectOption,
                isActive && styles.selectOptionActive,
              ]}
              onPress={() => onChangeText(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.selectOptionText,
                  isActive && styles.selectOptionTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────
// FORM MODAL
// ─────────────────────────────────────────

type FormModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  children: ReactNode;
};

export function FormModal({
  visible,
  onClose,
  title,
  subtitle,
  onSubmit,
  submitLabel,
  loading = false,
  children,
}: FormModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#1e1b4b", "#0A1628", "#155e75"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <View>
                <Text style={styles.modalSubtitle}>{subtitle}</Text>
                <Text style={styles.modalTitle}>{title}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitWrapper, loading && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={["#4F46E5", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitText}>
                  {loading ? "Saving..." : submitLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  required: {
    color: colors.red,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  dateInput: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
    minHeight: 52,
  },

  selectWrapper: {
    flexDirection: "row",
    gap: 8,
  },
  selectOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  selectOptionActive: {
    backgroundColor: `${colors.indigo}33`,
    borderColor: colors.indigo,
  },
  selectOptionText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  selectOptionTextActive: {
    color: colors.white,
    fontWeight: fontWeight.black,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.navy,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight: "92%",
    overflow: "hidden",
  },
  modalHeader: {
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSubtitle: {
    color: colors.cyan,
    fontSize: 9,
    fontWeight: fontWeight.black,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    flexGrow: 0,
  },
  modalBodyContent: {
    padding: spacing.xl,
  },
  modalFooter: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  submitWrapper: {
    flex: 2,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.black,
  },
});