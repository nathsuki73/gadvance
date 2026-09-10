"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, Globe } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

import { SimpleDropdown } from "@/app/onboarding/_components/SimpleDropdown";
import { SearchableDropdown } from "@/app/onboarding/_components/SearchableDropdown";
import { PhoneInput } from "@/app/onboarding/_components/PhoneInput";
import {
  ContactLocationData,
  fetchRegions,
  fetchProvinces,
  fetchMunCities,
  fetchBarangays,
  RegionItem,
  ProvinceItem,
  MunCityItem,
  BarangayItem,
} from "@/app/onboarding/contact-location/service";

const COUNTRIES = ["Philippines"];
const DIAL_CODES = ["+63"];

const formatPhoneNumber = (value: string): string => {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

interface ContactLocationInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function ContactLocationInfo({
  initialData,
  onSuccess,
}: ContactLocationInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ContactLocationData>({
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
  });

  const [regionQuery, setRegionQuery] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [munCityQuery, setMunCityQuery] = useState("");
  const [barangayQuery, setBarangayQuery] = useState("");

  // 1. Fetch Regions
  const regions = useMemo<RegionItem[]>(() => fetchRegions(), []);

  // 2. Cascading Provinces based on selected Region
  const provinces = useMemo<ProvinceItem[]>(
    () => fetchProvinces(formData.regionCode),
    [formData.regionCode]
  );

  // 3. Cascading Municipalities/Cities based on selected Province
  const muncities = useMemo<MunCityItem[]>(
    () => fetchMunCities(formData.provinceCode),
    [formData.provinceCode]
  );

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.provCode === formData.provinceCode),
    [provinces, formData.provinceCode]
  );

  const isHUC = selectedProvince?.cityClass === "HUC";

  const effectiveMunCityCode = isHUC
    ? muncities[0]?.munCityCode
    : formData.munCityCode;

  // 4. Cascading Barangays based on selected City
  const barangays = useMemo<BarangayItem[]>(
    () => fetchBarangays(effectiveMunCityCode),
    [effectiveMunCityCode]
  );

  // Sync initial backend data into state & dropdown search queries
  useEffect(() => {
    if (initialData && regions.length > 0) {
      const dataObj = initialData as Record<string, unknown>;

      // 1. REGION: Extract from region_name or region_code (DB columns)
      const rawReg =
        (dataObj.region_name as string) ||
        (dataObj.regionName as string) ||
        (dataObj.region as string) ||
        "";
      const rawRegCode =
        (dataObj.region_code as string) ||
        (dataObj.regionCode as string) ||
        "";

      const regObj = regions.find((r) => {
        if (rawRegCode) {
          if (r.regCode === rawRegCode || r.regCode.startsWith(rawRegCode)) return true;
        }
        if (rawReg) {
          const rName = r.regionName.toLowerCase();
          const target = rawReg.toLowerCase();
          return rName === target || rName.includes(target) || target.includes(rName);
        }
        return false;
      });

      const regName = regObj?.regionName || rawReg;
      const regCode = regObj?.regCode || rawRegCode;

      // 2. PROVINCE: Extract from province_name, province_code, or state (DB columns)
      const rawProv =
        (dataObj.province_name as string) ||
        (dataObj.provinceName as string) ||
        (dataObj.province as string) ||
        initialData.state ||
        "";
      const rawProvCode =
        (dataObj.province_code as string) ||
        (dataObj.provinceCode as string) ||
        "";

      const availProvinces = fetchProvinces(regCode);
      const provObj = availProvinces.find((p) => {
        if (rawProvCode) {
          if (p.provCode === rawProvCode || p.provCode.startsWith(rawProvCode)) return true;
        }
        if (rawProv) {
          return p.provName.toLowerCase() === rawProv.toLowerCase();
        }
        return false;
      });

      const provName = provObj?.provName || rawProv;
      const provCode = provObj?.provCode || rawProvCode;

      // 3. CITY / MUNICIPALITY: Extract from mun_city_name or city (DB columns)
      const rawCity =
        (dataObj.mun_city_name as string) ||
        (dataObj.munCityName as string) ||
        initialData.city ||
        "";
      const rawMunCode =
        (dataObj.mun_city_code as string) ||
        (dataObj.munCityCode as string) ||
        "";

      const availMunCities = fetchMunCities(provCode);
      const munObj = availMunCities.find((m) => {
        if (rawMunCode) {
          if (m.munCityCode === rawMunCode || m.munCityCode.startsWith(rawMunCode)) return true;
        }
        if (rawCity) {
          return m.munCityName.toLowerCase() === rawCity.toLowerCase();
        }
        return false;
      });

      const cityName = munObj?.munCityName || rawCity;
      const munCode = munObj?.munCityCode || rawMunCode;

      // 4. BARANGAY: Extract from barangay_name or barangay_code (DB columns)
      const rawBrgy =
        (dataObj.barangay_name as string) ||
        (dataObj.barangayName as string) ||
        (dataObj.barangay as string) ||
        "";
      const rawBrgyCode =
        (dataObj.barangay_code as string) ||
        (dataObj.barangayCode as string) ||
        "";

      const effMunCode =
        provObj?.cityClass === "HUC"
          ? availMunCities[0]?.munCityCode
          : munCode;
      const availBarangays = fetchBarangays(effMunCode);
      const brgyObj = availBarangays.find((b) => {
        if (rawBrgyCode) {
          if (b.brgyCode === rawBrgyCode) return true;
        }
        if (rawBrgy) {
          const bName = b.brgyName.toLowerCase();
          const target = rawBrgy.toLowerCase();
          return (
            bName === target ||
            `${b.brgyName} (${b.brgyOldName})`.toLowerCase() === target
          );
        }
        return false;
      });

      const brgyName = brgyObj
        ? brgyObj.brgyOldName
          ? `${brgyObj.brgyName} (${brgyObj.brgyOldName})`
          : brgyObj.brgyName
        : rawBrgy;
      const brgyCode = brgyObj?.brgyCode || rawBrgyCode;

      // 5. PHONE NUMBER CLEANING
      const rawPhone = initialData.phone || "";
      const cleanedPhone = rawPhone.replace(/^\+63\s?/, "").replace(/\D/g, "");
      const formattedPhone = formatPhoneNumber(cleanedPhone);

      // SET STATE & SEARCH QUERIES
      setFormData({
        country: initialData.country || "Philippines",
        regionCode: regCode,
        regionName: regName,
        provinceCode: provCode,
        provinceName: provName,
        munCityCode: munCode,
        munCityName: cityName,
        barangayCode: brgyCode,
        barangayName: brgyName,
        address: initialData.address_line || "",
        postalCode: (initialData.postal_code || "").replace(/\D/g, "").slice(0, 4),
        phoneDialCode: "+63",
        phoneNumber: formattedPhone,
      });

      setRegionQuery(regName);
      setProvinceQuery(provName);
      setMunCityQuery(cityName);
      setBarangayQuery(brgyName);
    }
  }, [initialData, regions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Strip non-digits in real time for postal code
    if (name === "postalCode") {
      const sanitized = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({ ...prev, postalCode: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Real-time formatting into XXX-XXX-XXXX
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: formatPhoneNumber(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.regionCode)
      return showToast("Please select a Region.", "warning");
    if (!formData.provinceCode)
      return showToast("Please select a Province.", "warning");
    if (!isHUC && !formData.munCityCode)
      return showToast("Please select a Municipality / City.", "warning");
    if (!formData.barangayCode)
      return showToast("Please select a Barangay.", "warning");
    if (!formData.address.trim())
      return showToast("Please enter your Address Line.", "warning");

    // ─── POSTAL CODE VALIDATION ───
    const trimmedPostal = formData.postalCode.trim();
    if (!trimmedPostal) {
      return showToast("Please enter your Postal Code.", "warning");
    }
    if (!/^\d{4}$/.test(trimmedPostal)) {
      return showToast("Postal Code must be exactly 4 numeric digits.", "warning");
    }

    // ─── PHONE NUMBER VALIDATION ───
    const rawDigits = formData.phoneNumber.replace(/\D/g, "");
    if (!rawDigits) {
      return showToast("Please enter your Phone Number.", "warning");
    }
    if (!/^9\d{9}$/.test(rawDigits)) {
      return showToast(
        "Mobile Number must be 10 digits starting with 9 (e.g., 912-345-6789).",
        "warning"
      );
    }

    setIsSaving(true);

    try {
      const payload = {
        country: formData.country,
        region: formData.regionName,
        region_name: formData.regionName,
        region_code: formData.regionCode,
        regionCode: formData.regionCode,
        province: formData.provinceName,
        province_name: formData.provinceName,
        province_code: formData.provinceCode,
        provinceCode: formData.provinceCode,
        state: formData.provinceName,
        city: isHUC ? muncities[0]?.munCityName || formData.provinceName : formData.munCityName,
        mun_city_name: isHUC ? muncities[0]?.munCityName || formData.provinceName : formData.munCityName,
        mun_city_code: isHUC ? muncities[0]?.munCityCode : formData.munCityCode,
        munCityCode: isHUC ? muncities[0]?.munCityCode : formData.munCityCode,
        barangay: formData.barangayName,
        barangay_name: formData.barangayName,
        barangay_code: formData.barangayCode,
        barangayCode: formData.barangayCode,
        address_line: formData.address.trim(),
        postal_code: trimmedPostal,
        // Sends single prefix standard format: "+639XXXXXXXXX"
        phone: `${formData.phoneDialCode}${rawDigits}`,
      };

      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update contact & location details."
        );
      }

      showToast("Contact details updated successfully!", "success");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.email],
      });

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5">
      {/* 1. Country & Region */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SimpleDropdown
          label="Country"
          value={formData.country}
          options={COUNTRIES}
          onChange={(country) =>
            setFormData((prev) => ({ ...prev, country }))
          }
          icon={Globe}
          isProfileUpdate={true}
        />

        <SearchableDropdown
          label="Region"
          placeholder="Select Region"
          query={regionQuery}
          onQueryChange={setRegionQuery}
          items={regions}
          getKey={(r) => r.regCode}
          getLabel={(r) => r.regionName}
          onSelect={(reg) => {
            setFormData((prev) => ({
              ...prev,
              regionCode: reg.regCode,
              regionName: reg.regionName,
              provinceCode: "",
              provinceName: "",
              munCityCode: "",
              munCityName: "",
              barangayCode: "",
              barangayName: "",
            }));
            setRegionQuery(reg.regionName);
            setProvinceQuery("");
            setMunCityQuery("");
            setBarangayQuery("");
          }}
          isProfileUpdate={true}
        />
      </div>

      {/* 2. Province / HUC & Municipality / City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SearchableDropdown
          label="Province / HUC"
          required
          disabled={!formData.regionCode}
          placeholder="Select Province"
          disabledPlaceholder="Select Region first"
          query={provinceQuery}
          onQueryChange={setProvinceQuery}
          items={provinces}
          getKey={(p) => p.provCode}
          getLabel={(p) => p.provName}
          onSelect={(prov) => {
            setFormData((prev) => ({
              ...prev,
              provinceCode: prov.provCode,
              provinceName: prov.provName,
              munCityCode: "",
              munCityName: "",
              barangayCode: "",
              barangayName: "",
            }));
            setProvinceQuery(prov.provName);
            setMunCityQuery("");
            setBarangayQuery("");
          }}
          isProfileUpdate={true}
        />

        <SearchableDropdown
          label="Municipality / City"
          required
          disabled={!formData.provinceCode || isHUC || muncities.length === 1}
          placeholder="Select Municipality/City"
          disabledPlaceholder={
            !formData.provinceCode
              ? "Select Province first"
              : "City direct jurisdiction (HUC)"
          }
          query={munCityQuery}
          onQueryChange={setMunCityQuery}
          items={muncities}
          getKey={(m) => m.munCityCode}
          getLabel={(m) => m.munCityName}
          displayOverride={
            isHUC
              ? muncities[0]?.munCityName || formData.provinceName
              : undefined
          }
          onSelect={(mun) => {
            setFormData((prev) => ({
              ...prev,
              munCityCode: mun.munCityCode,
              munCityName: mun.munCityName,
              barangayCode: "",
              barangayName: "",
            }));
            setMunCityQuery(mun.munCityName);
            setBarangayQuery("");
          }}
          isProfileUpdate={true}
        />
      </div>

      {/* 3. Barangay */}
      <SearchableDropdown
        label="Barangay"
        required
        disabled={!formData.provinceCode || (!isHUC && !formData.munCityCode)}
        placeholder="Select Barangay"
        disabledPlaceholder="Select Location first"
        query={barangayQuery}
        onQueryChange={setBarangayQuery}
        items={barangays}
        getKey={(b) => b.brgyCode}
        getLabel={(b) =>
          b.brgyOldName ? `${b.brgyName} (${b.brgyOldName})` : b.brgyName
        }
        onSelect={(brgy) => {
          const fullName = brgy.brgyOldName
            ? `${brgy.brgyName} (${brgy.brgyOldName})`
            : brgy.brgyName;
          setFormData((prev) => ({
            ...prev,
            barangayCode: brgy.brgyCode,
            barangayName: fullName,
          }));
          setBarangayQuery(fullName);
        }}
        isProfileUpdate={true}
      />

      {/* 4. Address Line */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
          Address Line
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="House No., Street Name, Subdivision"
          className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
        />
      </div>

      {/* 5. Postal Code & Mobile Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Postal Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="4000"
            maxLength={4}
            className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 placeholder-zinc-400 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
          />
        </div>

        <PhoneInput
          dialCode={formData.phoneDialCode}
          dialCodes={DIAL_CODES}
          onDialCodeChange={(code) =>
            setFormData((prev) => ({ ...prev, phoneDialCode: code }))
          }
          phoneNumber={formData.phoneNumber}
          onPhoneNumberChange={handlePhoneChange}
          isProfileUpdate={true}
        />
      </div>

      {/* Save Button */}
      <div className="mt-6 flex items-center justify-end border-t border-zinc-100 pt-5 sm:mt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-70 active:scale-[0.98] cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              SAVE LOCATION DETAILS
            </>
          )}
        </button>
      </div>
    </form>
  );
}