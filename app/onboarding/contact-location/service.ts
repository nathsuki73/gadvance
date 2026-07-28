import { provinces, municipalities } from "psgc";

// --- TypeScript Interfaces ---

export interface ContactLocationData {
  phoneDialCode: string;
  phoneNumber: string;
  address: string;
  city: string;
  stateProvince: string;
  country: string;
  postalCode: string;
}

export interface PSGCItem {
  code?: string; // Made optional to match psgc's return types
  name: string;
  region?: string;
  province?: string;
  provinceName?: string;
  [key: string]: unknown; // Flexible fallback for other psgc properties
}

// Global cached PSGC static datasets
const ALL_PROVINCES: PSGCItem[] =
  (provinces.all() as unknown as PSGCItem[]) || [];

const ALL_MUNICIPALITIES: PSGCItem[] =
  (municipalities.all() as unknown as PSGCItem[]) || [];

// Pre-computed lowercase map for O(1) province-to-municipality filtering
const MUNICIPALITIES_BY_PROVINCE_MAP = new Map<string, PSGCItem[]>();

ALL_MUNICIPALITIES.forEach((item) => {
  const provName = (item.province || item.provinceName || "").toLowerCase();
  if (provName) {
    if (!MUNICIPALITIES_BY_PROVINCE_MAP.has(provName)) {
      MUNICIPALITIES_BY_PROVINCE_MAP.set(provName, []);
    }
    MUNICIPALITIES_BY_PROVINCE_MAP.get(provName)?.push(item);
  }
});

/**
 * Loads and parses initial onboarding page 2 data safely from LocalStorage.
 */
export function getInitialContactData(): ContactLocationData {
  if (typeof window === "undefined") {
    return {
      phoneDialCode: "+63",
      phoneNumber: "",
      address: "",
      city: "",
      stateProvince: "",
      country: "Philippines",
      postalCode: "",
    };
  }

  const saved = localStorage.getItem("onboarding_p2");
  if (!saved) {
    return {
      phoneDialCode: "+63",
      phoneNumber: "",
      address: "",
      city: "",
      stateProvince: "",
      country: "Philippines",
      postalCode: "",
    };
  }

  try {
    const parsed = JSON.parse(saved) as Partial<ContactLocationData>;
    return {
      phoneDialCode: parsed.phoneDialCode || "+63",
      phoneNumber: parsed.phoneNumber || "",
      address: parsed.address || "",
      city: parsed.city || "",
      stateProvince: parsed.stateProvince || "",
      country: parsed.country || "Philippines",
      postalCode: parsed.postalCode || "",
    };
  } catch (e) {
    console.error("Failed to parse onboarding_p2 cache:", e);
    return {
      phoneDialCode: "+63",
      phoneNumber: "",
      address: "",
      city: "",
      stateProvince: "",
      country: "Philippines",
      postalCode: "",
    };
  }
}

/**
 * Filters provinces based on search query, returning a max limit for ultra-fast rendering.
 */
export function filterProvinces(query: string, limit = 30): PSGCItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_PROVINCES.slice(0, limit);

  return ALL_PROVINCES.filter((prov) =>
    prov.name.toLowerCase().includes(q),
  ).slice(0, limit);
}

/**
 * Filters municipalities for a specific province with instantaneous Map lookups.
 */
export function filterCities(
  provinceName: string,
  query: string,
  limit = 30,
): PSGCItem[] {
  if (!provinceName) return [];

  const key = provinceName.toLowerCase().trim();
  const available =
    MUNICIPALITIES_BY_PROVINCE_MAP.get(key) || ALL_MUNICIPALITIES;
  const q = query.toLowerCase().trim();

  if (!q) return available.slice(0, limit);

  return available
    .filter((city) => city.name.toLowerCase().includes(q))
    .slice(0, limit);
}

/**
 * Persists Contact & Location data to LocalStorage.
 */
export function saveContactData(data: ContactLocationData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("onboarding_p2", JSON.stringify(data));
  }
}
