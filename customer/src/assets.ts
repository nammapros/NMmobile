import type { ImageSourcePropType } from "react-native";

export const BrandAssets = {
  wordmark: require("../assets/images/brand/nammapros-wordmark-v2.png"),
  wordmarkDark: require("../assets/images/brand/nammapros-wordmark-dark-v2.png"),
  heroTechnicians: require("../assets/images/brand/hero-technicians-pair.webp"),
  technicianCutout: require("../assets/images/brand/hero-technician-cutout.png"),
  appBanner: require("../assets/images/brand/app-download-banner.webp"),
};

export const HomeIconAssets: Record<string, ImageSourcePropType> = {
  "deep-cleaning": require("../assets/images/service-icons-np/deep_cleaning.png"),
  handyman: require("../assets/images/service-icons-np/electrician_plumber_carpenter.png"),
  "appliance-services": require("../assets/images/service-icons-np/appliances.png"),
  "water-tank-cleaning": require("../assets/images/service-icons-np/tank_cleaning.png"),
  "mosquito-net": require("../assets/images/service-icons-np/mosquito_net.png"),
  "sofa-repair": require("../assets/images/service-icons-np/sofa_cleaning_repair.png"),
  "bathroom-cleaning": require("../assets/images/service-icons-np/bathroom_cleaning.png"),
  "kitchen-cleaning": require("../assets/images/service-icons-np/kitchen_cleaning.png"),
  "full-house-cleaning": require("../assets/images/service-icons-np/full_house_cleaning.png"),
  electrician: require("../assets/images/service-icons-np/electrician.png"),
  plumber: require("../assets/images/service-icons-np/plumber.png"),
  carpenter: require("../assets/images/service-icons-np/carpenter.png"),
  ac: require("../assets/images/home-icons/appliances/ac.png"),
  "washing-machine": require("../assets/images/home-icons/appliances/washing-machine.png"),
  geyser: require("../assets/images/home-icons/appliances/geyser.png"),
  refrigerator: require("../assets/images/home-icons/appliances/refrigerator.png"),
  tv: require("../assets/images/home-icons/appliances/tv.png"),
  "water-purifier": require("../assets/images/home-icons/appliances/water-purifier.png"),
  cctv: require("../assets/images/home-icons/appliances/cctv.png"),
  "microwave-oven": require("../assets/images/home-icons/appliances/microwave-oven.png"),
  dishwasher: require("../assets/images/home-icons/appliances/dishwasher.png"),
};

export const SpotlightAssets = [
  {
    key: "ac",
    title: "AC service",
    subtitle: "Keep your AC cool and efficient",
    image: require("../assets/images/spotlight/ac-service.webp"),
    categorySlug: "ac",
  },
  {
    key: "handyman",
    title: "Handyman",
    subtitle: "Electrician, plumber and carpenter",
    image: require("../assets/images/spotlight/handyman.webp"),
    categorySlug: "electrician",
  },
  {
    key: "bathroom",
    title: "Bathroom cleaning",
    subtitle: "Bring back your bathroom's shine",
    image: require("../assets/images/spotlight/bathroom-cleaning.webp"),
    categorySlug: "cleaning",
  },
  {
    key: "washing-machine",
    title: "Washing machine",
    subtitle: "Quick repair & service at home",
    image: require("../assets/images/spotlight/washing-machine.webp"),
    categorySlug: "washing-machine",
  },
  {
    key: "sofa",
    title: "Sofa cleaning",
    subtitle: "Deep sanitized stain removal",
    image: require("../assets/images/spotlight/sofa-cleaning.webp"),
    categorySlug: "sofa",
  },
  {
    key: "kitchen",
    title: "Kitchen cleaning",
    subtitle: "Deep degreasing & surface sanitize",
    image: require("../assets/images/spotlight/kitchen-cleaning.webp"),
    categorySlug: "cleaning",
  },
];

export const ServiceBannerAssets: Record<string, ImageSourcePropType> = {
  ac: require("../assets/images/banners/ac-service.png"),
  "washing-machine": require("../assets/images/banners/washing-machine.png"),
  refrigerator: require("../assets/images/banners/refrigerator.png"),
  tv: require("../assets/images/banners/tv-repair.png"),
  geyser: require("../assets/images/banners/geyser.png"),
  "water-purifier": require("../assets/images/banners/water-purifier.png"),
  "water-tank-cleaning": require("../assets/images/banners/water-tank-cleaning.png"),
  "mosquito-net": require("../assets/images/banners/mosquito-net.png"),
  sofa: require("../assets/images/banners/sofa-repair.png"),
  cctv: require("../assets/images/banners/cctv.png"),
  microwave: require("../assets/images/banners/microwave.png"),
  dishwasher: require("../assets/images/banners/dishwasher.png"),
  appliances: require("../assets/images/banners/washing-machine.png"),
  cleaning: require("../assets/images/spotlight/bathroom-cleaning.webp"),
  electrician: require("../assets/images/spotlight/handyman.webp"),
  plumber: require("../assets/images/spotlight/handyman.webp"),
  carpenter: require("../assets/images/spotlight/handyman.webp"),
};

