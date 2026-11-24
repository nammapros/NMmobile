export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  short_description?: string;
  image_url?: string;
  icon_url?: string;
  banner_image?: string | null;
  sort_order?: number;
  is_active?: boolean;
  sub_service_count?: number;
}

export interface Package {
  id: string;
  name: string;
  pricing_model: "FIXED_PRICE" | "INSPECTION_BASED" | string;
  duration_minutes?: number;
  description?: string;
  inclusions?: string[] | string;
  exclusions?: string[] | string;
  price_paise?: number;
  original_price_paise?: number;
  mrp_paise?: number;
  discount_percent?: number;
  price_is_from?: boolean;
  is_most_booked?: boolean;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  short_description?: string;
  description?: string;
  full_description?: string;
  category: string;
  category_id?: string;
  category_name?: string;
  starting_price_paise?: number | null;
  starting_mrp_paise?: number | null;
  starting_discount_percent?: number | null;
  price_note?: string;
  rating_avg?: number | null;
  average_rating?: number | null;
  review_count?: number;
  is_active?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  inclusions?: string | string[];
  exclusions?: string | string[];
  important_notes?: string;
  features?: string | string[];
  faqs?: ServiceFaq[];
  process_steps?: any[];
  spare_parts_rates?: any[];
  brands?: string[];
  main_image?: string | null;
  cover_image?: string | null;
  list_image?: string | null;
  landing_thumbnail?: string | null;
  banner_image?: string | null;
  popup_cover_image?: string | null;
  popup_content_image?: string | null;
  image_url?: string | null;
  images?: string[];
  packages?: Package[];
  sort_order?: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  customer_name?: string;
  area?: string;
  technician_name?: string;
  service_name?: string;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  button_text?: string;
  target_category?: string;
  target_service?: string;
}

export interface CatalogResponse {
  categories: ServiceCategory[];
  services: Service[];
  reviews: Review[];
  banners: Banner[];
  trust_stats: {
    average_rating?: number | null;
    review_count: number;
    completed_bookings_count: number;
  };
}

export interface Address {
  id: string;
  line_1?: string;
  label?: string;
  contact_name: string;
  contact_phone: string;
  house_flat: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}

export interface Slot {
  id: string;
  start_at: string;
  end_at: string;
  remaining?: number;
  version?: number;
}

export interface Hold {
  id: string;
  expires_at: string;
}

export interface QuoteLine {
  code: string;
  name?: string;
  package_id?: string;
  quantity?: number;
  unit_paise?: number;
  amount_paise: number;
}

export interface Quote {
  id: string;
  hold_id: string;
  expires_at: string;
  lines: QuoteLine[];
  total_paise: number;
  advance_paise?: number;
  remaining_balance_paise?: number;
  currency: string;
  payment_policy?: "PREPAID" | "PAY_AT_VISIT" | "ADVANCE";
  discount_paise?: number;
  coupon_code?: string | null;
}

export interface TechnicianInfo {
  name: string;
  display_name?: string;
  phone?: string;
  status: string;
  rating?: number | null;
  completed_jobs?: number;
  photo_url?: string | null;
}

export interface BookingEvent {
  from_status: string;
  to_status: string;
  created_at: string;
}

export interface Booking {
  id: string;
  reference: string;
  status: "REQUESTED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  payment_status: "PENDING" | "PAID" | "FAILED" | "PARTIALLY_PAID" | string;
  service: string;
  package: string;
  service_name?: string;
  package_name?: string;
  package_id?: string;
  address_id?: string;
  address: {
    label?: string;
    line_1?: string;
    locality: string;
    city: string;
    postal_code: string;
  };
  slot: {
    start_at: string;
    end_at: string;
  };
  scheduled_date?: string;
  scheduled_slot?: string;
  scheduled_at?: string;
  price: {
    lines: { code: string; amount_paise: number }[];
    total_paise: number;
    advance_paise?: number;
    remaining_balance_paise?: number;
    currency: string;
  };
  total_amount_paise?: number;
  technician?: TechnicianInfo | null;
  start_otp_code?: string;
  problem_description?: string;
  events?: BookingEvent[];
  can_cancel?: boolean;
  can_reschedule?: boolean;
  version?: number;
  created_at?: string;
}

export interface PublicOffer {
  code: string;
  description: string;
  discount_type: "PERCENT" | "FLAT";
  value: number;
  max_discount_paise: number | null;
  min_order_paise: number;
  valid_until: string | null;
  first_booking_only: boolean;
}

export interface CartItem {
  id: string;
  service: Service;
  pkg: Package;
  quantity: number;
  notes?: string;
}

export interface UserProfile {
  id: number;
  phone_e164: string;
  name?: string;
  email?: string;
  role?: string;
}
