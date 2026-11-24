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
  "water-tank-cleaning": require("../assets/images/service-icons-np/tank_cleaning.png"),
  "mosquito-net": require("../assets/images/service-icons-np/mosquito_net.png"),
  sofa: require("../assets/images/service-icons-np/sofa_cleaning_repair.png"),
  cctv: require("../assets/images/banners/cctv.png"),
  microwave: require("../assets/images/banners/microwave.png"),
  dishwasher: require("../assets/images/banners/dishwasher.png"),
  appliances: require("../assets/images/service-icons-np/appliances.png"),
  cleaning: require("../assets/images/service-icons-np/deep_cleaning.png"),
  electrician: require("../assets/images/service-icons-np/electrician.png"),
  plumber: require("../assets/images/service-icons-np/plumber.png"),
  carpenter: require("../assets/images/service-icons-np/carpenter.png"),
};

export const CategoryCardAssets: Record<string, ImageSourcePropType> = {
  ac: require("../assets/images/banners/ac-service.png"),
  appliances: require("../assets/images/service-icons-np/appliances.png"),
  cleaning: require("../assets/images/service-icons-np/deep_cleaning.png"),
  electrician: require("../assets/images/service-icons-np/electrician.png"),
  plumber: require("../assets/images/service-icons-np/plumber.png"),
  carpenter: require("../assets/images/service-icons-np/carpenter.png"),
  "water-tank-cleaning": require("../assets/images/service-icons-np/tank_cleaning.png"),
  sofa: require("../assets/images/service-icons-np/sofa_cleaning_repair.png"),
  "mosquito-net": require("../assets/images/service-icons-np/mosquito_net.png"),
};

export function getServiceImage(service?: {
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
}): ImageSourcePropType {
  if (!service) return ServiceBannerAssets.ac;

  // 1. Live image URL from backend (Cloudinary / HTTPS / Direct)
  const candidateUrl =
    service.list_image ||
    service.main_image ||
    service.cover_image ||
    service.landing_thumbnail ||
    service.banner_image ||
    service.popup_cover_image ||
    service.popup_content_image ||
    service.image_url;

  if (candidateUrl && typeof candidateUrl === "string" && candidateUrl.trim().length > 0) {
    const trimmed = candidateUrl.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return { uri: trimmed };
    }
    if (trimmed.startsWith("/")) {
      // Check if it matches a local banner asset filename
      const filename = trimmed.split("/").pop()?.replace(/\.[^/.]+$/, "") || "";
      if (filename && ServiceBannerAssets[filename]) {
        return ServiceBannerAssets[filename];
      }
      return { uri: `https://nammapros.com${trimmed}` };
    }
  }

  // 2. Curated fallback based on slug, category, name keywords
  const cat = (service.category || "").toLowerCase();
  const slug = (service.slug || "").toLowerCase();
  const name = (service.name || "").toLowerCase();
  const combined = `${slug} ${cat} ${name}`;

  if (combined.includes("tank") || combined.includes("water tank")) {
    return ServiceBannerAssets["water-tank-cleaning"];
  }
  if (combined.includes("mosquito")) {
    return ServiceBannerAssets["mosquito-net"];
  }
  if (combined.includes("sofa")) {
    return ServiceBannerAssets.sofa;
  }
  if (combined.includes("electrician") || combined.includes("wiring") || combined.includes("fuse")) {
    return ServiceBannerAssets.electrician;
  }
  if (combined.includes("plumber") || combined.includes("pipe") || combined.includes("leak")) {
    return ServiceBannerAssets.plumber;
  }
  if (combined.includes("carpenter") || combined.includes("furniture") || combined.includes("wood")) {
    return ServiceBannerAssets.carpenter;
  }
  if (combined.includes("bathroom")) {
    return HomeIconAssets["bathroom-cleaning"];
  }
  if (combined.includes("kitchen")) {
    return HomeIconAssets["kitchen-cleaning"];
  }
  if (combined.includes("full house") || combined.includes("home cleaning")) {
    return HomeIconAssets["full-house-cleaning"];
  }
  if (combined.includes("clean")) {
    return ServiceBannerAssets.cleaning;
  }
  if (combined.includes("appliance")) {
    return ServiceBannerAssets.appliances;
  }

  for (const key of Object.keys(ServiceBannerAssets)) {
    if (combined.includes(key)) {
      return ServiceBannerAssets[key];
    }
  }

  return ServiceBannerAssets.ac;
}
