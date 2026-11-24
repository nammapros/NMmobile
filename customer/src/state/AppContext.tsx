import React, { createContext, useContext, useEffect, useState } from "react";
import {
  api,
  clearSession,
  getApiBaseUrl,
  getCurrentProfile,
  getCurrentTokens,
  initApiConfig,
  saveSession,
  setApiBaseUrl,
  type Tokens,
} from "../api";
import type { Address, Booking, CartItem, CatalogResponse, Package, PublicOffer, Service, UserProfile } from "../types";

export type TabName = "home" | "services" | "bookings" | "account";

interface AppContextType {
  // Navigation
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;

  // Catalog
  catalog: CatalogResponse | null;
  loadingCatalog: boolean;
  catalogError: string | null;
  refreshCatalog: () => Promise<void>;

  // Location
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedPincode: string;
  setSelectedPincode: (pin: string) => void;

  // Cart
  cartItems: CartItem[];
  addToCart: (service: Service, pkg: Package, quantity?: number) => void;
  updateQuantity: (serviceId: string, pkgId: string, delta: number) => void;
  removeFromCart: (serviceId: string, pkgId: string) => void;
  clearCart: () => void;
  cartTotalPaise: number;
  cartItemCount: number;

  // Selected Service for modal view
  detailService: Service | null;
  setDetailService: (service: Service | null) => void;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isIntroOpen: boolean;
  setIsIntroOpen: (open: boolean) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isRatingModalOpen: boolean;
  setIsRatingModalOpen: (open: boolean) => void;
  ratingBooking: Booking | null;
  setRatingBooking: (b: Booking | null) => void;
  activeTrackingBooking: Booking | null;
  setActiveTrackingBooking: (b: Booking | null) => void;

  // Addresses
  savedAddresses: Address[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  addSavedAddress: (addr: Address) => void;

  // User Auth
  user: UserProfile | null;
  tokens: Tokens | null;
  signIn: (tokens: Tokens, profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;

  // Backend URL management
  currentApiUrl: string;
  changeApiUrl: (url: string) => Promise<void>;

  // Filter / Search
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [selectedPincode, setSelectedPincode] = useState("600020");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [detailService, setDetailService] = useState<Service | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [activeTrackingBooking, setActiveTrackingBooking] = useState<Booking | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    {
      id: "addr-home",
      label: "Home",
      contact_name: "Deepan D.",
      contact_phone: "+91 98765 43210",
      house_flat: "No. 12",
      street: "3rd Street",
      locality: "Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      postal_code: "600040",
      line_1: "No. 12, 3rd Street, Anna Nagar, Chennai - 600040",
      is_default: true,
    },
    {
      id: "addr-office",
      label: "Office",
      contact_name: "Deepan D.",
      contact_phone: "+91 98765 43210",
      house_flat: "A-203",
      street: "IT Park Road",
      locality: "Guindy",
      city: "Chennai",
      state: "Tamil Nadu",
      postal_code: "600032",
      line_1: "A-203, IT Park Road, Guindy, Chennai - 600032",
      is_default: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState("addr-home");

  const addSavedAddress = (addr: Address) => {
    setSavedAddresses((prev) => [addr, ...prev]);
    setSelectedAddressId(addr.id);
  };

  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [currentApiUrl, setCurrentApiUrl] = useState(getApiBaseUrl());

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshCatalog = async () => {
    if (!catalog) setLoadingCatalog(true);
    setCatalogError(null);
    try {
      const data = await api.catalog();
      setCatalog(data);
    } catch (err: any) {
      if (!catalog) {
        setCatalogError(err.message || "Failed to load services. Please check your network.");
      }
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    initApiConfig().then((url) => {
      if (!mounted) return;
      setCurrentApiUrl(url);
      setUser(getCurrentProfile());
      setTokens(getCurrentTokens());
      refreshCatalog();
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addToCart = (service: Service, pkg: Package, quantity = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.service.id === service.id && item.pkg.id === pkg.id
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [...prev, { id: `${service.id}-${pkg.id}`, service, pkg, quantity }];
    });
  };

  const updateQuantity = (serviceId: string, pkgId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.service.id === serviceId && item.pkg.id === pkgId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (serviceId: string, pkgId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.service.id === serviceId && item.pkg.id === pkgId))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotalPaise = cartItems.reduce((acc, item) => {
    const unitPaise =
      item.pkg.price_paise ?? item.service.starting_price_paise ?? 49900;
    return acc + unitPaise * item.quantity;
  }, 0);

  const signIn = async (newTokens: Tokens, profile: UserProfile) => {
    await saveSession(newTokens, profile);
    setUser(profile);
    setTokens(newTokens);
    setIsAuthOpen(false);
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
    setTokens(null);
  };

  const changeApiUrl = async (newUrl: string) => {
    await setApiBaseUrl(newUrl);
    setCurrentApiUrl(newUrl);
    await refreshCatalog();
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        catalog,
        loadingCatalog,
        catalogError,
        refreshCatalog,
        selectedCity,
        setSelectedCity,
        selectedPincode,
        setSelectedPincode,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotalPaise,
        cartItemCount,
        detailService,
        setDetailService,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isIntroOpen,
        setIsIntroOpen,
        isHelpModalOpen,
        setIsHelpModalOpen,
        isRatingModalOpen,
        setIsRatingModalOpen,
        ratingBooking,
        setRatingBooking,
        activeTrackingBooking,
        setActiveTrackingBooking,
        savedAddresses,
        selectedAddressId,
        setSelectedAddressId,
        addSavedAddress,
        user,
        tokens,
        signIn,
        signOut,
        currentApiUrl,
        changeApiUrl,
        selectedCategorySlug,
        setSelectedCategorySlug,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
