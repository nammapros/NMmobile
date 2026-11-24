import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

export function Header() {
  const {
    selectedCity,
    setIsLocationModalOpen,
    cartItemCount,
    setIsCartOpen,
    setActiveTab,
    setIsAuthOpen,
    user,
  } = useApp();

  const handleNotifications = () => {
    Alert.alert(
      "Notifications",
      "No new notifications. You'll receive live status updates here when your technician is dispatched."
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Left: Location Selector [LocationPin] City [Chevron] */}
      <Pressable
        onPress={() => setIsLocationModalOpen(true)}
        style={styles.locationBtn}
        accessibilityRole="button"
        accessibilityLabel={`Selected location ${selectedCity}`}
      >
        <Ionicons name="location-sharp" size={16} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {selectedCity}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.muted} />
      </Pressable>

      {/* 2. Center: Brand Logo typography "namma pros." */}
      <Pressable
        onPress={() => setActiveTab("home")}
        style={styles.logoBtn}
        accessibilityRole="button"
        accessibilityLabel="NammaPros Home"
      >
        <View style={styles.brandRow}>
          <Text style={styles.brandName}>namma pros</Text>
          <View style={styles.brandDot} />
        </View>
      </Pressable>

      {/* 3. Right: Bell Notification & Cart Actions */}
      <View style={styles.rightActions}>
        <Pressable
          onPress={handleNotifications}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={21} color={colors.ink} />
        </Pressable>

        {Boolean(cartItemCount > 0) && (
          <Pressable
            onPress={() => setIsCartOpen(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={`Cart with ${cartItemCount} items`}
          >
            <Ionicons name="cart-outline" size={21} color={colors.primary} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 54,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 85,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    maxWidth: 95,
  },
  logoBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  brandDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 85,
    justifyContent: "flex-end",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
});
