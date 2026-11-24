import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight } from "../theme";

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  city: string;
  pincode: string;
}

const AVAILABLE_LOCATIONS: LocationItem[] = [
  {
    id: "chennai-all",
    title: "Chennai, Tamil Nadu",
    subtitle: "All Zones & Localities",
    city: "Chennai",
    pincode: "600020",
  },
  {
    id: "anna-nagar",
    title: "Anna Nagar, Chennai",
    subtitle: "North-West Zone",
    city: "Chennai",
    pincode: "600040",
  },
  {
    id: "velachery",
    title: "Velachery, Chennai",
    subtitle: "South Zone",
    city: "Chennai",
    pincode: "600042",
  },
  {
    id: "adyar",
    title: "Adyar, Chennai",
    subtitle: "South-Central Zone",
    city: "Chennai",
    pincode: "600020",
  },
  {
    id: "t-nagar",
    title: "T. Nagar, Chennai",
    subtitle: "Central Zone",
    city: "Chennai",
    pincode: "600017",
  },
  {
    id: "coimbatore",
    title: "Coimbatore, Tamil Nadu",
    subtitle: "Kongu Region Hub",
    city: "Coimbatore",
    pincode: "641001",
  },
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocId, setSelectedLocId] = useState("chennai-all");

  if (!isLocationModalOpen) return null;

  const filteredLocations = AVAILABLE_LOCATIONS.filter(
    (loc) =>
      loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc: LocationItem) => {
    setSelectedLocId(loc.id);
  };

  const handleConfirm = () => {
    const loc = AVAILABLE_LOCATIONS.find((l) => l.id === selectedLocId);
    if (loc) {
      setSelectedCity(loc.city);
      setSelectedPincode(loc.pincode);
    }
    setIsLocationModalOpen(false);
    refreshCatalog();
  };

  return (
    <Modal
      visible={isLocationModalOpen}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={() => setIsLocationModalOpen(false)}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setIsLocationModalOpen(false)}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerTitle}>Select your location</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Search Bar with Magnifying Glass */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              placeholder="Search area, landmark or pincode…"
              placeholderTextColor={colors.subtle}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Location List */}
        <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocId === loc.id;
            return (
              <Pressable
                key={loc.id}
                onPress={() => handleSelectLocation(loc)}
                style={[styles.locationItem, isSelected && styles.locationItemSelected]}
              >
                <View style={styles.locationItemLeft}>
                  <Ionicons
                    name="location-sharp"
                    size={20}
                    color={isSelected ? colors.primary : colors.muted}
                  />
                  <View>
                    <Text
                      style={[
                        styles.locationItemTitle,
                        isSelected && styles.locationItemTitleSelected,
                      ]}
                    >
                      {loc.title}
                    </Text>
                    <Text style={styles.locationItemSub}>{loc.subtitle}</Text>
                  </View>
                </View>

                {Boolean(isSelected) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handleConfirm}
            style={styles.confirmBtn}
            accessibilityRole="button"
            accessibilityLabel="Confirm Location"
          >
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: isAndroid ? statusBarHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  headerPlaceholder: {
    width: 36,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  locationItemSelected: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  locationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  locationItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
  },
  locationItemTitleSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  locationItemSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
