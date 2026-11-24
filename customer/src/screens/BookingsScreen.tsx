import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api";
import { ServiceBannerAssets } from "../assets";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Booking } from "../types";

export function BookingsScreen() {
  const {
    activeTab,
    setActiveTab,
    activeTrackingBooking,
    setActiveTrackingBooking,
    setIsHelpModalOpen,
    setIsRatingModalOpen,
    setRatingBooking,
    user,
    setIsAuthOpen,
  } = useApp();

  const [activeSegment, setActiveSegment] = useState<"upcoming" | "completed">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Default simulated bookings matching Screen 17 in Mockup
  const defaultMockBookings: Booking[] = [
    {
      id: "NP100456",
      reference: "NP100456",
      service: "Washing Machine Repair - Inspection",
      package: "Inspection & Diagnosis",
      service_name: "Washing Machine Repair - Inspection",
      package_name: "Inspection & Diagnosis",
      status: "CONFIRMED",
      payment_status: "PAID",
      created_at: "2026-11-18T10:00:00Z",
      scheduled_date: "Wed, 18 Nov 2026",
      scheduled_slot: "2:00 PM - 4:00 PM",
      scheduled_at: "2026-11-18T14:00:00Z",
      price: {
        lines: [{ code: "SERVICE", amount_paise: 19900 }],
        total_paise: 19900,
        currency: "INR",
      },
      slot: {
        start_at: "2026-11-18T14:00:00Z",
        end_at: "2026-11-18T16:00:00Z",
      },
      total_amount_paise: 19900,
      address: {
        locality: "Anna Nagar",
        city: "Chennai",
        postal_code: "600040",
        line_1: "No. 12, 3rd Street, Anna Nagar, Chennai - 600040",
      },
      technician: {
        name: "Ramesh K.",
        display_name: "Ramesh K.",
        phone: "+91 98765 00001",
        status: "ON_THE_WAY",
        rating: 4.9,
      },
    },
    {
      id: "NP100457",
      reference: "NP100457",
      service: "Overhead Water Tank Cleaning",
      package: "Sintex / Overhead Tank Clean",
      service_name: "Overhead Water Tank Cleaning",
      package_name: "Sintex / Overhead Tank Clean",
      status: "CONFIRMED",
      payment_status: "PAID",
      created_at: "2026-11-18T10:30:00Z",
      scheduled_date: "Wed, 18 Nov 2026",
      scheduled_slot: "2:00 PM - 4:00 PM",
      scheduled_at: "2026-11-18T14:00:00Z",
      price: {
        lines: [{ code: "SERVICE", amount_paise: 77900 }],
        total_paise: 77900,
        currency: "INR",
      },
      slot: {
        start_at: "2026-11-18T14:00:00Z",
        end_at: "2026-11-18T16:00:00Z",
      },
      total_amount_paise: 77900,
      address: {
        locality: "Anna Nagar",
        city: "Chennai",
        postal_code: "600040",
        line_1: "No. 12, 3rd Street, Anna Nagar, Chennai - 600040",
      },
      technician: {
        name: "Ramesh K.",
        display_name: "Ramesh K.",
        phone: "+91 98765 00001",
        status: "ON_THE_WAY",
        rating: 4.9,
      },
    },
  ];

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings();
      if (data && data.results && data.results.length > 0) {
        setBookings(data.results);
      } else {
        setBookings(defaultMockBookings);
      }
    } catch {
      setBookings(defaultMockBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => !["COMPLETED", "CANCELLED"].includes(b.status)
  );
  const completedBookings = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED"].includes(b.status)
  );

  const displayedList =
    activeSegment === "upcoming" ? upcomingBookings : completedBookings;

  const handleBookingCardPress = (booking: Booking) => {
    setActiveTrackingBooking(booking);
  };

  const handleCallTechnician = (phone?: string) => {
    const num = phone || "+919876500001";
    Linking.openURL(`tel:${num}`).catch(() => {
      Alert.alert("Call Technician", `Call ${num}`);
    });
  };

  const handleOpenChat = () => {
    Alert.alert(
      "Live Chat",
      "Technician chat connected: 'Hello! I am on my way to your Anna Nagar address and will reach around 2:15 PM.'"
    );
  };

  const handleOpenRating = (booking: Booking) => {
    setRatingBooking(booking);
    setIsRatingModalOpen(true);
  };

  const getBookingThumb = (name?: string) => {
    const n = (name || "").toLowerCase();
    if (n.includes("water") || n.includes("tank")) {
      return ServiceBannerAssets["water-tank-cleaning"];
    }
    if (n.includes("ac")) {
      return ServiceBannerAssets.ac;
    }
    return ServiceBannerAssets["washing-machine"];
  };

  return (
    <View style={styles.container}>
      {/* ========================================================
          SCREEN 17: MY BOOKINGS
          ======================================================== */}
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Segmented Pill Tabs: Upcoming | Completed */}
      <View style={styles.segmentWrapper}>
        <Pressable
          onPress={() => setActiveSegment("upcoming")}
          style={[
            styles.segmentBtn,
            activeSegment === "upcoming" && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentBtnText,
              activeSegment === "upcoming" && styles.segmentBtnTextActive,
            ]}
          >
            Upcoming
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveSegment("completed")}
          style={[
            styles.segmentBtn,
            activeSegment === "completed" && styles.segmentBtnActive,
          ]}
        >
          <Text
            style={[
              styles.segmentBtnText,
              activeSegment === "completed" && styles.segmentBtnTextActive,
            ]}
          >
            Completed
          </Text>
        </Pressable>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.listScroll}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadBookings}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {displayedList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={48} color={colors.subtle} />
            <Text style={styles.emptyTitle}>
              No {activeSegment} bookings
            </Text>
            <Text style={styles.emptySub}>
              Book trusted home services with upfront pricing and direct slot scheduling.
            </Text>
            <Pressable
              onPress={() => setActiveTab("services")}
              style={styles.bookNewBtn}
            >
              <Text style={styles.bookNewBtnText}>Explore Services</Text>
            </Pressable>
          </View>
        ) : (
          displayedList.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => handleBookingCardPress(booking)}
              style={styles.bookingCard}
              accessibilityRole="button"
              accessibilityLabel={booking.service_name || booking.service}
            >
              <Image
                source={getBookingThumb(booking.service_name || booking.service)}
                style={styles.bookingThumb}
                resizeMode="cover"
              />
              <View style={styles.bookingCardDetails}>
                <View style={styles.bookingTopRow}>
                  <Text style={styles.bookingServiceTitle} numberOfLines={2}>
                    {booking.service_name || booking.service}
                  </Text>
                  <View style={styles.confirmedBadge}>
                    <Text style={styles.confirmedBadgeText}>
                      {booking.status === "COMPLETED" ? "Completed" : "Confirmed"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bookingSlotText}>
                  {booking.scheduled_date || "Wed, 18 Nov 2026"}
                  {booking.scheduled_slot ? ` • ${booking.scheduled_slot}` : ""}
                </Text>

                <View style={styles.bookingCardFooter}>
                  <Text style={styles.bookingPrice}>
                    {formatInr(booking.total_amount_paise ?? booking.price?.total_paise ?? 19900)}
                  </Text>
                  <View style={styles.trackActionRow}>
                    <Text style={styles.trackActionText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  </View>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* ========================================================
          SCREEN 18 & 19: LIVE TRACKING & BOOKING DETAILS MODAL
          ======================================================== */}
      {Boolean(activeTrackingBooking) && (
        <Modal
          visible={Boolean(activeTrackingBooking)}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setActiveTrackingBooking(null)}
        >
          <SafeAreaView style={styles.trackingSafeArea}>
            {/* Modal Header */}
            <View style={styles.trackingHeader}>
              <Pressable
                onPress={() => setActiveTrackingBooking(null)}
                style={styles.trackingHeaderBackBtn}
              >
                <Ionicons name="arrow-back" size={24} color={colors.ink} />
              </Pressable>
              <Text style={styles.trackingHeaderTitle}>Booking Details</Text>
              <View style={styles.inProgressPill}>
                <Text style={styles.inProgressPillText}>In Progress</Text>
              </View>
            </View>

            <ScrollView style={styles.trackingScroll} contentContainerStyle={styles.trackingContent}>
              {/* Banner: "Our professional is on the way" */}
              <View style={styles.onTheWayBanner}>
                <Ionicons name="bicycle-outline" size={20} color={colors.primary} />
                <Text style={styles.onTheWayText}>Our professional is on the way</Text>
              </View>

              {/* Simulated Live Route Map View */}
              <View style={styles.mapSimulationContainer}>
                {/* Background Map Grid & Roads */}
                <View style={styles.mapRoadH1} />
                <View style={styles.mapRoadH2} />
                <View style={styles.mapRoadV1} />
                <View style={styles.mapRoadV2} />

                {/* Simulated SVG-style curved route line */}
                <View style={styles.routeTrack}>
                  <View style={styles.routePinStart}>
                    <Ionicons name="navigate-circle" size={28} color={colors.primary} />
                  </View>
                  <View style={styles.routeDottedLine} />
                  <View style={styles.routePinEnd}>
                    <Ionicons name="home" size={20} color={colors.ink} />
                  </View>
                </View>

                {/* Floating ETA Pill */}
                <View style={styles.etaPill}>
                  <Text style={styles.etaText}>Arriving in ~15 mins</Text>
                </View>
              </View>

              {/* Technician Profile Card matching Screen 18 */}
              <View style={styles.technicianCard}>
                <View style={styles.technicianLeft}>
                  <View style={styles.technicianAvatarCircle}>
                    <Ionicons name="person" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.technicianName}>
                      {activeTrackingBooking?.technician?.display_name ||
                        activeTrackingBooking?.technician?.name ||
                        "Ramesh K."}
                    </Text>
                    <Text style={styles.technicianRole}>Service Professional</Text>
                  </View>
                </View>

                <View style={styles.technicianActions}>
                  <Pressable
                    onPress={() =>
                      handleCallTechnician(activeTrackingBooking?.technician?.phone)
                    }
                    style={styles.techIconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Call Professional"
                  >
                    <Ionicons name="call" size={17} color={colors.white} />
                  </Pressable>
                  <Pressable
                    onPress={handleOpenChat}
                    style={[styles.techIconBtn, { backgroundColor: colors.ink }]}
                    accessibilityRole="button"
                    accessibilityLabel="Chat with Professional"
                  >
                    <Ionicons name="chatbubble" size={16} color={colors.white} />
                  </Pressable>
                </View>
              </View>

              {/* Booking Details Section matching Screen 19 */}
              <View style={styles.detailsCard}>
                <View style={styles.detailItemRow}>
                  <Image
                    source={getBookingThumb(
                      activeTrackingBooking?.service_name || activeTrackingBooking?.service
                    )}
                    style={styles.detailItemThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.detailItemTextWrap}>
                    <Text style={styles.detailItemName}>
                      {activeTrackingBooking?.service_name || activeTrackingBooking?.service}
                    </Text>
                    <Text style={styles.detailItemPrice}>
                      {formatInr(
                        activeTrackingBooking?.total_amount_paise ??
                          activeTrackingBooking?.price?.total_paise ??
                          19900
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                {/* Date & Time */}
                <View style={styles.detailMetaRow}>
                  <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                  <View style={styles.detailMetaTextWrap}>
                    <Text style={styles.detailMetaLabel}>Date &amp; Time</Text>
                    <Text style={styles.detailMetaValue}>
                      {activeTrackingBooking?.scheduled_date || "Wed, 18 Nov 2026"},{" "}
                      {activeTrackingBooking?.scheduled_slot || "2:00 PM - 4:00 PM"}
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <View style={styles.detailMetaRow}>
                  <Ionicons name="location-outline" size={18} color={colors.muted} />
                  <View style={styles.detailMetaTextWrap}>
                    <Text style={styles.detailMetaLabel}>Address</Text>
                    <Text style={styles.detailMetaValue}>
                      {activeTrackingBooking?.address?.line_1 ||
                        "No. 12, 3rd Street, Anna Nagar, Chennai - 600040"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                {/* Need Help link */}
                <Pressable
                  onPress={() => setIsHelpModalOpen(true)}
                  style={styles.needHelpBtn}
                >
                  <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.needHelpBtnText}>Need Help? Contact Support</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              </View>

              {/* Rate Service Button */}
              <Pressable
                onPress={() => {
                  if (activeTrackingBooking) {
                    handleOpenRating(activeTrackingBooking);
                  }
                }}
                style={styles.rateServiceBtn}
              >
                <Ionicons name="star" size={16} color={colors.white} />
                <Text style={styles.rateServiceBtnText}>Rate Your Service</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  segmentWrapper: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  segmentBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.canvasWarm,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
  },
  segmentBtnTextActive: {
    color: colors.white,
    fontWeight: "700",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 90,
    gap: spacing.md,
  },
  bookingCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingThumb: {
    width: 65,
    height: 65,
    borderRadius: radii.md,
    backgroundColor: colors.canvasWarm,
  },
  bookingCardDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  bookingTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  bookingServiceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    flex: 1,
    lineHeight: 18,
  },
  confirmedBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.success,
  },
  bookingSlotText: {
    fontSize: 12,
    color: colors.muted,
    marginVertical: 4,
  },
  bookingCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  trackActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trackActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 260,
  },
  bookNewBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  bookNewBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  // Live Tracking Modal
  trackingSafeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  trackingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    height: 52,
  },
  trackingHeaderBackBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  trackingHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  inProgressPill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  inProgressPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.success,
  },
  trackingScroll: {
    flex: 1,
  },
  trackingContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  onTheWayBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  onTheWayText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  // Simulated Map Container
  mapSimulationContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#E2E8F0",
    borderRadius: radii.lg,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  mapRoadH1: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: colors.white,
  },
  mapRoadH2: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: colors.white,
  },
  mapRoadV1: {
    position: "absolute",
    left: 70,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: colors.white,
  },
  mapRoadV2: {
    position: "absolute",
    right: 70,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: colors.white,
  },
  routeTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radii.pill,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  routePinStart: {},
  routeDottedLine: {
    width: 70,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  routePinEnd: {},
  etaPill: {
    position: "absolute",
    bottom: 10,
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  etaText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
  },

  // Technician Card
  technicianCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  technicianLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  technicianAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  technicianName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  technicianRole: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  technicianActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  techIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // Details Card
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  detailItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  detailItemThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.canvasWarm,
  },
  detailItemTextWrap: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  detailItemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  detailMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  detailMetaTextWrap: {
    flex: 1,
  },
  detailMetaLabel: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "600",
  },
  detailMetaValue: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: "500",
    marginTop: 2,
    lineHeight: 18,
  },
  needHelpBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
  },
  needHelpBtnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: spacing.sm,
  },

  // Rate Service Button
  rateServiceBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rateServiceBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
