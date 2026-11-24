import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNav } from "./src/components/BottomNav";
import { Header } from "./src/components/Header";
import { formatInr } from "./src/components/ServiceCard";
import { AccountScreen } from "./src/screens/AccountScreen";
import { BookingsScreen } from "./src/screens/BookingsScreen";
import { CartModal } from "./src/screens/CartModal";
import { HelpSupportModal } from "./src/screens/HelpSupportModal";
import { HomeScreen } from "./src/screens/HomeScreen";
import { IntroModal } from "./src/screens/IntroModal";
import { LocationModal } from "./src/screens/LocationModal";
import { OtpModal } from "./src/screens/OtpModal";
import { RatingModal } from "./src/screens/RatingModal";
import { ServiceDetailModal } from "./src/screens/ServiceDetailModal";
import { ServicesScreen } from "./src/screens/ServicesScreen";
import { AppProvider, useApp } from "./src/state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight } from "./src/theme";

function MainNavigator() {
  const { activeTab, cartItemCount, cartTotalPaise, setIsCartOpen } = useApp();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? Math.max(statusBarHeight, 36) : 0
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Header shown on Home */}
        {activeTab === "home" && <Header />}

        {/* Tab Screens: Persistent Mounting with display:none to prevent icon and service re-rendering */}
        <View style={styles.tabContent}>
          <View style={[styles.screenWrap, activeTab !== "home" && styles.screenHidden]}>
            <HomeScreen />
          </View>
          <View style={[styles.screenWrap, activeTab !== "services" && styles.screenHidden]}>
            <ServicesScreen />
          </View>
          <View style={[styles.screenWrap, activeTab !== "bookings" && styles.screenHidden]}>
            <BookingsScreen />
          </View>
          <View style={[styles.screenWrap, activeTab !== "account" && styles.screenHidden]}>
            <AccountScreen />
          </View>
        </View>

        {/* Floating Cart Bar (appears when items in cart) */}
        {Boolean(cartItemCount > 0) && (
          <Pressable
            onPress={() => setIsCartOpen(true)}
            style={styles.floatingCart}
            accessibilityRole="button"
            accessibilityLabel={`Cart with ${cartItemCount} items, total ${formatInr(cartTotalPaise)}`}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.cartCountPill}>
                <Text style={styles.cartCountText}>{cartItemCount}</Text>
              </View>
              <View>
                <Text style={styles.cartTotalText}>{formatInr(cartTotalPaise)}</Text>
                <Text style={styles.cartTotalSub}>Plus taxes • Slot selection next</Text>
              </View>
            </View>

            <View style={styles.floatingCartRight}>
              <Text style={styles.viewCartText}>View Cart</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.white} />
            </View>
          </Pressable>
        )}

        {/* Bottom Navigation Tabs */}
        <BottomNav />

        {/* Global Modals */}
        <ServiceDetailModal />
        <CartModal />
        <LocationModal />
        <OtpModal />
        <IntroModal />
        <RatingModal />
        <HelpSupportModal />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  tabContent: {
    flex: 1,
  },
  screenWrap: {
    flex: 1,
  },
  screenHidden: {
    display: "none",
  },
  floatingCart: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 75 : 65,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 30,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cartCountPill: {
    backgroundColor: colors.white,
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartCountText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  cartTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.white,
  },
  cartTotalSub: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  floatingCartRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewCartText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
