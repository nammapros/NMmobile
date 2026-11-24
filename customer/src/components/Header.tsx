import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandAssets } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";

export function Header() {
  const {
    selectedCity,
    selectedPincode,
    setIsLocationModalOpen,
    cartItemCount,
    setIsCartOpen,
    setActiveTab,
    setIsAuthOpen,
    user,
  } = useApp();

  const handleSearchPress = () => {
    setActiveTab("services");
  };

  const handleProfilePress = () => {
    if (user) {
      setActiveTab("account");
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Top Bar: Brand Wordmark Logo + Cart & Profile Actions */}
      <View style={styles.topRow}>
        <Pressable
          onPress={() => setActiveTab("home")}
          accessibilityRole="button"
          accessibilityLabel="nammapros home"
          style={styles.logoPressable}
        >
          <Image
            source={BrandAssets.wordmark}
            style={styles.brandWordmark}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.rightActions}>
          {/* Cart Button */}
          <Pressable
            onPress={() => setIsCartOpen(true)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel={`Cart, ${cartItemCount} items`}
          >
            <Ionicons name="cart-outline" size={21} color={colors.ink} />
            {Boolean(cartItemCount > 0) && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Text>
              </View>
            )}
          </Pressable>

          {/* User Profile Avatar / Sign In */}
          <Pressable
            onPress={handleProfilePress}
            style={[styles.iconBtn, Boolean(user) && styles.userLoggedInBtn]}
            accessibilityRole="button"
            accessibilityLabel={user ? "Account profile" : "Sign in with Firebase OTP"}
          >
            <Ionicons
              name={user ? "person" : "person-outline"}
              size={19}
              color={user ? colors.white : colors.ink}
            />
            {Boolean(user) && <View style={styles.onlineDot} />}
          </Pressable>
        </View>
      </View>

      {/* 2. Location line: [MapPin] Locality, City [ChevronDown] */}
      <Pressable
        onPress={() => setIsLocationModalOpen(true)}
        style={styles.locationRow}
        accessibilityRole="button"
        accessibilityLabel={`Service location: ${selectedCity}`}
      >
        <Ionicons name="location-sharp" size={16} color={colors.primary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {selectedCity} • {selectedPincode}
        </Text>
        <Ionicons name="chevron-down" size={14} color={colors.muted} />
      </Pressable>

      {/* 3. Search Bar with Burgundy arrow button matching Web Header */}
      <Pressable
        onPress={handleSearchPress}
        style={styles.searchBar}
        accessibilityRole="button"
        accessibilityLabel="Search for a service"
      >
        <Ionicons name="search" size={17} color={colors.muted} />
        <Text style={styles.searchPlaceholder}>Search for ‘AC service’</Text>
        <View style={styles.searchArrowBtn}>
          <Ionicons name="arrow-forward" size={15} color={colors.white} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  logoPressable: {
    height: 38,
    justifyContent: "center",
  },
  brandWordmark: {
    width: 160,
    height: 34,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#E2D9D0",
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  userLoggedInBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.primary,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "#E2D9D0",
    paddingLeft: spacing.md,
    paddingRight: 4,
    height: 42,
    gap: spacing.sm,
    marginTop: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: colors.muted,
  },
  searchArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
