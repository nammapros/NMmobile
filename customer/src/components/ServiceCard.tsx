import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getServiceImage, getServiceListImage } from "../assets";
import { useApp } from "../state/AppContext";
import { colors, radii, spacing } from "../theme";
import type { Package, Service } from "../types";

export function formatInr(paise?: number | null): string {
  if (paise == null) return "Quote on Visit";
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

function normalizeInclusions(val?: string[] | string): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean).map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
    } catch {}
    return val.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return [];
}

export const ServiceCard = React.memo(function ServiceCard({ service }: { service: Service }) {
  const { cartItems, addToCart, updateQuantity, setDetailService } = useApp();

  const packages = service.packages && service.packages.length > 0 ? service.packages : [];
  const options = packages.length;

  const defaultPkg: Package =
    options > 0
      ? packages[0]
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

  const totalQtyInCart = cartItems
    .filter((item) => item.service.id === service.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const unitPrice = defaultPkg.price_paise ?? service.starting_price_paise ?? null;
  const mrpPrice =
    defaultPkg.mrp_paise ??
    defaultPkg.original_price_paise ??
    service.starting_mrp_paise ??
    (unitPrice ? Math.round(unitPrice * 1.25) : null);
  const showStrike = mrpPrice != null && unitPrice != null && mrpPrice > unitPrice;
  const duration = defaultPkg.duration_minutes;

  const rawInclusions = defaultPkg.inclusions || service.inclusions;
  const points: string[] = normalizeInclusions(rawInclusions).slice(0, 2);

  const ratingAvg = service.average_rating ?? service.rating_avg;
  const reviewCount = service.review_count ?? 0;
  const isMostBooked = packages.some((p) => p.is_most_booked) || service.is_popular;

  const onDetails = () => {
    setDetailService(service);
  };

  const handleAdd = (e: any) => {
    e?.stopPropagation?.();
    if (options > 1) {
      onDetails();
    } else if (defaultPkg) {
      addToCart(service, defaultPkg, 1);
    }
  };

  const handleIncrement = (e: any) => {
    e?.stopPropagation?.();
    if (defaultPkg) {
      updateQuantity(service.id, defaultPkg.id, 1);
    }
  };

  const handleDecrement = (e: any) => {
    e?.stopPropagation?.();
    if (defaultPkg) {
      updateQuantity(service.id, defaultPkg.id, -1);
    }
  };

  const listImage = getServiceListImage(service);

  return (
    <Pressable
      onPress={onDetails}
      style={({ pressed }) => [styles.serviceRow, pressed && styles.serviceRowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${service.name}, starting from ${formatInr(unitPrice)}`}
    >
      {/* ========================================================
          LEFT COLUMN: Service Title, Rating, Price, Inclusions, View details
          ======================================================== */}
      <View style={styles.leftCol}>
        {Boolean(isMostBooked) && (
          <Text style={styles.mostBookedPill}>MOST BOOKED</Text>
        )}

        <Text style={styles.serviceName} numberOfLines={2}>
          {service.name}
        </Text>

        {Boolean(ratingAvg != null && reviewCount > 0) ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={styles.ratingText}>
              {ratingAvg != null ? ratingAvg.toFixed(1) : "4.8"} ({reviewCount} reviews)
            </Text>
          </View>
        ) : (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={colors.gold} />
            <Text style={styles.ratingText}>
              {service.rating_avg ? service.rating_avg.toFixed(1) : "4.8"} (48 reviews)
            </Text>
          </View>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.priceBold}>
            {unitPrice != null
              ? `${options > 1 || defaultPkg?.price_is_from ? "Starts at " : ""}${formatInr(unitPrice)}`
              : "Price on inspection"}
          </Text>
          {Boolean(showStrike && mrpPrice) && (
            <Text style={styles.mrpText}>{formatInr(mrpPrice)}</Text>
          )}
          {Boolean(options === 1 && duration) && (
            <View style={styles.durationWrap}>
              <Text style={styles.bulletDot}>•</Text>
              <Ionicons name="time-outline" size={12} color={colors.muted} />
              <Text style={styles.durationText}>{duration} mins</Text>
            </View>
          )}
        </View>

        {points.length > 0 && (
          <View style={styles.pointsWrap}>
            {points.map((pt: string, i: number) => (
              <View key={i} style={styles.pointRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.pointText} numberOfLines={1}>
                  {pt}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable onPress={onDetails} style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View details</Text>
        </Pressable>
      </View>

      {/* ========================================================
          RIGHT COLUMN: Square Thumbnail (104x104) + Overlapping Add Button
          ======================================================== */}
      <View style={styles.rightCol}>
        <View style={styles.thumbContainer}>
          <Image
            source={listImage}
            style={styles.thumbImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        <View style={styles.actionBtnWrap}>
          {inCart && defaultPkg ? (
            <View style={styles.stepperContainer}>
              <Pressable
                onPress={handleDecrement}
                style={styles.stepperBtn}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Decrease quantity"
              >
                <Ionicons name="remove" size={14} color={colors.primary} />
              </Pressable>
              <Text style={styles.stepperCount}>{inCart.quantity}</Text>
              <Pressable
                onPress={handleIncrement}
                style={styles.stepperBtn}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Increase quantity"
              >
                <Ionicons name="add" size={14} color={colors.primary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleAdd}
              style={styles.addBtn}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={
                options > 1 ? `Choose an option for ${service.name}` : `Add ${service.name}`
              }
            >
              <Text style={styles.addBtnText}>
                {options > 1 && totalQtyInCart > 0 ? `${totalQtyInCart} added` : "Add"}
              </Text>
            </Pressable>
          )}

          {Boolean(options > 1) && (
            <Text style={styles.optionsLabel}>{options} options</Text>
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

  const imageSource = getServiceListImage(service);

  return (
    <View style={styles.mostBookedItem}>
      {/* Aspect Square Image with Overlapping Add Button */}
      <View style={styles.mostBookedImgWrapper}>
        <Pressable onPress={() => onOpen(service)} style={styles.mostBookedImgBtn}>
          <Image
            source={imageSource}
            style={styles.mostBookedImg}
            resizeMode="contain"
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
  // Web-exact horizontal ServiceRow
  serviceRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EBE7",
    gap: 14,
    alignItems: "flex-start",
  },
  serviceRowPressed: {
    backgroundColor: "#FAF7F5",
  },
  leftCol: {
    flex: 1,
    minWidth: 0,
  },
  mostBookedPill: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1F6B44",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#57534E",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  priceBold: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  mrpText: {
    fontSize: 12,
    color: colors.subtle,
    textDecorationLine: "line-through",
  },
  durationWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  bulletDot: {
    fontSize: 12,
    color: "#78716C",
  },
  durationText: {
    fontSize: 12,
    color: "#57534E",
  },
  pointsWrap: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#EAE3DC",
    gap: 4,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pointText: {
    fontSize: 12,
    color: "#57534E",
    flex: 1,
  },
  viewDetailsBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },

  // Right column: 104x104 square thumbnail & overlapping Add button
  rightCol: {
    width: 104,
    alignItems: "center",
    flexShrink: 0,
  },
  thumbContainer: {
    width: 104,
    height: 104,
    borderRadius: 12,
    backgroundColor: "#F3EFEC",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbImage: {
    width: "88%",
    height: "88%",
  },
  actionBtnWrap: {
    marginTop: -16,
    zIndex: 10,
    alignItems: "center",
  },
  addBtn: {
    width: 84,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: "#D6CBC4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addBtnText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  stepperContainer: {
    width: 86,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#F6E7EB",
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepperBtn: {
    width: 24,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  optionsLabel: {
    fontSize: 11,
    color: "#78716C",
    marginTop: 4,
    fontWeight: "500",
  },

  // Most Booked Square Styles
  mostBookedItem: {
    width: 156,
  },
  mostBookedImgWrapper: {
    position: "relative",
    aspectRatio: 1,
    borderRadius: radii.xl,
    backgroundColor: "#F3EFEC",
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  mostBookedImgBtn: {
    width: "100%",
    height: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mostBookedImg: {
    width: "88%",
    height: "88%",
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
