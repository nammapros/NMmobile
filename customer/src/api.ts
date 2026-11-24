import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type {
  Address,
  Booking,
  CatalogResponse,
  Hold,
  PublicOffer,
  Quote,
  Service,
  Slot,
  UserProfile,
} from "./types";

export const CLOUD_RUN_URL_1 = "https://nammapros-api-production-177323361322.asia-southeast1.run.app";
export const CLOUD_RUN_URL_2 = "https://nammapros-api-production-xlexcj72qa-as.a.run.app";

export const DEFAULT_API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ||
  CLOUD_RUN_URL_1;

const API_BASE_STORAGE_KEY = "nmpro.customer.api_base";
const TOKENS_STORAGE_KEY = "nmpro.customer.tokens";
const PROFILE_STORAGE_KEY = "nmpro.customer.profile";
const DEMO_BOOKINGS_KEY = "nmpro.customer.demo_bookings";

export interface Tokens {
  access: string;
  refresh: string;
}

let currentApiBase = DEFAULT_API_BASE;
let currentTokens: Tokens | null = null;
let currentProfile: UserProfile | null = null;

// Helpers for cross-platform secure storage
async function getStoredItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setStoredItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Ignore error
  }
}

async function removeStoredItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Ignore error
  }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function initApiConfig(): Promise<string> {
  const savedBase = await getStoredItem(API_BASE_STORAGE_KEY);
  if (savedBase && (savedBase.startsWith("http://") || savedBase.startsWith("https://"))) {
    currentApiBase = savedBase;
  } else {
    currentApiBase = DEFAULT_API_BASE;
  }

  const rawTokens = await getStoredItem(TOKENS_STORAGE_KEY);
  if (rawTokens) {
    try {
      currentTokens = JSON.parse(rawTokens);
    } catch {
      currentTokens = null;
    }
  }

  const rawProfile = await getStoredItem(PROFILE_STORAGE_KEY);
  if (rawProfile) {
    try {
      currentProfile = JSON.parse(rawProfile);
    } catch {
      currentProfile = null;
    }
  }

  return currentApiBase;
}

export function getApiBaseUrl(): string {
  return currentApiBase;
}

export async function setApiBaseUrl(newUrl: string): Promise<void> {
  currentApiBase = newUrl.replace(/\/+$/, "");
  await setStoredItem(API_BASE_STORAGE_KEY, currentApiBase);
}

export function getCurrentTokens(): Tokens | null {
  return currentTokens;
}

export function getCurrentProfile(): UserProfile | null {
  return currentProfile;
}

export async function saveSession(tokens: Tokens, profile: UserProfile): Promise<void> {
  currentTokens = tokens;
  currentProfile = profile;
  await setStoredItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  await setStoredItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export async function clearSession(): Promise<void> {
  currentTokens = null;
  currentProfile = null;
  await removeStoredItem(TOKENS_STORAGE_KEY);
  await removeStoredItem(PROFILE_STORAGE_KEY);
}

let cachedCsrfToken: string | null = null;
let cachedCsrfCookie: string | null = null;

async function getCsrfToken(): Promise<{ token: string; cookie: string }> {
  if (cachedCsrfToken && cachedCsrfCookie) {
    return { token: cachedCsrfToken, cookie: cachedCsrfCookie };
  }
  try {
    const res = await fetch(`${currentApiBase}/api/v1/auth/csrf/`, {
      headers: { Referer: currentApiBase, "X-NMPRO-Client": "customer-app" },
    });
    const setCookie = res.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/csrftoken=([^;]+)/);
    const cookieVal = cookieMatch ? cookieMatch[1] : "";
    const data = await res.json();
    cachedCsrfToken = data.csrf_token || cookieVal;
    cachedCsrfCookie = cookieVal;
    return { token: cachedCsrfToken || "", cookie: cachedCsrfCookie || "" };
  } catch {
    return { token: "", cookie: "" };
  }
}

