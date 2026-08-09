import { create } from "zustand";
import { StoreSettings } from "@/types/store";
import { getStorageItem, setStorageItem } from "@/lib/storage";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "LUXURY STORE",
  tagline: "Fine Watches, Jewelry & Couture",
  gstin: "27AABCU9603R1ZM",
  phone: "+91 98200 88990",
  email: "concierge@luxurystore.com",
  address: "Flagship Galleria, Horizon Tower, Worli Sea Face, Mumbai 400018",
  currencySymbol: "₹",
  defaultTaxRate: 18,
  upiId: "luxurystore@icici",
  logoUrl: "/logo/store-logo.svg",
  activeTemplate: "luxury_gold",
  accentColor: "#d4af37",
  showGstOnBill: true,
  showQrOnBill: true,
  showTermsOnBill: true,
  termsAndConditions: "1. Goods once sold can be exchanged within 7 days in original condition.\n2. Warranty covers manufacturing defects as per brand guidelines.\n3. Thank you for shopping at Luxury Store.",
};

interface SettingsStore {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: getStorageItem<StoreSettings>("luxury_settings", DEFAULT_SETTINGS),
  updateSettings: (newSettings) =>
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      setStorageItem("luxury_settings", updated);
      return { settings: updated };
    }),
  resetSettings: () => {
    setStorageItem("luxury_settings", DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));
