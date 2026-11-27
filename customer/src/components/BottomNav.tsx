import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useApp, type TabName } from "../state/AppContext";
import { colors, radii, spacing, typography } from "../theme";

interface TabItem {
  id: TabName;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
  { id: "home", label: "Home", icon: "home-outline", iconActive: "home" },
  { id: "bookings", label: "Bookings", icon: "calendar-outline", iconActive: "calendar" },
  { id: "account", label: "Accounts", icon: "person-outline", iconActive: "person" },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabBtn}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.muted}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 6,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    minWidth: 64,
  },
  iconWrapper: {
    width: 44,
    height: 28,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  iconWrapperActive: {
    backgroundColor: colors.primarySoft,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
