import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../api";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Booking } from "../types";

const TIME_SLOTS = [
  { id: "morning", label: "09:00 AM - 12:00 PM", icon: "sunny-outline" },
  { id: "afternoon", label: "01:00 PM - 04:00 PM", icon: "partly-sunny-outline" },
  { id: "evening", label: "05:00 PM - 08:00 PM", icon: "moon-outline" },
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
  } = useApp();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountPaise, setCouponDiscountPaise] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [problemNotes, setProblemNotes] = useState("");

  const [addressLine, setAddressLine] = useState("Plot 42, 1st Main Road, Adyar");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [contactPhone, setContactPhone] = useState(user?.phone_e164 || "+919876543210");
  const [contactName, setContactName] = useState(user?.name || "Customer");

  const [paymentMethod, setPaymentMethod] = useState<"VISIT" | "ONLINE">("VISIT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate 4 available days
  const days = [0, 1, 2, 3].map((offset) => {
    const d = new Date(Date.now() + offset * 86400000);
    const dayName =
      offset === 0
        ? "Today"
        : offset === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    return { offset, dayName, dateNum, month, dateStr: d.toISOString().split("T")[0] };
  });

  const subtotalPaise = cartTotalPaise;
  const taxesPaise = Math.round(subtotalPaise * 0.05); // 5% GST
  const totalPayablePaise = Math.max(0, subtotalPaise + taxesPaise - couponDiscountPaise);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "WELCOME50") {
      setCouponDiscountPaise(25000); // ₹250
      setCouponApplied(true);
      Alert.alert("Coupon Applied!", "WELCOME50: ₹250 discount applied.");
    } else if (code === "ACSUMMER") {
      setCouponDiscountPaise(15000); // ₹150
      setCouponApplied(true);
      Alert.alert("Coupon Applied!", "ACSUMMER: ₹150 discount applied.");
    } else {
      Alert.alert("Invalid Code", "Please enter a valid coupon code like WELCOME50 or ACSUMMER.");
    }
  };

  const handleConfirmBooking = async () => {
    if (cartItems.length === 0) return;

    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in with Firebase OTP to confirm your booking and receive live technician updates.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In with OTP", onPress: () => setIsAuthOpen(true) },
        ]
      );
      return;
    }

    setIsSubmitting(true);

    const primaryItem = cartItems[0];
    const chosenDay = days[selectedDayIndex];
    const chosenSlot = TIME_SLOTS[selectedSlotIndex];

    try {
      // 1. Try Live Backend hold + quote + confirm
      const refCode = `NP-${Math.floor(10000 + Math.random() * 90000)}`;

      // Construct live booking object
      const newBooking: Booking = {
        id: `book-${Date.now()}`,
        reference: refCode,
        status: "ASSIGNED",
        payment_status: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
        service: primaryItem.service.name,
        package: primaryItem.pkg.name,
        package_id: primaryItem.pkg.id,
        address: {
          line_1: addressLine,
          locality: "Adyar",
          city: selectedCity,
          postal_code: selectedPincode,
        },
        slot: {
          start_at: `${chosenDay.dateStr}T10:00:00+05:30`,
          end_at: `${chosenDay.dateStr}T12:00:00+05:30`,
        },
        price: {
          lines: [
            { code: "SERVICE", amount_paise: subtotalPaise },
            { code: "TAX", amount_paise: taxesPaise },
          ],
          total_paise: totalPayablePaise,
          currency: "INR",
        },
        technician: {
          name: "Suresh Kumar",
          phone: "+919840123456",
          status: "ASSIGNED",
          rating: 4.9,
          completed_jobs: 184,
        },
        start_otp_code: `${Math.floor(1000 + Math.random() * 9000)}`,
        problem_description: problemNotes,
        can_cancel: true,
        can_reschedule: true,
        created_at: new Date().toISOString(),
      };

      // Save to local / demo bookings store & try live API
      await api.saveDemoBooking(newBooking);

      clearCart();
      setIsCartOpen(false);
      setActiveTab("bookings");

      Alert.alert(
        "Booking Confirmed! 🎉",
        `Your visit for ${primaryItem.service.name} has been booked for ${chosenDay.dayName} (${chosenSlot.label}). Reference: ${refCode}`
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <Modal
      visible={isCartOpen}
      animationType="slide"
      transparent
      onRequestClose={() => setIsCartOpen(false)}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={() => setIsCartOpen(false)} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.headerTitle}>Your Booking Cart</Text>
              <Text style={styles.headerSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} selected
              </Text>
            </View>
            <Pressable
              onPress={() => setIsCartOpen(false)}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close cart"
            >
              <Ionicons name="close" size={20} color={colors.ink} />
            </Pressable>
          </View>

          {Boolean(cartItems.length === 0) ? (
            <View style={styles.emptyCart}>
              <Ionicons name="cart-outline" size={56} color={colors.subtle} />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySub}>
                Explore our catalog to find verified services for your home.
              </Text>
              <Pressable
                onPress={() => {
                  setIsCartOpen(false);
                  setActiveTab("services");
                }}
                style={styles.browseBtn}
              >
                <Text style={styles.browseBtnText}>Explore Services</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. Cart Items List */}
                <View style={styles.itemsSection}>
                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.service.name}</Text>
                        <Text style={styles.itemPackage}>{item.pkg.name}</Text>
                        <Text style={styles.itemPrice}>
                          {formatInr(item.pkg.price_paise ?? item.service.starting_price_paise)}
                        </Text>
                      </View>
                      <View style={styles.stepper}>
                        <Pressable
                          onPress={() => updateQuantity(item.service.id, item.pkg.id, -1)}
                          style={styles.stepBtn}
                        >
                          <Ionicons name="remove" size={16} color={colors.primary} />
                        </Pressable>
                        <Text style={styles.stepCount}>{item.quantity}</Text>
                        <Pressable
                          onPress={() => updateQuantity(item.service.id, item.pkg.id, 1)}
                          style={styles.stepBtn}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>

                {/* 2. Slot Picker */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Visit Date & Time</Text>
                  {/* Days */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dayScroll}
                  >
                    {days.map((day, idx) => {
                      const isSelected = selectedDayIndex === idx;
                      return (
                        <Pressable
                          key={day.offset}
                          onPress={() => setSelectedDayIndex(idx)}
                          style={[styles.dayCard, isSelected && styles.dayCardSelected]}
                        >
                          <Text
                            style={[styles.dayName, isSelected && styles.dayNameSelected]}
                          >
                            {day.dayName}
                          </Text>
                          <Text
                            style={[styles.dateNum, isSelected && styles.dateNumSelected]}
                          >
                            {day.dateNum}
                          </Text>
                          <Text
                            style={[styles.monthText, isSelected && styles.monthTextSelected]}
                          >
                            {day.month}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Time Slots */}
                  <View style={styles.slotsRow}>
                    {TIME_SLOTS.map((slot, idx) => {
                      const isSelected = selectedSlotIndex === idx;
                      return (
                        <Pressable
                          key={slot.id}
                          onPress={() => setSelectedSlotIndex(idx)}
                          style={[styles.slotChip, isSelected && styles.slotChipSelected]}
                        >
                          <Ionicons
                            name={slot.icon as keyof typeof Ionicons.glyphMap}
                            size={14}
                            color={isSelected ? colors.white : colors.primary}
                          />
                          <Text
                            style={[
                              styles.slotChipText,
                              isSelected && styles.slotChipTextSelected,
                            ]}
                          >
                            {slot.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* 3. Service Address */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Service Address</Text>
                    <Pressable onPress={() => setIsEditingAddress(!isEditingAddress)}>
                      <Text style={styles.editText}>
                        {isEditingAddress ? "Done" : "Change"}
                      </Text>
                    </Pressable>
                  </View>

                  {isEditingAddress ? (
                    <View style={styles.addressForm}>
                      <TextInput
                        placeholder="House / Flat / Street"
                        value={addressLine}
                        onChangeText={setAddressLine}
                        style={styles.formInput}
                      />
                      <TextInput
                        placeholder="Contact Name"
                        value={contactName}
                        onChangeText={setContactName}
                        style={styles.formInput}
                      />
                      <TextInput
                        placeholder="Mobile Number"
                        value={contactPhone}
                        onChangeText={setContactPhone}
                        keyboardType="phone-pad"
                        style={styles.formInput}
                      />
                    </View>
                  ) : (
                    <View style={styles.addressCard}>
                      <Ionicons name="home-outline" size={20} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.addressLine}>{addressLine}</Text>
                        <Text style={styles.addressSub}>
                          {selectedCity} • {selectedPincode}
                        </Text>
                        <Text style={styles.contactSub}>
                          Contact: {contactName} ({contactPhone})
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. Problem Description / Instructions */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Any Specific Instructions? (Optional)</Text>
                  <TextInput
                    placeholder="e.g. AC cooling low, please bring 10ft ladder, gate code #42"
                    placeholderTextColor={colors.subtle}
                    value={problemNotes}
                    onChangeText={setProblemNotes}
                    multiline
                    numberOfLines={2}
                    style={styles.notesInput}
                  />
                </View>

                {/* 5. Coupon Code */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Coupons & Offers</Text>
                  <View style={styles.couponRow}>
                    <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                    <TextInput
                      placeholder="Enter promo code (e.g. WELCOME50)"
                      placeholderTextColor={colors.subtle}
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                      style={styles.couponInput}
                    />
                    <Pressable
                      onPress={handleApplyCoupon}
                      style={styles.couponBtn}
                      disabled={couponApplied || !couponCode.trim()}
                    >
                      <Text style={styles.couponBtnText}>
                        {couponApplied ? "APPLIED" : "APPLY"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* 6. Payment Choice */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Payment Option</Text>
                  <View style={styles.paymentRow}>
                    <Pressable
                      onPress={() => setPaymentMethod("VISIT")}
                      style={[
                        styles.paymentChoice,
                        paymentMethod === "VISIT" && styles.paymentChoiceSelected,
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={20}
                        color={paymentMethod === "VISIT" ? colors.primary : colors.muted}
                      />
                      <View>
                        <Text style={styles.paymentChoiceTitle}>Pay on Visit</Text>
                        <Text style={styles.paymentChoiceSub}>Cash, UPI, or Card</Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => setPaymentMethod("ONLINE")}
                      style={[
                        styles.paymentChoice,
                        paymentMethod === "ONLINE" && styles.paymentChoiceSelected,
                      ]}
                    >
                      <Ionicons
                        name="card-outline"
                        size={20}
                        color={paymentMethod === "ONLINE" ? colors.primary : colors.muted}
                      />
                      <View>
                        <Text style={styles.paymentChoiceTitle}>Pre-pay Online</Text>
                        <Text style={styles.paymentChoiceSub}>UPI, NetBanking</Text>
                      </View>
                    </Pressable>
                  </View>
                </View>

                {/* 7. Bill Details Breakdown */}
                <View style={styles.billBox}>
                  <Text style={styles.billTitle}>Bill Breakdown</Text>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Total</Text>
                    <Text style={styles.billValue}>{formatInr(subtotalPaise)}</Text>
                  </View>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Service Tax & GST (5%)</Text>
                    <Text style={styles.billValue}>{formatInr(taxesPaise)}</Text>
                  </View>
                  {Boolean(couponDiscountPaise > 0) && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billLabel, { color: colors.success }]}>
                        Coupon Discount
                      </Text>
                      <Text style={[styles.billValue, { color: colors.success }]}>
                        -{formatInr(couponDiscountPaise)}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.billRow, styles.billTotalRow]}>
                    <Text style={styles.billTotalLabel}>Total Amount Payable</Text>
                    <Text style={styles.billTotalValue}>
                      {formatInr(totalPayablePaise)}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Sticky Footer */}
              <View style={styles.footerBar}>
                <View>
                  <Text style={styles.footerPrice}>
                    {formatInr(totalPayablePaise)}
                  </Text>
                  <Text style={styles.footerPriceSub}>
                    {paymentMethod === "VISIT" ? "Pay after inspection" : "Pay online"}
                  </Text>
                </View>

                <Pressable
                  onPress={handleConfirmBooking}
                  disabled={isSubmitting}
                  style={[styles.confirmBtn, isSubmitting && { opacity: 0.7 }]}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <>
                      <Text style={styles.confirmBtnText}>Book Visit Now</Text>
                      <Ionicons name="arrow-forward" size={16} color={colors.white} />
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(28, 25, 23, 0.45)",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: "92%",
    minHeight: "60%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.ink,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.muted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.canvasWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCart: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.md,
  },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  browseBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  browseBtnText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  itemsSection: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  itemPackage: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 4,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepCount: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    paddingHorizontal: 6,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  dayScroll: {
    gap: spacing.sm,
    paddingVertical: 4,
  },
  dayCard: {
    width: 68,
    paddingVertical: 8,
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  dayCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dateNum: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.ink,
    marginVertical: 2,
  },
  dateNumSelected: {
    color: colors.white,
  },
  monthText: {
    fontSize: 10,
    color: colors.muted,
  },
  monthTextSelected: {
    color: colors.white,
  },
  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvasWarm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radii.pill,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  slotChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },
  slotChipTextSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.canvasWarm,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  addressLine: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  addressSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  contactSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  addressForm: {
    gap: spacing.xs,
  },
  formInput: {
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.ink,
  },
  notesInput: {
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 12,
    color: colors.ink,
    minHeight: 48,
  },
  couponRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  couponInput: {
    flex: 1,
    fontSize: 12,
    color: colors.ink,
  },
  couponBtn: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.sm,
  },
  couponBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },
  paymentRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  paymentChoice: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  paymentChoiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  paymentChoiceTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
  },
  paymentChoiceSub: {
    fontSize: 10,
    color: colors.muted,
  },
  billBox: {
    backgroundColor: colors.canvasWarm,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  billTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  billValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
  },
  billTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  billTotalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  billTotalValue: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primary,
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primary,
  },
  footerPriceSub: {
    fontSize: 10,
    color: colors.muted,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  confirmBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
