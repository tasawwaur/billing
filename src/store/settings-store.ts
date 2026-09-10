import { create } from "zustand";
import { StoreSettings } from "@/types/store";
import { getStorageItem, setStorageItem } from "@/lib/storage";

export const PERMANENT_PROFILE: Readonly<Partial<StoreSettings>> = {
  storeName: "RAJDHANI HOME DECOR",
  tagline: "PVC Panels, WPC Louvers, Charcoal Panels & Interior Decor",
  ownerName: "Aalim",
  gstin: "09AYOPA6366P1ZM",
  phone: "9072220785",
  email: "rajdhanihomedecor@gmail.com",
  address: "Choudhary vihar, bala ji dham mandir ke samne, behat road, saharanpur 247001",
  currencySymbol: "₹",
  defaultTaxRate: 9,
  upiId: "",
  showQrOnBill: false,
  logoUrl: "/logo/store-logo.png",
};

const DEFAULT_SETTINGS: StoreSettings = {
  ...PERMANENT_PROFILE,
  storeName: "RAJDHANI HOME DECOR",
  tagline: "PVC Panels, WPC Louvers, Charcoal Panels & Interior Decor",
  ownerName: "Aalim",
  gstin: "09AYOPA6366P1ZM",
  phone: "9072220785",
  email: "rajdhanihomedecor@gmail.com",
  address: "Choudhary vihar, bala ji dham mandir ke samne, behat road, saharanpur 247001",
  currencySymbol: "₹",
  defaultTaxRate: 9,
  upiId: "",
  logoUrl: "/logo/store-logo.png",
  activeTemplate: "thermal80",
  accentColor: "#d4af37",
  showGstOnBill: true,
  showQrOnBill: false,
  showTermsOnBill: true,
  termsAndConditions: "1. Goods once sold will not be taken back without valid bill.\n2. Please check goods at the time of delivery.\n3. Thank you for shopping with Rajdhani Home Decor!",
};

interface SettingsStore {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => {
  const stored = getStorageItem<StoreSettings>("rajdhani_settings", DEFAULT_SETTINGS);
  const activeTemplate = (stored && stored.activeTemplate && stored.activeTemplate !== "luxury_gold")
    ? stored.activeTemplate
    : "thermal80";

  return {
    settings: {
      ...DEFAULT_SETTINGS,
      ...stored,
      activeTemplate,
      ...PERMANENT_PROFILE,
    },
    updateSettings: (newSettings) =>
      set((state) => {
        // Enforce that business profile cannot be modified (permanently locked)
        const updated = { ...state.settings, ...newSettings, ...PERMANENT_PROFILE };
        setStorageItem("rajdhani_settings", updated);
        return { settings: updated };
      }),
    resetSettings: () => {
      setStorageItem("rajdhani_settings", DEFAULT_SETTINGS);
      set({ settings: DEFAULT_SETTINGS });
    },
  };
});
