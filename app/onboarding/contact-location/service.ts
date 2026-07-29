import {
  listRegions,
  listProvinces,
  listMuncities,
  listBarangays,
} from "@jobuntux/psgc";
import {
  ONBOARDING_CACHE_KEYS,
  getOnboardingCache,
  setOnboardingCache,
} from "../service";

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
 * Loads initial onboarding contact data safely from LocalStorage.
 */
export function getInitialContactData(): ContactLocationData {
  const cached = getOnboardingCache<Partial<ContactLocationData>>(
    ONBOARDING_CACHE_KEYS.p2,
  );
  if (!cached) return createEmptyData();
  return { ...createEmptyData(), ...cached };
}

/**
 * Persists Contact & Location data to LocalStorage.
 */
export function saveContactData(data: ContactLocationData): void {
  setOnboardingCache(ONBOARDING_CACHE_KEYS.p2, data);
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
