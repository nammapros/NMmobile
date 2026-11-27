import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  BrandAssets,
  CategoryCardAssets,
  HomeIconAssets,
  ServiceBannerAssets,
  SpotlightAssets,
  getServiceListImage,
} from "../assets";
import { formatInr } from "../components/ServiceCard";
import { useApp } from "../state/AppContext";
import { colors, radii, radius, spacing } from "../theme";
import type { Service } from "../types";

// ============================================================================
// STATIC DATA: Module-level singletons for 0ms instant render & zero re-allocations
// ============================================================================
const POPULAR_SEARCHES = [
  "AC service",
  "Washing machine",
  "Fridge repair",
  "Water tank cleaning",
  "Sofa repair",
  "Electrician",
  "Plumber",
  "Deep house cleaning",
];

const PROMO_CAROUSEL_SLIDES = [
  {
    id: "ac-summer",
    title: "AC Deep Cleaning & Gas Refill",
    subtitle: "Starts at ₹499 • Verified experts",
    cta: "Book now",
    categorySlug: "ac",
    image: ServiceBannerAssets.ac,
    badge: "RECOMMENDED",
  },
  {
    id: "tank-clean",
    title: "Water Tank 6-Stage UV Sanitizing",
    subtitle: "Starts at ₹799 • 100% sludge removal",
    cta: "Book now",
    categorySlug: "water-tank-cleaning",
    image: ServiceBannerAssets["water-tank-cleaning"],
    badge: "POPULAR",
  },
  {
    id: "appliances",
    title: "Appliance Quick Repair & Fix",
    subtitle: "Starts at ₹299 • Washing Machine, Fridge",
    cta: "Book now",
    categorySlug: "appliances",
    image: ServiceBannerAssets.appliances,
    badge: "SAME DAY",
  },
  {
    id: "sofa-deep",
    title: "Sofa Spa & Upholstery Care",
    subtitle: "Starts at ₹499 • Deep stain removal",
    cta: "Book now",
    categorySlug: "sofa",
    image: ServiceBannerAssets.sofa,
    badge: "TRENDING",
  },
];

const HOME_CATEGORIES = [
  {
    key: "cleaning",
    title: "Cleaning &\nPest Control",
    timeBadge: "55 mins",
    icon: HomeIconAssets["deep-cleaning"],
    slug: "cleaning",
  },
  {
    key: "ac",
    title: "AC & Appliance\nRepair",
    timeBadge: "44 mins",
    icon: HomeIconAssets.ac,
    slug: "ac",
  },
  {
    key: "handyman",
    title: "Electrician,\nPlumber & Carpenter",
    timeBadge: "29 mins",
    icon: HomeIconAssets.handyman,
    slug: "electrician",
  },
  {
    key: "tank",
    title: "Water Tank\nCleaning",
    timeBadge: "30 mins",
    icon: HomeIconAssets["water-tank-cleaning"],
    slug: "water-tank-cleaning",
  },
  {
    key: "appliances",
    title: "Washing Machine\n& Refrigerator",
    timeBadge: "45 mins",
    icon: HomeIconAssets["appliance-services"],
    slug: "appliances",
  },
  {
    key: "sofa",
    title: "Sofa Repair\n& Cleaning",
    timeBadge: "50 mins",
    icon: HomeIconAssets["sofa-repair"],
    slug: "sofa",
  },
  {
    key: "mosquito",
    title: "Mosquito Net\nProtection",
    timeBadge: "60 mins",
    icon: HomeIconAssets["mosquito-net"],
    slug: "mosquito-net",
  },
  {
    key: "painting",
    title: "Home Painting\n& Upgrade",
    timeBadge: "24 hrs",
    icon: HomeIconAssets.carpenter,
    slug: "carpenter",
  },
];

