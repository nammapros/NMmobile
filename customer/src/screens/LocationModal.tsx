import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

const POPULAR_CITIES = [
  { name: "Chennai", defaultPin: "600020", state: "Tamil Nadu" },
  { name: "Bengaluru", defaultPin: "560001", state: "Karnataka" },
  { name: "Coimbatore", defaultPin: "641001", state: "Tamil Nadu" },
  { name: "Madurai", defaultPin: "625001", state: "Tamil Nadu" },
  { name: "Hyderabad", defaultPin: "500001", state: "Telangana" },
];

export function LocationModal() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedCity,
    setSelectedCity,
    selectedPincode,
    setSelectedPincode,
    refreshCatalog,
  } = useApp();

  const [cityInput, setCityInput] = useState(selectedCity);
  const [pinInput, setPinInput] = useState(selectedPincode);

  if (!isLocationModalOpen) return null;

  const handleSelectCity = (city: { name: string; defaultPin: string }) => {
    setSelectedCity(city.name);
    setSelectedPincode(city.defaultPin);
    setIsLocationModalOpen(false);
    refreshCatalog();
  };

  const handleApply = () => {
    if (cityInput.trim()) setSelectedCity(cityInput.trim());
    if (pinInput.trim()) setSelectedPincode(pinInput.trim());
    setIsLocationModalOpen(false);
    refreshCatalog();
  };

  return (
    <Modal
      visible={isLocationModalOpen}
      animationType="fade"
      transparent
      onRequestClose={() => setIsLocationModalOpen(false)}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsLocationModalOpen(false)}
        />
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Select Your City</Text>
              <Text style={styles.sub}>
                Showing available pros and service slots for your area
              </Text>
            </View>
            <Pressable
              onPress={() => setIsLocationModalOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          {/* Quick Popular Cities Chips */}
          <Text style={styles.sectionLabel}>Popular Cities</Text>
          <View style={styles.citiesRow}>
            {POPULAR_CITIES.map((c) => {
              const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();
              return (
                <Pressable
                  key={c.name}
                  onPress={() => handleSelectCity(c)}
                  style={[styles.cityChip, isSelected && styles.cityChipSelected]}
                >
                  <Ionicons
                    name="location-sharp"
                    size={14}
                    color={isSelected ? colors.white : colors.primary}
                  />
                  <Text
                    style={[styles.cityChipText, isSelected && styles.cityChipTextSelected]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Custom City and Pincode Inputs */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionLabel}>Or Enter Pincode</Text>
            <View style={styles.inputRow}>
              <Ionicons name="search-outline" size={18} color={colors.muted} />
              <TextInput
                placeholder="6-digit pincode e.g. 600020"
                placeholderTextColor={colors.subtle}
                value={pinInput}
                onChangeText={setPinInput}
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
              />
            </View>
          </View>

          {/* Apply Button */}
          <Pressable onPress={handleApply} style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Location</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(28, 25, 23, 0.4)",
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.ink,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  citiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cityChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  cityChipTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  inputSection: {
    marginTop: spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  applyBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
