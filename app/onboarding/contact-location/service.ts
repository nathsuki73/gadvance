import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";

// Types matching official @jobuntux/psgc structure
export interface RegionItem {
  regCode: string;
  regionName: string;
}

export interface ProvinceItem {
  provCode: string;
  provName: string;
  regCode?: string;
  cityClass?: string;
}

export interface MunCityItem {
  munCityCode: string;
  munCityName: string;
  provCode?: string;
  cityClass?: string;
}

export interface BarangayItem {
  brgyCode: string;
  brgyName: string;
  brgyOldName?: string;
  munCityCode?: string;
}

export interface ContactLocationData {
  country: string;
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  munCityCode: string;
  munCityName: string;
  barangayCode: string;
  barangayName: string;
  address: string;
  postalCode: string;
  phoneDialCode: string;
  phoneNumber: string;
}

/**
 * Loads initial onboarding contact data safely from LocalStorage.
 */
export function getInitialContactData(): ContactLocationData {
  if (typeof window === "undefined") {
    return createEmptyData();
  }

  const saved = localStorage.getItem("onboarding_p2");
  if (!saved) return createEmptyData();

  try {
    const parsed = JSON.parse(saved) as Partial<ContactLocationData>;
    return {
      country: parsed.country || "Philippines",
      regionCode: parsed.regionCode || "",
      regionName: parsed.regionName || "",
      provinceCode: parsed.provinceCode || "",
      provinceName: parsed.provinceName || "",
      munCityCode: parsed.munCityCode || "",
      munCityName: parsed.munCityName || "",
      barangayCode: parsed.barangayCode || "",
      barangayName: parsed.barangayName || "",
      address: parsed.address || "",
      postalCode: parsed.postalCode || "",
      phoneDialCode: parsed.phoneDialCode || "+63",
      phoneNumber: parsed.phoneNumber || "",
    };
  } catch (e) {
    console.error("Failed to parse onboarding_p2 cache:", e);
    return createEmptyData();
  }
}

function createEmptyData(): ContactLocationData {
  return {
    country: "Philippines",
    regionCode: "",
    regionName: "",
    provinceCode: "",
    provinceName: "",
    munCityCode: "",
    munCityName: "",
    barangayCode: "",
    barangayName: "",
    address: "",
    postalCode: "",
    phoneDialCode: "+63",
    phoneNumber: "",
  };
}

/**
 * Persists Contact & Location data to LocalStorage.
 */
export function saveContactData(data: ContactLocationData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("onboarding_p2", JSON.stringify(data));
  }
}

// PSGC Helper Fetchers
export function fetchRegions(): RegionItem[] {
  return (listRegions() as RegionItem[]) || [];
}

export function fetchProvinces(regionCode: string): ProvinceItem[] {
  if (!regionCode) return [];
  return (listProvinces(regionCode) as ProvinceItem[]) || [];
}

export function fetchMunCities(provinceCode: string): MunCityItem[] {
  if (!provinceCode) return [];
  return (listMuncities(provinceCode) as MunCityItem[]) || [];
}

export function fetchBarangays(munCityCode: string): BarangayItem[] {
  if (!munCityCode) return [];
  return (listBarangays(munCityCode) as BarangayItem[]) || [];
}