const NEW_AND_NOTEWORTHY = [
  {
    id: "full-home",
    title: "Full Home / By Room Cleaning",
    timeBadge: "45 mins",
    image: CategoryCardAssets.cleaning,
    slug: "cleaning",
  },
  {
    id: "tank-sanitize",
    title: "Water Tank Deep Sanitize",
    timeBadge: "30 mins",
    image: ServiceBannerAssets["water-tank-cleaning"],
    slug: "water-tank-cleaning",
  },
  {
    id: "living-bed",
    title: "Living & Bedroom Cleaning",
    timeBadge: "50 mins",
    image: CategoryCardAssets.appliances,
    slug: "cleaning",
  },
  {
    id: "sofa-deep",
    title: "Sofa Deep Cleaning & Repair",
    timeBadge: "49 mins",
    image: ServiceBannerAssets.sofa,
    slug: "sofa",
  },
  {
    id: "stove-repair",
    title: "Stove Service & Repair",
    timeBadge: "44 mins",
    image: HomeIconAssets["kitchen-cleaning"],
    slug: "appliances",
  },
  {
    id: "wm-tuneup",
    title: "Washing Machine Repair",
    timeBadge: "45 mins",
    image: HomeIconAssets["washing-machine"],
    slug: "appliances",
  },
  {
    id: "fridge-refill",
    title: "Refrigerator Gas Refill",
    timeBadge: "40 mins",
    image: HomeIconAssets.refrigerator,
    slug: "appliances",
  },
  {
    id: "electrician-quick",
    title: "Electrician On-Demand",
    timeBadge: "29 mins",
    image: HomeIconAssets.electrician,
    slug: "electrician",
  },
];

const BANNER_WIDTH = Dimensions.get("window").width - spacing.lg * 2;
const BANNER_HEIGHT = Math.round(BANNER_WIDTH * 0.44);
const PRODUCT_CARD_WIDTH = Math.min(Dimensions.get("window").width * 0.4, 160);

