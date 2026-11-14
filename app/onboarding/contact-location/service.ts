import { useEffect, useMemo, useState } from "react";
// Imported per file, not from the package root: the root also pulls in the
// barangay list (about 6 MB), which is loaded separately below.
import { listRegions } from "@jobuntux/psgc/dist/core/regions";
import { listProvinces } from "@jobuntux/psgc/dist/core/provinces";
import { listMuncities } from "@jobuntux/psgc/dist/core/muncities";
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

/* ---------- Barangays: loaded in the background ---------- */

type ListBarangays = (munCityCode?: string) => BarangayItem[];

let barangayLoader: Promise<ListBarangays> | null = null;
let loadedListBarangays: ListBarangays | null = null;

/**
 * Downloads the barangay list (about 670 KB compressed) once and caches it.
 * The pages call this as soon as they open, so it is usually ready by the
 * time the learner reaches the Barangay field.
 */
export function loadBarangayData(): Promise<ListBarangays> {
  barangayLoader ??= import("@jobuntux/psgc/dist/core/barangays")
    .then((module) => {
      loadedListBarangays = module.listBarangays as ListBarangays;
      return loadedListBarangays;
    })
    .catch((error) => {
      barangayLoader = null; // let the next call try again
      throw error;
    });
  return barangayLoader;
}

/** Barangays of a municipality or city; empty until the list has loaded. */
export function fetchBarangays(munCityCode?: string): BarangayItem[] {
  if (!munCityCode || !loadedListBarangays) return [];
  return loadedListBarangays(munCityCode) || [];
}

/**
 * Starts loading the barangay list when the component mounts and returns the
 * barangays of `munCityCode` once it is available.
 */
export function useBarangays(munCityCode?: string): {
  barangays: BarangayItem[];
  loading: boolean;
  failed: boolean;
} {
  const [ready, setReady] = useState(() => loadedListBarangays !== null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (ready) return;
    let active = true;
    loadBarangayData()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
        // Retry once after a short pause, e.g. after a dropped connection.
        if (attempt === 0) {
          setTimeout(() => {
            if (active) {
              setFailed(false);
              setAttempt(1);
            }
          }, 3000);
        }
      });
    return () => {
      active = false;
    };
  }, [ready, attempt]);

  const barangays = useMemo(
    () => (ready ? fetchBarangays(munCityCode) : []),
    [ready, munCityCode],
  );

  return { barangays, loading: !ready && !failed, failed };
}
