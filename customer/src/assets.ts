import type { ImageSourcePropType } from "react-native";

export const BrandAssets = {
  wordmark: require("../assets/images/brand/nammapros-wordmark-v2.png"),
  wordmarkDark: require("../assets/images/brand/nammapros-wordmark-dark-v2.png"),
  heroTechnicians: require("../assets/images/brand/hero-technicians-pair.webp"),
  technicianCutout: require("../assets/images/brand/hero-technician-cutout.png"),
  appBanner: require("../assets/images/brand/app-download-banner.webp"),
};

export const HomeIconAssets: Record<string, ImageSourcePropType> = {
  "deep-cleaning": require("../assets/images/home-icons/deep-cleaning.png"),
  handyman: require("../assets/images/home-icons/handyman.png"),
  "appliance-services": require("../assets/images/home-icons/appliance-services.png"),
  "water-tank-cleaning": require("../assets/images/home-icons/water-tank-cleaning.png"),
  "mosquito-net": require("../assets/images/home-icons/mosquito-net.png"),
  "sofa-repair": require("../assets/images/home-icons/sofa-repair.png"),
  "bathroom-cleaning": require("../assets/images/home-icons/bathroom-cleaning.png"),
  "kitchen-cleaning": require("../assets/images/home-icons/kitchen-cleaning.png"),
  "full-house-cleaning": require("../assets/images/home-icons/full-house-cleaning.png"),
  electrician: require("../assets/images/home-icons/electrician.png"),
  plumber: require("../assets/images/home-icons/plumber.png"),
  carpenter: require("../assets/images/home-icons/carpenter.png"),
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
};

export function getServiceImage(service: { slug?: string; category?: string; main_image?: string; cover_image?: string }): ImageSourcePropType {
  const cat = (service.category || "").toLowerCase();
  const slug = (service.slug || "").toLowerCase();

  for (const key of Object.keys(ServiceBannerAssets)) {
    if (slug.includes(key) || cat.includes(key)) {
      return ServiceBannerAssets[key];
    }
  }

  return ServiceBannerAssets.ac;
}