export function HomeScreen() {
  const {
    catalog,
    loadingCatalog,
    refreshCatalog,
    setActiveTab,
    setSelectedCategorySlug,
    selectedCity,
    setDetailService,
    setSearchQuery,
    activeTrackingBooking,
    setIsLocationModalOpen,
    setIsAuthOpen,
    user,
    savedAddresses,
    cartItemCount,
    cartItems,
    addToCart,
    updateQuantity,
    setIsCartOpen,
  } = useApp();

  const [hintIndex, setHintIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const bannerScrollRef = useRef<any>(null);

  // Rotating search placeholder hint every 2.5s (matching ps-mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((prev) => (prev + 1) % POPULAR_SEARCHES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Auto-advancing banner carousel every 4s (matching ps-mobile)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % PROMO_CAROUSEL_SLIDES.length;
        bannerScrollRef.current?.scrollTo({
          x: next * (BANNER_WIDTH + spacing.md),
          animated: true,
        });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const activeAddressLine =
    savedAddresses && savedAddresses.length > 0
      ? savedAddresses[0].line_1 || savedAddresses[0].locality || savedAddresses[0].label || `${selectedCity} • Anna Nagar`
      : `${selectedCity} • Anna Nagar`;

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setSearchFocused(false);
    Keyboard.dismiss();
    setActiveTab("services");
  };

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategorySlug(catSlug);
    setSearchQuery("");
    setSearchFocused(false);
    Keyboard.dismiss();
    setActiveTab("services");
  };

  const handleWalletPress = () => {
    Alert.alert(
      "NammaPros Wallet",
      "Current Wallet Balance: ₹0\n\nEarn ₹100 cashback on your next home service booking!"
    );
  };

  const handleProfilePress = () => {
    if (user) {
      setActiveTab("account");
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: "NammaPros - Home Services at Your Doorstep",
        message:
          "Book trusted electricians, plumbers, AC repair, water tank cleaning, and appliances with NammaPros! Get ₹100 cashback using my link: https://nammapros.com",
      });
    } catch {}
  };

  // Most booked services from catalog
  const services = catalog?.services || [];
  const mostBooked = useMemo(() => {
    const popular = services.filter((s) => s.is_popular || s.is_featured);
    if (popular.length >= 4) return popular.slice(0, 8);
    return services.slice(0, 8);
  }, [services]);

  const showSearchPanel = searchFocused || localSearch.trim().length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loadingCatalog}
          onRefresh={refreshCatalog}
          tintColor={colors.white}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ========================================================
          1. NAMMAPROS BURGUNDY HERO HEADER WITH PS-MOBILE TOPBAR
          ======================================================== */}
      <View style={styles.brandHeaderContainer}>
        {/* Top Line: Location Dropdown + Wallet + Cart + Profile Buttons */}
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => setIsLocationModalOpen(true)}
            style={styles.headerLocationWrap}
            accessibilityRole="button"
            accessibilityLabel={`Current location: ${activeAddressLine}`}
          >
            <View style={styles.locationTitleRow}>
              <Text style={styles.etaHeading}>In 29 mins</Text>
              <Ionicons name="chevron-down" size={15} color={colors.white} />
            </View>
            <Text style={styles.locationDropdownText} numberOfLines={1}>
              Home - {activeAddressLine}
            </Text>
          </Pressable>

          {/* Right Action Icons: Wallet, Round Cart, Round Profile */}
          <View style={styles.headerRightActions}>
            <Pressable
              onPress={handleWalletPress}
              style={styles.walletPill}
              accessibilityRole="button"
              accessibilityLabel="Wallet Balance"
            >
              <Ionicons name="wallet" size={14} color={colors.primary} />
              <Text style={styles.walletPillText}>₹0</Text>
            </Pressable>

            <Pressable
              onPress={() => setIsCartOpen(true)}
              style={styles.roundHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="Open Cart"
            >
              <Ionicons name="cart-outline" size={18} color={colors.heading} />
              {Boolean(cartItemCount > 0) && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleProfilePress}
              style={styles.roundHeaderBtn}
              accessibilityRole="button"
              accessibilityLabel="User Profile"
            >
              <Ionicons name="person-outline" size={18} color={colors.heading} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar with Rotating Placeholder Hint (matching ps-mobile) */}
        <View style={[styles.searchBarPill, showSearchPanel && styles.searchBarPillActive]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={localSearch}
            onChangeText={setLocalSearch}
            onFocus={() => setSearchFocused(true)}
            placeholder={`Search for ‘${POPULAR_SEARCHES[hintIndex]}’`}
            placeholderTextColor="#78716C"
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (localSearch.trim()) {
                handleQuickSearch(localSearch.trim());
              }
            }}
          />
          {Boolean(localSearch.length > 0) ? (
            <Pressable
              onPress={() => setLocalSearch("")}
              hitSlop={10}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* Dropdown Search Suggestions Panel (matching ps-mobile) */}
        {showSearchPanel && (
          <View style={styles.searchPanelWrap}>
            <View style={styles.panelHeaderRow}>
              <Text style={styles.panelTitle}>Popular Searches</Text>
              <Pressable
                onPress={() => {
                  setSearchFocused(false);
                  setLocalSearch("");
                  Keyboard.dismiss();
                }}
              >
                <Text style={styles.panelCloseText}>Done</Text>
              </Pressable>
            </View>
            <View style={styles.chipsWrap}>
              {POPULAR_SEARCHES.map((query) => (
                <Pressable
                  key={query}
                  onPress={() => handleQuickSearch(query)}
                  style={styles.searchChip}
                >
                  <Ionicons name="trending-up" size={13} color={colors.primary} />
                  <Text style={styles.searchChipText}>{query}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ========================================================
          ACTIVE BOOKING BANNER (If technician on the way)
          ======================================================== */}
      {Boolean(activeTrackingBooking) && (
        <Pressable
          onPress={() => setActiveTab("bookings")}
          style={styles.activeBookingCard}
          accessibilityRole="button"
          accessibilityLabel="Track live booking"
        >
          <View style={styles.activeBookingTop}>
            <View style={styles.activeBookingBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.activeBookingBadgeText}>LIVE TRACKING</Text>
            </View>
            <Text style={styles.activeBookingEta}>Arriving in ~15 mins</Text>
          </View>
          <View style={styles.activeBookingMiddle}>
            <Text style={styles.activeBookingTitle}>
              {activeTrackingBooking?.service_name || activeTrackingBooking?.service}
            </Text>
            <Text style={styles.activeBookingSub}>
              {activeTrackingBooking?.technician?.display_name || "Ramesh K."} • On the way
            </Text>
          </View>
          <View style={styles.activeBookingFooter}>
            <Ionicons name="navigate-circle" size={16} color={colors.primary} />
            <Text style={styles.activeBookingActionText}>View Live Route &amp; Call</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </Pressable>
      )}

      {/* ========================================================
          2. AUTO-SCROLLING PROMO BANNER CAROUSEL (FROM PS-MOBILE)
          ======================================================== */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + spacing.md}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselRow}
          onMomentumScrollEnd={(event) =>
            setActiveSlide(
              Math.round(event.nativeEvent.contentOffset.x / (BANNER_WIDTH + spacing.md))
            )
          }
        >
          {PROMO_CAROUSEL_SLIDES.map((slide) => (
            <Pressable
              key={slide.id}
              onPress={() => handleSelectCategory(slide.categorySlug)}
              style={({ pressed }) => [styles.bannerSlide, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={slide.title}
            >
              <Image
                source={slide.image}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                fadeDuration={0}
              />
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerBadgePill}>
                  <Text style={styles.bannerBadgeText}>{slide.badge}</Text>
                </View>
                <Text style={styles.bannerTitle} numberOfLines={2}>
                  {slide.title}
                </Text>
                <Text style={styles.bannerSub} numberOfLines={1}>
                  {slide.subtitle}
                </Text>
                <View style={styles.bannerCtaPill}>
                  <Text style={styles.bannerCtaText}>{slide.cta}</Text>
                  <Ionicons name="arrow-forward" size={12} color={colors.heading} />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        {/* Carousel Indicator Dots */}
        <View style={styles.carouselDotsRow}>
          {PROMO_CAROUSEL_SLIDES.map((slide, idx) => (
            <View
              key={slide.id}
              style={[
                styles.carouselDot,
                idx === activeSlide && styles.carouselDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ========================================================
          3. 4-COLUMN CATEGORY GRID (DIRECT ICONS WITHOUT BOX)
          ======================================================== */}
      <View style={styles.categoryGridSection}>
        <View style={styles.categoryGrid4Col}>
          {HOME_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => handleSelectCategory(cat.slug)}
              style={({ pressed }) => [
                styles.categoryCard4Col,
                pressed && styles.categoryCard4ColPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={cat.title.replace("\n", " ")}
            >
              <Image
                source={cat.icon}
                style={styles.categoryIconImg}
                resizeMode="contain"
                fadeDuration={0}
              />

              {Boolean(cat.timeBadge) && (
                <View style={styles.timeBadgePill}>
                  <Text style={styles.timeBadgeText}>{cat.timeBadge}</Text>
                </View>
              )}

              <Text style={styles.categoryCardLabel} numberOfLines={2}>
                {cat.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ========================================================
          4. MOST BOOKED SERVICES HORIZONTAL ROW (FROM PS-MOBILE)
          ======================================================== */}
      {mostBooked.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Most Booked Services</Text>
            <Pressable onPress={() => setActiveTab("services")}>
              <Text style={styles.sectionActionText}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productCardScroll}
          >
            {mostBooked.map((service) => {
              const inCart = cartItems.find((i) => i.service.id === service.id);
              const defaultPkg = service.packages?.[0];
              const price = defaultPkg?.price_paise ?? service.starting_price_paise ?? 49900;

              return (
                <Pressable
                  key={service.id}
                  onPress={() => setDetailService(service)}
                  style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={service.name}
                >
                  <View style={styles.productCardImgWrap}>
                    <Image
                      source={getServiceListImage(service)}
                      style={styles.productCardImg}
                      resizeMode="cover"
                      fadeDuration={0}
                    />
                  </View>
                  <Text numberOfLines={2} style={styles.productCardTitle}>
                    {service.name}
                  </Text>
                  <Text style={styles.productCardPrice}>
                    Starts at {formatInr(price)}
                  </Text>
                  {inCart && defaultPkg ? (
                    <View style={styles.productStepper}>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          updateQuantity(service.id, defaultPkg.id, -1);
                        }}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>−</Text>
                      </Pressable>
                      <Text style={styles.stepperCountText}>{inCart.quantity}</Text>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          updateQuantity(service.id, defaultPkg.id, 1);
                        }}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        if (defaultPkg) {
                          addToCart(service, defaultPkg, 1);
                        } else {
                          setDetailService(service);
                        }
                      }}
                      style={styles.productAddBtn}
                    >
                      <Text style={styles.productAddBtnText}>Add</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ========================================================
          5. NATIVE SMART PRODUCTS SECTION (MATCHING IMAGE 1)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>Native Smart Products</Text>
        <View style={styles.smartProductsRow}>
          <Pressable
            onPress={() => handleSelectCategory("appliances")}
            style={styles.smartProductCard}
            accessibilityRole="button"
            accessibilityLabel="Native Water Purifier"
          >
            <View style={styles.smartProductCardBox}>
              <Image
                source={HomeIconAssets["water-purifier"]}
                style={styles.smartProductImg}
                resizeMode="contain"
                fadeDuration={0}
              />
            </View>
            <Text style={styles.smartProductTitle}>Native Water Purifier</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSelectCategory("electrician")}
            style={styles.smartProductCard}
            accessibilityRole="button"
            accessibilityLabel="Native Smart Locks"
          >
            <View style={styles.smartProductCardBox}>
              <Image
                source={HomeIconAssets.cctv}
                style={styles.smartProductImg}
                resizeMode="contain"
                fadeDuration={0}
              />
            </View>
            <Text style={styles.smartProductTitle}>Native Smart Locks</Text>
          </Pressable>
        </View>
      </View>

      {/* ========================================================
          6. REFER & EARN CASHBACK BANNER (FROM PS-MOBILE)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Pressable
          onPress={handleShareApp}
          style={({ pressed }) => [styles.referCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Refer and earn ₹100 cashback"
        >
          <View style={styles.referCopy}>
            <Text style={styles.referTitle}>Refer and earn ₹100 cashback</Text>
            <Text style={styles.referText}>
              Share the NammaPros app with friends &amp; family to earn wallet credits
            </Text>
            <View style={styles.referButton}>
              <Ionicons name="share-social" size={15} color={colors.white} />
              <Text style={styles.referButtonText}>Share App</Text>
            </View>
          </View>
          <View style={styles.referArt}>
            <Ionicons name="gift" size={42} color={colors.primary} />
          </View>
        </Pressable>
      </View>

      {/* ========================================================
          7. IN THE SPOTLIGHT CAROUSEL (MATCHING IMAGE 2)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>In the spotlight</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spotlightScroll}
        >
          {SpotlightAssets.map((spot) => (
            <Pressable
              key={spot.key}
              onPress={() => handleSelectCategory(spot.categorySlug)}
              style={styles.spotlightBannerCard}
              accessibilityRole="button"
              accessibilityLabel={spot.title}
            >
              <Image
                source={spot.image}
                style={styles.spotlightBannerImg}
                resizeMode="cover"
                fadeDuration={0}
              />
              <View style={styles.spotlightOverlay}>
                <Text style={styles.spotlightTag}>{spot.subtitle}</Text>
                <Text style={styles.spotlightTitle}>{spot.title}</Text>
                <View style={styles.spotlightBookBtn}>
                  <Text style={styles.spotlightBookBtnText}>Book now</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ========================================================
          8. NEW AND NOTEWORTHY SECTION (MATCHING IMAGE 2)
          ======================================================== */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionHeading}>New and noteworthy</Text>
        <View style={styles.newNoteworthyGrid}>
          {NEW_AND_NOTEWORTHY.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSelectCategory(item.slug)}
              style={({ pressed }) => [
                styles.noteworthyCard,
                pressed && styles.noteworthyCardPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.noteworthyImageWrap}>
                <Image
                  source={item.image}
                  style={styles.noteworthyImg}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </View>
              <Text style={styles.noteworthyTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.noteworthyBadgeRow}>
                <Text style={styles.noteworthyBadgeText}>⚡ {item.timeBadge}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ========================================================
          9. TRUST BANNER: "You call. We fix it right."
          ======================================================== */}
      <View style={styles.trustBannerWrap}>
        <View style={styles.trustBannerCard}>
          <Text style={styles.trustBannerHead1}>You call.</Text>
          <Text style={styles.trustBannerHead2}>We fix it right.</Text>

          <View style={styles.trustTechnicianImgWrap}>
            <Image
              source={BrandAssets.heroTechnicians}
              style={styles.trustTechnicianImg}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>

          {/* 3 Frosted Glass Pills Row matching Image 3 */}
          <View style={styles.trustPillsContainer}>
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>Trained on{"\n"}real repairs</Text>
            </View>
            <View style={styles.trustGlassPillDivider} />
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>Service with{"\n"}warranty</Text>
            </View>
            <View style={styles.trustGlassPillDivider} />
            <View style={styles.trustGlassPill}>
              <Text style={styles.trustGlassPillText}>ID & police{"\n"}verified</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ========================================================
          10. THE NAMMAPROS PROMISE FOOTER
          ======================================================== */}
      <View style={styles.promiseCard}>
        <View style={styles.promiseHeader}>
          <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
          <Text style={styles.promiseTitle}>The NammaPros Promise</Text>
        </View>
        <Text style={styles.promiseBody}>
          Transparent upfront pricing, background-verified professionals, and our 30-Day Free Rework Guarantee.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F6F3",
  },
  content: {
    paddingBottom: 90,
  },
  pressed: {
    opacity: 0.75,
  },

  // 1. Burgundy Brand Header Container
  brandHeaderContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLocationWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  locationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  etaHeading: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: -0.5,
  },
  locationDropdownText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
    maxWidth: 210,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  walletPillText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: colors.primary,
  },
  roundHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.white,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
  },

  // Search Bar with Rotating Placeholder Hint (matching ps-mobile)
  searchBarPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    height: 48,
    paddingHorizontal: spacing.md,
    gap: 10,
    marginTop: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarPillActive: {
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
  },
  searchInput: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.heading,
    flex: 1,
    paddingVertical: 0,
  },

  // Search Panel Dropdown (matching ps-mobile)
  searchPanelWrap: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  panelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  panelCloseText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  searchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: "#F5F3F1",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.heading,
  },

  // Active Live Tracking Card
  activeBookingCard: {
    backgroundColor: "#FDF4F6",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    gap: 6,
  },
  activeBookingTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeBookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#16A34A",
  },
  activeBookingBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  activeBookingEta: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  activeBookingMiddle: {
    marginTop: 2,
  },
  activeBookingTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  activeBookingSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  activeBookingFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(128,0,32,0.1)",
  },
  activeBookingActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },

  // 2. Auto-scrolling Banner Carousel (from ps-mobile)
  carouselContainer: {
    marginTop: spacing.lg,
    gap: 8,
  },
  carouselRow: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  bannerSlide: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radii.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  bannerBadgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 4,
    marginBottom: 6,
  },
  bannerBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.white,
    lineHeight: 22,
    maxWidth: "80%",
  },
  bannerSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 3,
  },
  bannerCtaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginTop: 10,
  },
  bannerCtaText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: colors.heading,
  },
  carouselDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DCD8D3",
  },
  carouselDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },

  // 3. 4-Column Category Grid matching Image 1
  categoryGridSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  categoryGrid4Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  categoryCard4Col: {
    width: "23.5%",
    backgroundColor: "transparent",
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: "center",
    borderWidth: 0,
  },
  categoryCard4ColPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.95 }],
  },
  categoryIconImg: {
    width: 56,
    height: 56,
    aspectRatio: 1,
  },
  timeBadgePill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
  },
  timeBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
  },
  categoryCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },

  // 4. Most Booked Horizontal Scroll Section (from ps-mobile)
  sectionWrap: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.heading,
    letterSpacing: -0.3,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  productCardScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  productCard: {
    width: PRODUCT_CARD_WIDTH,
    gap: 5,
  },
  productCardImgWrap: {
    width: PRODUCT_CARD_WIDTH,
    height: PRODUCT_CARD_WIDTH * 0.85,
    borderRadius: radius.card,
    backgroundColor: "#F3EFEC",
    overflow: "hidden",
  },
  productCardImg: {
    width: "100%",
    height: "100%",
  },
  productCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.heading,
    lineHeight: 17,
    minHeight: 34,
    marginTop: 2,
  },
  productCardPrice: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.heading,
  },
  productAddBtn: {
    alignSelf: "flex-start",
    minWidth: 78,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.small,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginTop: 2,
  },
  productAddBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },
  productStepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 78,
    height: 32,
    borderRadius: radius.small,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  stepperBtn: {
    width: 22,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.primary,
  },
  stepperCountText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  // 5. Native Smart Products Section matching Image 1
  smartProductsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: spacing.sm,
  },
  smartProductCard: {
    width: 96,
    alignItems: "center",
  },
  smartProductCardBox: {
    width: 88,
    height: 88,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  smartProductImg: {
    width: 66,
    height: 66,
  },
  smartProductTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 15,
  },

  // 6. Refer and Earn Cashback Banner (from ps-mobile)
  referCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "#F5D5DC",
  },
  referCopy: {
    flex: 1,
    gap: 4,
  },
  referTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.heading,
    lineHeight: 22,
  },
  referText: {
    fontSize: 12.5,
    color: colors.body,
    lineHeight: 17,
  },
  referButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.small,
    backgroundColor: colors.primary,
  },
  referButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.white,
  },
  referArt: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 38,
    backgroundColor: colors.white,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // 7. In the Spotlight Carousel matching Image 2
  spotlightScroll: {
    gap: spacing.md,
    paddingVertical: 2,
  },
  spotlightBannerCard: {
    width: 270,
    height: 145,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.surface,
    position: "relative",
  },
  spotlightBannerImg: {
    width: "100%",
    height: "100%",
  },
  spotlightOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.38)",
    padding: spacing.md,
    justifyContent: "flex-end",
  },
  spotlightTag: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.white,
    marginTop: 2,
    lineHeight: 20,
  },
  spotlightBookBtn: {
    backgroundColor: colors.ink,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    marginTop: 8,
  },
  spotlightBookBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },

  // 8. New and Noteworthy Section matching Image 2
  newNoteworthyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  noteworthyCard: {
    width: "23.5%",
    backgroundColor: "transparent",
    padding: 2,
    alignItems: "center",
    borderWidth: 0,
  },
  noteworthyCardPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  noteworthyImageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.canvasWarm,
    marginBottom: 5,
  },
  noteworthyImg: {
    width: "100%",
    height: "100%",
  },
  noteworthyTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 14,
  },
  noteworthyBadgeRow: {
    marginTop: 3,
  },
  noteworthyBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#059669",
  },

  // 9. Trust Banner "You call. We fix it right."
  trustBannerWrap: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  trustBannerCard: {
    backgroundColor: "#1C3B47",
    borderRadius: radii.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    position: "relative",
  },
  trustBannerHead1: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  trustBannerHead2: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.white,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  trustTechnicianImgWrap: {
    width: "100%",
    height: 180,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  trustTechnicianImg: {
    width: "90%",
    height: 180,
  },
  trustPillsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 8,
    width: "100%",
    justifyContent: "space-around",
  },
  trustGlassPill: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  trustGlassPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.white,
    textAlign: "center",
    lineHeight: 15,
  },
  trustGlassPillDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },

  // 10. The NammaPros Promise Footer
  promiseCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: "#F4EFEA",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "#E5DDD6",
    gap: 6,
  },
  promiseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  promiseTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink,
  },
  promiseBody: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
});
