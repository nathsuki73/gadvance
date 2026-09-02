"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useToast } from "@/app/components/context/ToastContext";
import { StepHeader } from "../_components/StepHeader";
import { OnboardingActions } from "../_components/OnboardingActions";
import { SimpleDropdown } from "../_components/SimpleDropdown";
import { SearchableDropdown } from "../_components/SearchableDropdown";
import { PhoneInput } from "../_components/PhoneInput";
import {
  ContactLocationData,
  getInitialContactData,
  saveContactData,
  fetchRegions,
  fetchProvinces,
  fetchMunCities,
  fetchBarangays,
  RegionItem,
  ProvinceItem,
  MunCityItem,
  BarangayItem,
} from "./service";

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

export default function ContactLocation() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ContactLocationData>(() => {
    const initial = getInitialContactData();
    return {
      ...initial,
      phoneNumber: formatPhoneNumber(initial.phoneNumber || ""),
    };
  });

  const [regionQuery, setRegionQuery] = useState(formData.regionName || "");
  const [provinceQuery, setProvinceQuery] = useState(
    formData.provinceName || "",
  );
  const [munCityQuery, setMunCityQuery] = useState(formData.munCityName || "");
  const [barangayQuery, setBarangayQuery] = useState(
    formData.barangayName || "",
  );

  const regions = useMemo<RegionItem[]>(() => fetchRegions(), []);

  const provinces = useMemo<ProvinceItem[]>(
    () => (formData.regionCode ? fetchProvinces(formData.regionCode) : []),
    [formData.regionCode]
  );

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.provCode === formData.provinceCode),
    [provinces, formData.provinceCode]
  );

  const isHUC = selectedProvince?.cityClass === "HUC";

  const muncities = useMemo<MunCityItem[]>(
    () => (formData.provinceCode ? fetchMunCities(formData.provinceCode) : []),
    [formData.provinceCode]
  );

  const effectiveMunCityCode = isHUC
    ? muncities[0]?.munCityCode
    : formData.munCityCode;

  const barangays = useMemo<BarangayItem[]>(
    () => (effectiveMunCityCode ? fetchBarangays(effectiveMunCityCode) : []),
    [effectiveMunCityCode]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "postalCode") {
      const sanitized = value.replace(/\D/g, "").slice(0, 4);
      setFormData((prev) => ({ ...prev, postalCode: sanitized }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: formatPhoneNumber(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // ─── CELLPHONE NUMBER VALIDATION ───
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

    // Pass only the raw 10 digits to prevent duplicate '+63'
    saveContactData({
      ...formData,
      postalCode: trimmedPostal,
      address: formData.address.trim(),
      phoneNumber: rawDigits,
    });

    showToast("Contact information saved!", "success");
    router.push("/onboarding/icon-bio");
  };

  const handleBack = () => {
    const rawDigits = formData.phoneNumber.replace(/\D/g, "");
    saveContactData({
      ...formData,
      phoneNumber: rawDigits,
    });
    router.back();
  };

  return (
    <>
      <StepHeader
        step={2}
        title="Contact & Location"
        subtitle="Where can we reach you?"
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SimpleDropdown
            label="Country"
            required
            value={formData.country}
            options={COUNTRIES}
            onChange={(country) =>
              setFormData((prev) => ({ ...prev, country }))
            }
            icon={Globe}
          />

          <SearchableDropdown
            label="Region"
            required
            placeholder="Search Region"
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
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableDropdown
            label="Province / HUC"
            required
            disabled={!formData.regionCode}
            placeholder="Search Province"
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
          />

          <SearchableDropdown
            label="Municipality / City"
            required
            disabled={!formData.provinceCode || isHUC || muncities.length === 1}
            placeholder="Search Municipality/City"
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
          />
        </div>

        <SearchableDropdown
          label="Barangay"
          required
          disabled={!formData.provinceCode || (!isHUC && !formData.munCityCode)}
          placeholder="Search Barangay"
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
        />

        {/* Address Line */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
            Address Line <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House No., Street Name, Subdivision"
            className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all"
          />
        </div>

        {/* Postal Code & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="4000"
              maxLength={4}
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all"
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
          />
        </div>

        <OnboardingActions onBack={handleBack} nextLabel="Continue to Bio" />
      </form>
    </>
  );
}