export const CategoryCardAssets: Record<string, ImageSourcePropType> = {
  ac: require("../assets/images/banners/ac-service.png"),
  appliances: require("../assets/images/banners/washing-machine.png"),
  cleaning: require("../assets/images/spotlight/bathroom-cleaning.webp"),
  electrician: require("../assets/images/spotlight/handyman.webp"),
  plumber: require("../assets/images/spotlight/handyman.webp"),
  carpenter: require("../assets/images/spotlight/handyman.webp"),
  "water-tank-cleaning": require("../assets/images/banners/water-tank-cleaning.png"),
  sofa: require("../assets/images/banners/sofa-repair.png"),
  "mosquito-net": require("../assets/images/banners/mosquito-net.png"),
};

// ============================================================================
// STATIC SERVICE ASSETS: Pre-bundled local images for instant 0ms rendering
// ============================================================================
export const StaticServiceAssets: Record<string, ImageSourcePropType> = {
  // AC Specific Services
  "ac-foam-jet": require("../assets/images/services/ac-foam-jet.png"),
  "ac-chemical-wash": require("../assets/images/services/ac-chemical-wash.png"),
  "ac-gas-refill": require("../assets/images/services/ac-gas-refill.png"),
  "ac-inspection": require("../assets/images/services/ac-inspection.png"),
  "ac-installation": require("../assets/images/services/ac-installation.png"),
  "ac-uninstallation": require("../assets/images/services/ac-uninstallation.png"),
  "ac-service": require("../assets/images/services/ac-service.png"),
  "foam-jet": require("../assets/images/services/ac-foam-jet.png"),
  "chemical-wash": require("../assets/images/services/ac-chemical-wash.png"),
  "gas-refill": require("../assets/images/services/ac-gas-refill.png"),
  "split-ac": require("../assets/images/services/ac-service.png"),
  "window-ac": require("../assets/images/services/ac-service.png"),
  ac: require("../assets/images/services/ac-service.png"),

  // Appliances
  "washing-machine": require("../assets/images/services/washing-machine.png"),
  refrigerator: require("../assets/images/services/refrigerator.png"),
  fridge: require("../assets/images/services/refrigerator.png"),
  geyser: require("../assets/images/services/geyser.png"),
  "water-purifier": require("../assets/images/services/water-purifier.png"),
  ro: require("../assets/images/services/water-purifier.png"),
  tv: require("../assets/images/services/tv.png"),
  microwave: require("../assets/images/services/microwave.png"),
  dishwasher: require("../assets/images/services/dishwasher.png"),
  chimney: require("../assets/images/services/chimney.png"),
  cctv: require("../assets/images/services/cctv.png"),

  // Cleaning & Home Maintenance
  "water-tank": require("../assets/images/services/water-tank.png"),
  tank: require("../assets/images/services/water-tank.png"),
  "water-tank-cleaning": require("../assets/images/services/water-tank.png"),
  sofa: require("../assets/images/services/sofa-repair.png"),
  "sofa-repair": require("../assets/images/services/sofa-repair.png"),
  mosquito: require("../assets/images/services/mosquito-net.png"),
  "mosquito-net": require("../assets/images/services/mosquito-net.png"),
  bathroom: require("../assets/images/service-icons-np/bathroom_cleaning.png"),
  kitchen: require("../assets/images/service-icons-np/kitchen_cleaning.png"),
  "deep-cleaning": require("../assets/images/service-icons-np/deep_cleaning.png"),
  "full-house": require("../assets/images/service-icons-np/full_house_cleaning.png"),
  cleaning: require("../assets/images/service-icons-np/deep_cleaning.png"),

  // Handyman
  electrician: require("../assets/images/service-icons-np/electrician.png"),
  plumber: require("../assets/images/service-icons-np/plumber.png"),
  carpenter: require("../assets/images/service-icons-np/carpenter.png"),
};

const imageSourceCache = new Map<string, ImageSourcePropType>();

