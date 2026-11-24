import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Booking } from "../types";

export function BookingsScreen() {
  const { setActiveTab } = useApp();
  const [activeSegment, setActiveSegment] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings();
      setBookings(data.results || []);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const activeBookings = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(b.status)
  );
  const pastBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  const displayedList = activeSegment === "active" ? activeBookings : pastBookings;

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      "Cancel Booking",
      `Are you sure you want to cancel booking ${booking.reference}?`,
      [
        { text: "No, Keep It", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await api.cancelBooking(booking.id, booking.version || 1);
              await loadBookings();
              Alert.alert("Booking Cancelled", "Your booking has been cancelled successfully.");
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to cancel.");
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return { label: "Technician Assigned", bg: colors.primarySoft, fg: colors.primary };
      case "IN_PROGRESS":
        return { label: "Service In Progress", bg: colors.warningBg, fg: colors.warning };
      case "COMPLETED":
        return { label: "Completed", bg: colors.successBg, fg: colors.success };
      case "CANCELLED":
        return { label: "Cancelled", bg: colors.errorBg, fg: colors.error };
      default:
        return { label: status, bg: colors.canvasWarm, fg: colors.ink };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Segment Controller */}
      <View style={styles.segmentContainer}>
        <Pressable
          onPress={() => setActiveSegment("active")}
          style={[styles.segmentBtn, activeSegment === "active" && styles.segmentBtnActive]}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === "active" && styles.segmentTextActive,
            ]}
          >
            Upcoming ({activeBookings.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveSegment("history")}
          style={[styles.segmentBtn, activeSegment === "history" && styles.segmentBtnActive]}
        >
          <Text
            style={[
              styles.segmentText,
              activeSegment === "history" && styles.segmentTextActive,
            ]}
          >
            Past Visits ({pastBookings.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadBookings}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading && bookings.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading your bookings…</Text>
          </View>
        ) : displayedList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={54} color={colors.subtle} />
            <Text style={styles.emptyTitle}>
              No {activeSegment === "active" ? "active" : "past"} bookings found
            </Text>
            <Text style={styles.emptySub}>
              {activeSegment === "active"
                ? "You have no upcoming service visits scheduled right now."
                : "Your completed visit invoices and history will appear here."}
            </Text>
            <Pressable
              onPress={() => setActiveTab("services")}
              style={styles.bookNowBtn}
            >
              <Text style={styles.bookNowBtnText}>Browse Catalog</Text>
            </Pressable>
          </View>
        ) : (
          displayedList.map((booking) => {
            const badge = getStatusBadge(booking.status);
            return (
              <View key={booking.id} style={styles.bookingCard}>
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.refCode}>REF #{booking.reference}</Text>
                    <Text style={styles.serviceName}>{booking.service}</Text>
                    <Text style={styles.packageName}>{booking.package}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.fg }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Visit Details */}
                <View style={styles.detailsBox}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={15} color={colors.primary} />
                    <Text style={styles.detailText}>
                      {new Date(booking.slot.start_at).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • 10:00 AM - 12:00 PM
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={15} color={colors.primary} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {booking.address.line_1 || "Address provided"}
                    </Text>
                  </View>
                </View>

                {/* Start OTP if active */}
                {Boolean(booking.start_otp_code && booking.status !== "COMPLETED") && (
                  <View style={styles.otpBox}>
                    <View>
                      <Text style={styles.otpLabel}>START SERVICE OTP</Text>
                      <Text style={styles.otpHint}>Share with technician when they arrive</Text>
                    </View>
                    <View style={styles.otpBadge}>
                      <Text style={styles.otpCode}>{booking.start_otp_code}</Text>
                    </View>
                  </View>
                )}

                {/* Technician Profile Card */}
                {Boolean(booking.technician) && (
                  <View style={styles.techCard}>
                    <View style={styles.techAvatar}>
                      <Ionicons name="person" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.techName}>{booking.technician?.name}</Text>
                      <View style={styles.techSubRow}>
                        <Ionicons name="star" size={11} color={colors.gold} />
                        <Text style={styles.techRating}>
                          {booking.technician?.rating || 4.9}
                        </Text>
                        <Text style={styles.techJobs}>
                          • {booking.technician?.completed_jobs || 140}+ jobs completed
                        </Text>
                      </View>
                    </View>
                    {Boolean(booking.technician?.phone) && (
                      <Pressable
                        onPress={() => Linking.openURL(`tel:${booking.technician?.phone}`)}
                        style={styles.callBtn}
                      >
                        <Ionicons name="call" size={16} color={colors.white} />
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Footer: Amount & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.amountLabel}>Total Bill</Text>
                    <Text style={styles.amountValue}>
                      {formatInr(booking.price?.total_paise)}
                    </Text>
                  </View>

                  {Boolean(booking.can_cancel && booking.status !== "CANCELLED") && (
                    <Pressable
                      onPress={() => handleCancelBooking(booking)}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>Cancel Visit</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  segmentContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loadingBox: {
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 13,
    color: colors.muted,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.sm,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  bookNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  bookNowBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  refCode: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 2,
  },
  packageName: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  detailsBox: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 11,
    color: colors.inkSecondary,
    fontWeight: "500",
  },
  otpBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(128, 0, 32, 0.15)",
  },
  otpLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
  },
  otpHint: {
    fontSize: 9,
    color: colors.muted,
  },
  otpBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  otpCode: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 2,
  },
  techCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  techAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  techName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  techSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  techRating: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ink,
  },
  techJobs: {
    fontSize: 10,
    color: colors.muted,
  },
  callBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: 2,
  },
  amountLabel: {
    fontSize: 10,
    color: colors.muted,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.error,
  },
});
