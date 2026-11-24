import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getServiceImage } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Package, Service } from "../types";

export function formatInr(paise?: number | null): string {
  if (paise == null) return "Quote on Visit";
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export const ServiceCard = React.memo(function ServiceCard({ service }: { service: Service }) {
  const { cartItems, addToCart, updateQuantity, setDetailService } = useApp();

  const defaultPkg: Package =
    service.packages && service.packages.length > 0
      ? service.packages[0]
      : {
          id: `pkg-${service.id}`,
          name: service.name,
          pricing_model: "FIXED_PRICE",
          duration_minutes: 60,
          inclusions: ["Inspection", "Complete Service", "Post-service Testing"],
          exclusions: ["Replacement parts if required"],
          price_paise: service.starting_price_paise ?? 49900,
        };

  const inCart = cartItems.find(
    (item) => item.service.id === service.id && item.pkg.id === defaultPkg.id
  );

  const pricePaise = defaultPkg.price_paise ?? service.starting_price_paise ?? 49900;
  const mrpPaise = service.starting_mrp_paise ?? Math.round(pricePaise * 1.25);
  const showDiscount = mrpPaise > pricePaise;

  const handleAdd = (e: any) => {
    e?.stopPropagation?.();
    addToCart(service, defaultPkg, 1);
  };

  const handleIncrement = (e: any) => {
    e?.stopPropagation?.();
    updateQuantity(service.id, defaultPkg.id, 1);
  };

  const handleDecrement = (e: any) => {
    e?.stopPropagation?.();
    updateQuantity(service.id, defaultPkg.id, -1);
  };

  const bannerSource = getServiceImage(service);

  return (
    <Pressable
      onPress={() => setDetailService(service)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${service.name}, starting from ${formatInr(pricePaise)}`}
    >
      {/* Top Banner Image with Aspect Ratio matching web */}
      <View style={styles.imageContainer}>
        <Image
          source={bannerSource}
          style={styles.bannerImage}
          resizeMode="cover"
          fadeDuration={0}
        />

        {/* Rating Pill */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color={colors.gold} />
          <Text style={styles.ratingText}>
            {service.rating_avg ? service.rating_avg.toFixed(1) : "4.8"}
          </Text>
          <Text style={styles.ratingCount}>
            ({service.review_count || 48})
          </Text>
        </View>
      </View>

      {/* Body Info */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {service.name}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {service.summary || service.short_description || "Professional service by verified technician"}
        </Text>

        {Boolean(defaultPkg.duration_minutes) && (
          <View style={styles.durationRow}>
            <Ionicons name="time-outline" size={12} color={colors.primary} />
            <Text style={styles.durationText}>{defaultPkg.duration_minutes} mins</Text>
          </View>
        )}

        {/* Footer: Price + Add Button */}
        <View style={styles.footer}>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatInr(pricePaise)}</Text>
              {Boolean(showDiscount) && (
                <Text style={styles.mrp}>{formatInr(mrpPaise)}</Text>
              )}
            </View>
            <Text style={styles.priceSub}>Upfront pricing</Text>
          </View>

          {inCart ? (
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={handleDecrement}
                style={styles.stepperBtn}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={15} color={colors.primary} />
              </Pressable>
              <Text style={styles.stepperCount}>{inCart.quantity}</Text>
              <Pressable
                onPress={handleIncrement}
                style={styles.stepperBtn}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={15} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleAdd}
              style={styles.addBtn}
              accessibilityRole="button"
              accessibilityLabel={`Add ${service.name} to cart`}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
});

/** Most Booked Services Square Card matching Web Card */
export const MostBookedCard = React.memo(function MostBookedCard({
  service,
  onOpen,
}: {
  service: Service;
  onOpen: (s: Service) => void;
}) {
  const { cartItems, addToCart, updateQuantity } = useApp();

  const defaultPkg: Package =
    service.packages && service.packages.length > 0
      ? service.packages[0]
      : {
          id: `pkg-${service.id}`,
          name: service.name,
          pricing_model: "FIXED_PRICE",
          price_paise: service.starting_price_paise ?? 49900,
          inclusions: [],
          exclusions: [],
        };

  const inCart = cartItems.find(
    (item) => item.service.id === service.id && item.pkg.id === defaultPkg.id
  );

  const pricePaise = defaultPkg.price_paise ?? service.starting_price_paise ?? 49900;
  const mrpPaise = service.starting_mrp_paise ?? Math.round(pricePaise * 1.3);

  const bannerSource = getServiceImage(service);

  return (
    <View style={styles.mostBookedItem}>
      {/* Aspect Square Image with Overlapping Add Button */}
      <View style={styles.mostBookedImgWrapper}>
        <Pressable onPress={() => onOpen(service)} style={styles.mostBookedImgBtn}>
          <Image
            source={bannerSource}
            style={styles.mostBookedImg}
            resizeMode="cover"
            fadeDuration={0}
          />
        </Pressable>

        {/* Floating Add Button overlapping bottom-right corner matching web */}
        <View style={styles.floatingAddWrapper}>
          {inCart ? (
            <View style={styles.mostBookedStepper}>
              <Pressable
                onPress={() => updateQuantity(service.id, defaultPkg.id, -1)}
                style={styles.mostBookedStepBtn}
              >
                <Ionicons name="remove" size={14} color={colors.primary} />
              </Pressable>
              <Text style={styles.mostBookedStepCount}>{inCart.quantity}</Text>
              <Pressable
                onPress={() => updateQuantity(service.id, defaultPkg.id, 1)}
                style={styles.mostBookedStepBtn}
              >
                <Ionicons name="add" size={14} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => addToCart(service, defaultPkg, 1)}
              style={styles.mostBookedAddBtn}
            >
              <Text style={styles.mostBookedAddBtnText}>Add</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Name and Price */}
      <Pressable onPress={() => onOpen(service)} style={styles.mostBookedDetails}>
        <Text style={styles.mostBookedTitle} numberOfLines={2}>
          {service.name}
        </Text>
        <View style={styles.mostBookedPriceRow}>
          <Text style={styles.mostBookedPrice}>From {formatInr(pricePaise)}</Text>
          {Boolean(mrpPaise > pricePaise) && (
            <Text style={styles.mostBookedMrp}>{formatInr(mrpPaise)}</Text>
          )}
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "#EAE3DC",
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    borderColor: colors.primary,
  },
  imageContainer: {
    height: 135,
    backgroundColor: colors.canvasWarm,
    position: "relative",
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
    gap: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.ink,
  },
  ratingCount: {
    fontSize: 10,
    color: colors.muted,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 20,
  },
  summary: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 16,
    marginTop: 4,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  durationText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  mrp: {
    fontSize: 12,
    color: colors.subtle,
    textDecorationLine: "line-through",
  },
  priceSub: {
    fontSize: 10,
    color: colors.muted,
  },
  addBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E2D9D0",
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radii.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
    paddingHorizontal: 4,
  },
  // Most Booked Square Styles
  mostBookedItem: {
    width: 156,
  },
  mostBookedImgWrapper: {
    position: "relative",
    aspectRatio: 1,
    borderRadius: radii.xl,
    backgroundColor: colors.canvasWarm,
    marginBottom: 14,
  },
  mostBookedImgBtn: {
    width: "100%",
    height: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  mostBookedImg: {
    width: "100%",
    height: "100%",
  },
  floatingAddWrapper: {
    position: "absolute",
    bottom: -12,
    right: 8,
  },
  mostBookedAddBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E2D9D0",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mostBookedAddBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  mostBookedStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  mostBookedStepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mostBookedStepCount: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  mostBookedDetails: {
    marginTop: 4,
    gap: 2,
  },
  mostBookedTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 18,
  },
  mostBookedPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 2,
  },
  mostBookedPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.ink,
  },
  mostBookedMrp: {
    fontSize: 11,
    color: colors.subtle,
    textDecorationLine: "line-through",
  },
});