export function getServiceImage(
  service?: {
    id?: string;
    slug?: string;
    category?: string;
    name?: string;
    main_image?: string | null;
    cover_image?: string | null;
    list_image?: string | null;
    landing_thumbnail?: string | null;
    banner_image?: string | null;
    image_url?: string | null;
    popup_cover_image?: string | null;
    popup_content_image?: string | null;
  },
  variant: "list" | "popup" = "list"
): ImageSourcePropType {
  if (!service) return ServiceBannerAssets.ac;

  const rawKey =
    service.id ||
    service.slug ||
    service.popup_cover_image ||
    service.list_image ||
    service.main_image ||
    service.name ||
    "default";
  const cacheKey = `${variant}:${rawKey}`;

  const cached = imageSourceCache.get(cacheKey);
  if (cached) return cached;

  const resolve = (): ImageSourcePropType => {
    // 1. FIRST: Check bundled static assets for 0ms instant loading
    const slug = (service.slug || "").toLowerCase().trim();
    const name = (service.name || "").toLowerCase().trim();
    const cat = (service.category || "").toLowerCase().trim();
    const key = `${slug} ${name} ${cat}`;

    // Exact slug match
    if (slug && StaticServiceAssets[slug]) {
      return StaticServiceAssets[slug];
    }

    // Specific service keywords
    if (key.includes("foam jet") || key.includes("foam-jet")) return StaticServiceAssets["ac-foam-jet"];
    if (key.includes("chemical wash") || key.includes("chemical-wash")) return StaticServiceAssets["ac-chemical-wash"];
    if (key.includes("gas refill") || key.includes("gas-refill")) return StaticServiceAssets["ac-gas-refill"];
    if (key.includes("uninstallation") || key.includes("uninstall")) return StaticServiceAssets["ac-uninstallation"];
    if (key.includes("installation") || key.includes("install") || key.includes("mount")) return StaticServiceAssets["ac-installation"];
    if (key.includes("inspection") || key.includes("diagnos") || key.includes("checkup")) return StaticServiceAssets["ac-inspection"];
    if (key.includes("tank") || key.includes("water tank")) return StaticServiceAssets["water-tank"];
    if (key.includes("sofa")) return StaticServiceAssets["sofa-repair"];
    if (key.includes("mosquito")) return StaticServiceAssets["mosquito-net"];
    if (key.includes("washing machine") || key.includes("washer")) return StaticServiceAssets["washing-machine"];
    if (key.includes("fridge") || key.includes("refrigerator")) return StaticServiceAssets["refrigerator"];
    if (key.includes("geyser") || key.includes("water heater")) return StaticServiceAssets["geyser"];
    if (key.includes("purifier") || key.includes("ro ")) return StaticServiceAssets["water-purifier"];
    if (key.includes("chimney")) return StaticServiceAssets["chimney"];
    if (key.includes("dishwasher")) return StaticServiceAssets["dishwasher"];
    if (key.includes("microwave") || key.includes("oven")) return StaticServiceAssets["microwave"];
    if (key.includes("cctv") || key.includes("camera")) return StaticServiceAssets["cctv"];
    if (key.includes("tv") || key.includes("television")) return StaticServiceAssets["tv"];
    if (key.includes("bathroom")) return StaticServiceAssets["bathroom"];
    if (key.includes("kitchen")) return StaticServiceAssets["kitchen"];
    if (key.includes("full house") || key.includes("home clean")) return StaticServiceAssets["full-house"];
    if (key.includes("clean") || key.includes("pest")) return StaticServiceAssets["cleaning"];
    if (key.includes("electrician") || key.includes("switch") || key.includes("wiring") || key.includes("mcb")) return StaticServiceAssets["electrician"];
    if (key.includes("plumber") || key.includes("tap") || key.includes("pipe") || key.includes("drain")) return StaticServiceAssets["plumber"];
    if (key.includes("carpenter") || key.includes("wood") || key.includes("furniture") || key.includes("drill")) return StaticServiceAssets["carpenter"];
    if (key.includes("ac ") || key.includes("air condition") || slug.startsWith("ac")) return StaticServiceAssets["ac-service"];

    // 2. SECOND: Fall back to backend network URL if custom upload exists
    const candidateUrl =
      variant === "popup"
        ? service.popup_cover_image ||
          service.cover_image ||
          service.main_image ||
          service.banner_image ||
          service.landing_thumbnail ||
          service.list_image ||
          service.popup_content_image ||
          service.image_url
        : service.list_image ||
          service.cover_image ||
          service.main_image ||
          service.landing_thumbnail ||
          service.banner_image ||
          service.popup_cover_image ||
          service.image_url;

    if (candidateUrl && typeof candidateUrl === "string" && candidateUrl.trim().length > 0) {
      const trimmed = candidateUrl.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return { uri: trimmed };
      }
      if (trimmed.startsWith("/")) {
        const filename = trimmed.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
        if (filename && ServiceBannerAssets[filename]) {
          return ServiceBannerAssets[filename];
        }
        return { uri: `https://nammapros.com${trimmed}` };
      }
    }

    return ServiceBannerAssets.ac;
  };

  const result = resolve();
  imageSourceCache.set(cacheKey, result);
  return result;
}

export function getServiceListImage(service?: any): ImageSourcePropType {
  return getServiceImage(service, "list");
}

export function getServicePopupImage(service?: any): ImageSourcePropType {
  return getServiceImage(service, "popup");
}