async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
  customHeaders?: Record<string, string>
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-NMPRO-Client": "customer-app",
    Referer: currentApiBase,
    ...customHeaders,
  };

  if (method !== "GET") {
    try {
      const { token, cookie } = await getCsrfToken();
      if (token) headers["X-CSRFToken"] = token;
      if (cookie) headers["Cookie"] = `csrftoken=${cookie}`;
    } catch {
      // Ignore CSRF fetch error
    }
  }

  if (body && !(typeof FormData !== "undefined" && body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (currentTokens?.access) {
    headers.Authorization = `Bearer ${currentTokens.access}`;
  }

  try {
    const url = `${currentApiBase}/api/v1${path}`;
    const response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
      body: body
        ? typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    if (response.status === 401 && currentTokens?.refresh) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        clearTimeout(timeoutId);
        return request<T>(path, method, body, customHeaders);
      }
    }

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
      const message =
        errorData?.error?.message ??
        errorData?.detail ??
        (typeof errorData === "string" ? errorData : `Request failed with status ${response.status}`);
      const code = errorData?.error?.code ?? "API_ERROR";
      throw new ApiError(message, response.status, code);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") {
      throw new ApiError("Request timed out. Please check your connection.", 0, "TIMEOUT");
    }
    throw new ApiError(err.message || "Network request failed", 0, "NETWORK_ERROR");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function tryRefreshToken(): Promise<boolean> {
  if (!currentTokens?.refresh) return false;
  try {
    const res = await fetch(`${currentApiBase}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-NMPRO-Client": "customer-app" },
      body: JSON.stringify({ refresh: currentTokens.refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access) {
      currentTokens = {
        access: data.access,
        refresh: data.refresh || currentTokens.refresh,
      };
      await setStoredItem(TOKENS_STORAGE_KEY, JSON.stringify(currentTokens));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Live API Methods
// -------------------------------------------------------------

export const api = {
  // Test backend connectivity & ping
  ping: async (url?: string): Promise<{ success: boolean; latencyMs: number }> => {
    const target = url || currentApiBase;
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${target}/api/v1/catalog/`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;
      return { success: res.ok, latencyMs };
    } catch {
      return { success: false, latencyMs: Date.now() - start };
    }
  },

  // Firebase Authentication OTP Exchange
  firebaseAuth: async (
    idToken: string
  ): Promise<{ id: number; phone_e164: string; role: string; access: string; refresh: string }> => {
    return request("/auth/firebase/", "POST", { id_token: idToken });
  },

  // 1. Fetch live catalog (Categories, Services, Reviews, Banners, Trust Stats)
  catalog: async (): Promise<CatalogResponse> => {
    return request<CatalogResponse>("/catalog/");
  },

  // 2. Fetch specific service detail
  serviceDetail: async (slug: string, pincode?: string): Promise<Service> => {
    const q = pincode ? `?pincode=${encodeURIComponent(pincode)}` : "";
    return request<Service>(`/services/${encodeURIComponent(slug)}/${q}`);
  },

  // 3. Fetch public booking slots
  publicSlots: async (params: {
    package_id?: string;
    service_id?: string;
    postal_code?: string;
    city?: string;
  }): Promise<{ slots: Slot[] }> => {
    const q = new URLSearchParams();
    if (params.package_id) q.set("package_id", params.package_id);
    if (params.service_id) q.set("service_id", params.service_id);
    if (params.postal_code) q.set("postal_code", params.postal_code);
    if (params.city) q.set("city", params.city);
    return request<{ slots: Slot[] }>(`/slots/?${q.toString()}`);
  },

  // 4. Reserve slot hold
  createHold: async (package_id: string, address_id: string, slot_id: string): Promise<Hold> => {
    return request<Hold>("/checkout/holds/", "POST", { package_id, address_id, slot_id });
  },

  // 5. Get calculated quote
  quote: async (
    hold_id: string,
    items?: Array<{ package_id: string; quantity: number }>,
    coupon_code?: string
  ): Promise<Quote> => {
    return request<Quote>("/checkout/quote/", "POST", {
      hold_id,
      ...(items && items.length > 0 ? { items } : {}),
      ...(coupon_code ? { coupon_code } : {}),
    });
  },

  // 6. Confirm Booking
  confirmBooking: async (params: {
    hold_id: string;
    quote_id: string;
    accepted_total_paise: number;
    problem_description?: string;
    key?: string;
  }): Promise<Booking> => {
    const idempotencyKey =
      params.key || `m-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    return request<Booking>(
      "/bookings/",
      "POST",
      {
        hold_id: params.hold_id,
        quote_id: params.quote_id,
        accepted_total_paise: params.accepted_total_paise,
        terms_accepted: true,
        problem_description: params.problem_description || "",
      },
      { "Idempotency-Key": idempotencyKey }
    );
  },

  // 7. Get Customer Bookings
  bookings: async (page = 1): Promise<{ count: number; results: Booking[] }> => {
    try {
      if (currentTokens?.access) {
        return await request<{ count: number; results: Booking[] }>(`/bookings/?page=${page}`);
      }
    } catch (e) {
      // Fallback to local demo bookings if not authenticated or error
    }
    const local = await getLocalDemoBookings();
    return { count: local.length, results: local };
  },

  // 8. Get Single Booking
  booking: async (id: string): Promise<Booking> => {
    try {
      if (currentTokens?.access) {
        return await request<Booking>(`/bookings/${id}/`);
      }
    } catch {
      // Check local
    }
    const local = await getLocalDemoBookings();
    const found = local.find((b) => b.id === id);
    if (found) return found;
    throw new ApiError("Booking not found.", 404, "NOT_FOUND");
  },

  // 9. Cancel booking
  cancelBooking: async (id: string, expected_version = 1): Promise<any> => {
    try {
      if (currentTokens?.access) {
        return await request(`/bookings/${id}/cancel/`, "POST", { expected_version });
      }
    } catch {
      // Local demo fallback
    }
    const local = await getLocalDemoBookings();
    const updated = local.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b));
    await setStoredItem(DEMO_BOOKINGS_KEY, JSON.stringify(updated));
    return { status: "CANCELLED", version: expected_version + 1 };
  },

  // 10. Technician Live GPS Location
  technicianLocation: async (bookingId: string) => {
    return request<{
      sharing: boolean;
      status: string | null;
      latitude?: number;
      longitude?: number;
      destination?: { latitude: number; longitude: number };
    }>(`/bookings/${encodeURIComponent(bookingId)}/technician-location/`);
  },

  // 11. Public Offers / Coupons
  offers: async (): Promise<{ offers: PublicOffer[] }> => {
    try {
      return await request<{ offers: PublicOffer[] }>("/offers/");
    } catch {
      return {
        offers: [
          {
            code: "WELCOME50",
            description: "Get 50% OFF up to ₹250 on your first booking",
            discount_type: "PERCENT",
            value: 50,
            max_discount_paise: 25000,
            min_order_paise: 49900,
            valid_until: null,
            first_booking_only: true,
          },
          {
            code: "ACSUMMER",
            description: "Flat ₹150 OFF on all AC Foam Jet & Chemical Services",
            discount_type: "FLAT",
            value: 15000,
            max_discount_paise: 15000,
            min_order_paise: 99900,
            valid_until: null,
            first_booking_only: false,
          },
        ],
      };
    }
  },

  // 12. Saved Addresses
  addresses: async (): Promise<{ addresses: Address[] }> => {
    try {
      if (currentTokens?.access) {
        return await request<{ addresses: Address[] }>("/customers/addresses/");
      }
    } catch {}
    return {
      addresses: [
        {
          id: "addr-default-1",
          contact_name: currentProfile?.name || "Customer",
          contact_phone: currentProfile?.phone_e164 || "+919876543210",
          house_flat: "Plot 42, Green Valley Apartments",
          street: "1st Main Road",
          locality: "Adyar",
          city: "Chennai",
          state: "Tamil Nadu",
          postal_code: "600020",
          landmark: "Near Gandhi Nagar Park",
          is_default: true,
        },
      ],
    };
  },

  createAddress: async (address: Omit<Address, "id">): Promise<Address> => {
    try {
      if (currentTokens?.access) {
        return await request<Address>("/customers/addresses/", "POST", address);
      }
    } catch {}
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    return newAddr;
  },

  // 13. Submit Review
  submitReview: async (id: string, rating: number, comment: string, tags: string[] = []) => {
    return request(`/bookings/${id}/review/`, "POST", { rating, comment, tags });
  },

  // 14. Demo Booking persistence (so user can test booking end-to-end even when backend auth is locked)
  saveDemoBooking: async (booking: Booking): Promise<void> => {
    const list = await getLocalDemoBookings();
    list.unshift(booking);
    await setStoredItem(DEMO_BOOKINGS_KEY, JSON.stringify(list));
  },
};

export async function getLocalDemoBookings(): Promise<Booking[]> {
  const raw = await getStoredItem(DEMO_BOOKINGS_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return [
    {
      id: "demo-b-1",
      reference: "NP-88349",
      status: "ASSIGNED",
      payment_status: "PAID",
      service: "Split AC Deep Clean",
      package: "Foam Jet Deep Clean",
      address: {
        locality: "Adyar",
        city: "Chennai",
        postal_code: "600020",
        line_1: "Plot 42, Green Valley Apts, 1st Main Rd",
      },
      slot: {
        start_at: new Date(Date.now() + 3600000 * 2).toISOString(),
        end_at: new Date(Date.now() + 3600000 * 4).toISOString(),
      },
      price: {
        lines: [{ code: "SERVICE", amount_paise: 59900 }],
        total_paise: 59900,
        currency: "INR",
      },
      technician: {
        name: "Karthik Subramanian",
        phone: "+919876500123",
        status: "ON_THE_WAY",
        rating: 4.9,
        completed_jobs: 142,
      },
      start_otp_code: "4829",
      can_cancel: true,
      can_reschedule: true,
      created_at: new Date().toISOString(),
    },
  ];
}
