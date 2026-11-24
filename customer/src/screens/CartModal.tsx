import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../api";
import { getServiceImage } from "../assets";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, isAndroid, radii, spacing, statusBarHeight } from "../theme";
import type { Address, Booking } from "../types";

type CheckoutStep =
  | "cart"
  | "address"
  | "date"
  | "slot"
  | "payment"
  | "confirmed";

const TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

const UPI_APPS = [
  { id: "upi_auto", name: "UPI (Google Pay, PhonePe, Paytm, etc.)", icon: "flash" },
  { id: "gpay", name: "Google Pay", icon: "logo-google" },
  { id: "phonepe", name: "PhonePe", icon: "wallet" },
  { id: "paytm", name: "Paytm", icon: "card" },
];

export function CartModal() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    cartTotalPaise,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectedCity,
    selectedPincode,
    setActiveTab,
    user,
    setIsAuthOpen,
    savedAddresses,
    selectedAddressId,
    setSelectedAddressId,
    addSavedAddress,
    setActiveTrackingBooking,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("cart");
  const [selectedDateDay, setSelectedDateDay] = useState(18);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(2); // "2:00 PM - 4:00 PM"
  const [selectedUpiApp, setSelectedUpiApp] = useState("upi_auto");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // New address modal state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine1, setNewLine1] = useState("");

  if (!isCartOpen) return null;

  const totalPaise = cartTotalPaise;
  const activeAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0];

  const handleNextFromCart = () => {
    if (cartItems.length === 0) return;
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setCurrentStep("address");
  };

  const handleCreateNewAddress = () => {
    if (!newLine1.trim()) {
      Alert.alert("Missing Address", "Please enter the street address.");
      return;
    }
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      contact_name: user?.name || "Customer",
      contact_phone: user?.phone_e164 || "+91 98765 43210",
      house_flat: "",
      street: "",
      locality: selectedCity,
      city: selectedCity,
      state: "Tamil Nadu",
      postal_code: selectedPincode,
      line_1: newLine1.trim(),
      is_default: false,
    };
    addSavedAddress(newAddr);
    setShowAddAddress(false);
    setNewLine1("");
  };

  const handleProcessPayment = async () => {
    setIsSubmitting(true);
    try {
      const scheduledDateStr = `2026-11-${String(selectedDateDay).padStart(2, "0")}`;
      const slotStr = TIME_SLOTS[selectedSlotIndex];

      const res = await api.createBooking({
        service_id: cartItems[0]?.service.id || "svc-1",
        package_id: cartItems[0]?.pkg.id || "pkg-1",
        address_line_1: activeAddress?.line_1 || "Anna Nagar, Chennai",
        postal_code: activeAddress?.postal_code || selectedPincode,
        city: activeAddress?.city || selectedCity,
        contact_phone: user?.phone_e164 || "+919876543210",
        contact_name: user?.name || "Customer",
        scheduled_date: scheduledDateStr,
        scheduled_slot: slotStr,
        payment_method: "ONLINE",
      });

      const newBooking: Booking = {
        id: res.id || `NP${Math.floor(100000 + Math.random() * 900000)}`,
        reference: res.reference || `NP${Math.floor(100000 + Math.random() * 900000)}`,
        service: cartItems[0]?.service.name || "Washing Machine Repair - Inspection",
        package: cartItems[0]?.pkg.name || "Inspection",
        service_name: cartItems[0]?.service.name || "Washing Machine Repair - Inspection",
        package_name: cartItems[0]?.pkg.name || "Inspection",
        status: "CONFIRMED",
        payment_status: "PAID",
        created_at: new Date().toISOString(),
        total_amount_paise: totalPaise,
        price: {
          lines: [{ code: "SERVICE", amount_paise: totalPaise }],
          total_paise: totalPaise,
          currency: "INR",
        },
        slot: {
          start_at: `${scheduledDateStr}T14:00:00Z`,
          end_at: `${scheduledDateStr}T16:00:00Z`,
        },
        scheduled_date: scheduledDateStr,
        scheduled_slot: slotStr,
        scheduled_at: `${scheduledDateStr}T14:00:00Z`,
        address: {
          line_1: activeAddress?.line_1 || "Anna Nagar, Chennai - 600040",
          locality: activeAddress?.locality || "Anna Nagar",
          city: activeAddress?.city || "Chennai",
          postal_code: activeAddress?.postal_code || "600040",
        },
        technician: {
          name: "Ramesh K.",
          display_name: "Ramesh K.",
          phone: "+91 98765 00001",
          status: "ON_THE_WAY",
          rating: 4.9,
        },
      };

      setConfirmedBooking(newBooking);
      setCurrentStep("confirmed");
      clearCart();
    } catch {
      // Offline / fallback simulated confirmation matching Mockup
      const fallbackBooking: Booking = {
        id: "NP100456",
        reference: "NP100456",
        service: cartItems[0]?.service.name || "Washing Machine Repair - Inspection",
        package: cartItems[0]?.pkg.name || "Inspection",
        service_name: cartItems[0]?.service.name || "Washing Machine Repair - Inspection",
        package_name: cartItems[0]?.pkg.name || "Inspection",
        status: "CONFIRMED",
        payment_status: "PAID",
        created_at: new Date().toISOString(),
        total_amount_paise: totalPaise,
        price: {
          lines: [{ code: "SERVICE", amount_paise: totalPaise }],
          total_paise: totalPaise,
          currency: "INR",
        },
        slot: {
          start_at: "2026-11-18T14:00:00Z",
          end_at: "2026-11-18T16:00:00Z",
        },
        scheduled_date: `Wed, 18 Nov 2026`,
        scheduled_slot: "2:00 PM - 4:00 PM",
        scheduled_at: "2026-11-18T14:00:00Z",
        address: {
          line_1: activeAddress?.line_1 || "No. 12, 3rd Street, Anna Nagar, Chennai - 600040",
          locality: activeAddress?.locality || "Anna Nagar",
          city: activeAddress?.city || "Chennai",
          postal_code: activeAddress?.postal_code || "600040",
        },
        technician: {
          name: "Ramesh K.",
          display_name: "Ramesh K.",
          phone: "+91 98765 00001",
          status: "ON_THE_WAY",
          rating: 4.9,
        },
      };
      setConfirmedBooking(fallbackBooking);
      setCurrentStep("confirmed");
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewBooking = () => {
    setIsCartOpen(false);
    setCurrentStep("cart");
    if (confirmedBooking) {
      setActiveTrackingBooking(confirmedBooking);
    }
    setActiveTab("bookings");
  };

  const handleBookAnother = () => {
    setIsCartOpen(false);
    setCurrentStep("cart");
    setActiveTab("home");
  };

  return (
    <Modal
      visible={isCartOpen}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={() => {
        if (currentStep === "cart" || currentStep === "confirmed") {
          setIsCartOpen(false);
          setCurrentStep("cart");
        } else {
          // Go back one step
          if (currentStep === "address") setCurrentStep("cart");
          else if (currentStep === "date") setCurrentStep("address");
          else if (currentStep === "slot") setCurrentStep("date");
          else if (currentStep === "payment") setCurrentStep("slot");
        }
      }}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* ========================================================
            HEADER
            ======================================================== */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (currentStep === "cart" || currentStep === "confirmed") {
                setIsCartOpen(false);
                setCurrentStep("cart");
              } else if (currentStep === "address") setCurrentStep("cart");
              else if (currentStep === "date") setCurrentStep("address");
              else if (currentStep === "slot") setCurrentStep("date");
              else if (currentStep === "payment") setCurrentStep("slot");
            }}
            style={styles.headerBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.ink} />
          </Pressable>

          <Text style={styles.headerTitle}>
            {currentStep === "cart" && "Your Cart"}
            {currentStep === "address" && "Select Address"}
            {currentStep === "date" && "Select Date"}
            {currentStep === "slot" && "Choose Time Slot"}
            {currentStep === "payment" && "Payment"}
            {currentStep === "confirmed" && "Confirmation"}
          </Text>

          <View style={{ width: 36 }} />
        </View>

        {/* ========================================================
            STEP 1: YOUR CART (Screen 11 in Mockup)
            ======================================================== */}
        {currentStep === "cart" && (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              {cartItems.length === 0 ? (
                <View style={styles.emptyCartBox}>
                  <Ionicons name="cart-outline" size={56} color={colors.subtle} />
                  <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                  <Text style={styles.emptyCartSub}>
                    Browse our trusted home services and add inspection or repair packages.
                  </Text>
                  <Pressable
                    onPress={() => {
                      setIsCartOpen(false);
                      setActiveTab("services");
                    }}
                    style={styles.browseServicesBtn}
                  >
                    <Text style={styles.browseServicesBtnText}>Browse Services</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {/* Cart Item Cards with Steppers */}
                  <View style={styles.cartItemList}>
                    {cartItems.map((item) => {
                      const itemPaise =
                        item.pkg.price_paise ?? item.service.starting_price_paise ?? 19900;
                      return (
                        <View key={item.id} style={styles.cartCard}>
                          <Image
                            source={getServiceImage(item.service)}
                            style={styles.cartItemThumb}
                            resizeMode="cover"
                          />
                          <View style={styles.cartItemDetails}>
                            <Text style={styles.cartItemTitle} numberOfLines={2}>
                              {item.service.name}
                            </Text>
                            <Text style={styles.cartItemPrice}>
                              {formatInr(itemPaise)}
                            </Text>
                          </View>
                          <View style={styles.cartItemStepper}>
                            <Pressable
                              onPress={() =>
                                updateQuantity(item.service.id, item.pkg.id, -1)
                              }
                              style={styles.stepperActionBtn}
                            >
                              <Ionicons name="remove" size={14} color={colors.ink} />
                            </Pressable>
                            <Text style={styles.stepperCount}>{item.quantity}</Text>
                            <Pressable
                              onPress={() =>
                                updateQuantity(item.service.id, item.pkg.id, 1)
                              }
                              style={styles.stepperActionBtn}
                            >
                              <Ionicons name="add" size={14} color={colors.ink} />
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>

                  {/* Summary Box matching Mockup */}
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Item Total</Text>
                      <Text style={styles.summaryValue}>{formatInr(totalPaise)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Service Charge</Text>
                      <Text style={[styles.summaryValue, { color: colors.success }]}>
                        ₹0
                      </Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryTotalLabel}>Total Payable</Text>
                      <Text style={styles.summaryTotalValue}>{formatInr(totalPaise)}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {cartItems.length > 0 && (
              <View style={styles.bottomBar}>
                <Pressable
                  onPress={handleNextFromCart}
                  style={styles.pillActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Proceed to Book"
                >
                  <Text style={styles.pillActionBtnText}>Proceed to Book</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* ========================================================
            STEP 2: SELECT ADDRESS (Screen 12 in Mockup)
            ======================================================== */}
        {currentStep === "address" && (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <View style={styles.addressList}>
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <Pressable
                      key={addr.id}
                      onPress={() => setSelectedAddressId(addr.id)}
                      style={[styles.addressCard, isSelected && styles.addressCardSelected]}
                    >
                      <View style={styles.radioCircle}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.addressCardContent}>
                        <Text style={styles.addressLabel}>{addr.label || "Address"}</Text>
                        <Text style={styles.addressText}>{addr.line_1}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => setShowAddAddress(true)}
                style={styles.addAddressBtn}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.addAddressText}>Add New Address</Text>
              </Pressable>

              {/* Add Address Form Input */}
              {Boolean(showAddAddress) && (
                <View style={styles.newAddressBox}>
                  <Text style={styles.newAddressTitle}>Enter New Address</Text>
                  <TextInput
                    placeholder="No., Building, Street Name, Area…"
                    placeholderTextColor={colors.subtle}
                    value={newLine1}
                    onChangeText={setNewLine1}
                    style={styles.newAddressInput}
                    multiline
                  />
                  <View style={styles.newAddressActions}>
                    <Pressable
                      onPress={() => setShowAddAddress(false)}
                      style={styles.cancelAddressBtn}
                    >
                      <Text style={styles.cancelAddressBtnText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleCreateNewAddress}
                      style={styles.saveAddressBtn}
                    >
                      <Text style={styles.saveAddressBtnText}>Save Address</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                onPress={() => setCurrentStep("date")}
                style={styles.pillActionBtn}
              >
                <Text style={styles.pillActionBtnText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================
            STEP 3: SELECT DATE (Screen 13 in Mockup)
            ======================================================== */}
        {currentStep === "date" && (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <View style={styles.calendarContainer}>
                {/* Month Navigator */}
                <View style={styles.monthHeader}>
                  <Ionicons name="chevron-back" size={20} color={colors.ink} />
                  <Text style={styles.monthTitle}>Nov 2026</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.ink} />
                </View>

                {/* Day of Week Row */}
                <View style={styles.dayOfWeekRow}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <Text key={day} style={styles.dayOfWeekText}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Calendar Days Grid */}
                <View style={styles.daysGrid}>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((dayNum) => {
                    const isSelected = selectedDateDay === dayNum;
                    return (
                      <Pressable
                        key={dayNum}
                        onPress={() => setSelectedDateDay(dayNum)}
                        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            isSelected && styles.dayCellTextSelected,
                          ]}
                        >
                          {dayNum}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                onPress={() => setCurrentStep("slot")}
                style={styles.pillActionBtn}
              >
                <Text style={styles.pillActionBtnText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================
            STEP 4: CHOOSE TIME SLOT (Screen 14 in Mockup)
            ======================================================== */}
        {currentStep === "slot" && (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              {/* Selected Date Card */}
              <View style={styles.selectedDateCard}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.selectedDateCardText}>
                  Wed, {selectedDateDay} Nov 2026
                </Text>
              </View>

              {/* Time Slots List */}
              <View style={styles.slotsList}>
                {TIME_SLOTS.map((slot, idx) => {
                  const isSelected = selectedSlotIndex === idx;
                  return (
                    <Pressable
                      key={slot}
                      onPress={() => setSelectedSlotIndex(idx)}
                      style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                    >
                      <Text
                        style={[
                          styles.slotCardText,
                          isSelected && styles.slotCardTextSelected,
                        ]}
                      >
                        {slot}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                onPress={() => setCurrentStep("payment")}
                style={styles.pillActionBtn}
              >
                <Text style={styles.pillActionBtnText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================
            STEP 5: PAYMENT (Screen 15 in Mockup)
            ======================================================== */}
        {currentStep === "payment" && (
          <View style={styles.stepContainer}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              {/* Total Amount Box */}
              <View style={styles.paymentSummaryBox}>
                <Text style={styles.paymentSummaryLabel}>Total Amount</Text>
                <Text style={styles.paymentSummaryValue}>{formatInr(totalPaise)}</Text>
              </View>

              {/* Pay using UPI Section */}
              <Text style={styles.paymentMethodHeading}>Pay using UPI</Text>
              <View style={styles.upiOptionsContainer}>
                {UPI_APPS.map((app) => {
                  const isSelected = selectedUpiApp === app.id;
                  return (
                    <Pressable
                      key={app.id}
                      onPress={() => setSelectedUpiApp(app.id)}
                      style={[
                        styles.upiOptionRow,
                        isSelected && styles.upiOptionRowSelected,
                      ]}
                    >
                      <View style={styles.upiLeft}>
                        <View style={styles.upiIconCircle}>
                          <Ionicons
                            name={app.icon as any}
                            size={18}
                            color={colors.primary}
                          />
                        </View>
                        <Text style={styles.upiName}>{app.name}</Text>
                      </View>
                      <View style={styles.radioCircle}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.bottomBar}>
              <Pressable
                onPress={handleProcessPayment}
                disabled={isSubmitting}
                style={[styles.pillActionBtn, isSubmitting && { opacity: 0.7 }]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.pillActionBtnText}>Pay {formatInr(totalPaise)}</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* ========================================================
            STEP 6: BOOKING CONFIRMED! (Screen 16 in Mockup)
            ======================================================== */}
        {currentStep === "confirmed" && (
          <View style={styles.stepContainer}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.confirmedContent}
            >
              {/* Big Green Circle with Checkmark */}
              <View style={styles.greenCheckCircle}>
                <Ionicons name="checkmark" size={54} color={colors.white} />
              </View>

              <Text style={styles.confirmedHeading}>Booking Confirmed!</Text>
              <Text style={styles.bookingIdText}>
                Booking ID: {confirmedBooking?.reference || "NP100456"}
              </Text>

              {/* Booking Details Card matching Mockup */}
              <View style={styles.confirmedDetailsCard}>
                <Text style={styles.confirmedCardLabel}>Your service is booked for</Text>
                <Text style={styles.confirmedCardSchedule}>
                  Wed, {selectedDateDay} Nov 2026
                </Text>
                <Text style={styles.confirmedCardSlot}>
                  {TIME_SLOTS[selectedSlotIndex]}
                </Text>
                <Text style={styles.confirmedCardAddress}>
                  {activeAddress?.line_1 || "Anna Nagar, Chennai - 600040"}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.confirmedActions}>
                <Pressable
                  onPress={handleViewBooking}
                  style={styles.pillActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="View Booking"
                >
                  <Text style={styles.pillActionBtnText}>View Booking</Text>
                </Pressable>

                <Pressable
                  onPress={handleBookAnother}
                  style={styles.secondaryActionBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Book Another Service"
                >
                  <Text style={styles.secondaryActionBtnText}>
                    Book Another Service
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )}
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
    height: 52,
  },
  headerBtn: {
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
  stepContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 40,
  },

  // Step 1: Cart Items
  cartItemList: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  cartCard: {
    flexDirection: "row",
    alignItems: "center",
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
  cartItemThumb: {
    width: 54,
    height: 54,
    borderRadius: radii.md,
    backgroundColor: colors.canvasWarm,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 18,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 4,
  },
  cartItemStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  stepperActionBtn: {
    padding: 6,
  },
  stepperCount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  summaryCard: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
  emptyCartBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: spacing.sm,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
    marginTop: spacing.md,
  },
  emptyCartSub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 260,
  },
  browseServicesBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseServicesBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },

  // Step 2: Address Selection
  addressList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  addressCardContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  addressText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  addAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  newAddressBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  newAddressTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  newAddressInput: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 13,
    color: colors.ink,
    minHeight: 60,
  },
  newAddressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  cancelAddressBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  cancelAddressBtnText: {
    fontSize: 12,
    color: colors.muted,
  },
  saveAddressBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  saveAddressBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Step 3: Date Picker
  calendarContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
  },
  dayOfWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  dayOfWeekText: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  dayCell: {
    width: "14.28%",
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: 19,
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.ink,
  },
  dayCellTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },

  // Step 4: Time Slots
  selectedDateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  selectedDateCardText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  slotsList: {
    gap: spacing.md,
  },
  slotCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  slotCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotCardText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  slotCardTextSelected: {
    color: colors.white,
    fontWeight: "800",
  },

  // Step 5: Payment
  paymentSummaryBox: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  paymentSummaryLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  paymentSummaryValue: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.ink,
    marginTop: 4,
  },
  paymentMethodHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  upiOptionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  upiOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  upiOptionRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  upiLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  upiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  upiName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },

  // Step 6: Confirmation
  confirmedContent: {
    alignItems: "center",
    padding: spacing.xl,
    paddingTop: 40,
    gap: spacing.sm,
  },
  greenCheckCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmedHeading: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
  },
  bookingIdText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  confirmedDetailsCard: {
    width: "100%",
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: 4,
    marginBottom: spacing.xl,
  },
  confirmedCardLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  confirmedCardSchedule: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.ink,
    marginTop: 4,
  },
  confirmedCardSlot: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  confirmedCardAddress: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
    textAlign: "center",
  },
  confirmedActions: {
    width: "100%",
    gap: spacing.md,
  },
  secondaryActionBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionBtnText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },

  // Bottom Fixed Bar
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  pillActionBtn: {
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
  pillActionBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
