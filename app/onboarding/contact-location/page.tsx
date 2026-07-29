"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useToast } from "@/app/components/context/ToastContext";
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

export default function ContactLocation() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ContactLocationData>(() =>
    getInitialContactData(),
  );

  // Dropdown UI visibility states
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);
  const [isMunCityOpen, setIsMunCityOpen] = useState(false);
  const [isBarangayOpen, setIsBarangayOpen] = useState(false);
  const [isDialCodeOpen, setIsDialCodeOpen] = useState(false);

  // Search queries for dropdowns
  const [regionQuery, setRegionQuery] = useState(formData.regionName || "");
  const [provinceQuery, setProvinceQuery] = useState(
    formData.provinceName || "",
  );
  const [munCityQuery, setMunCityQuery] = useState(formData.munCityName || "");
  const [barangayQuery, setBarangayQuery] = useState(
    formData.barangayName || "",
  );

  // Element Refs for click-outside detection
  const countryRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLDivElement>(null);
  const munCityRef = useRef<HTMLDivElement>(null);
  const barangayRef = useRef<HTMLDivElement>(null);
  const dialCodeRef = useRef<HTMLDivElement>(null);

  // Fetch cascades based on code selections
  const regions = useMemo<RegionItem[]>(() => fetchRegions(), []);

  const provinces = useMemo<ProvinceItem[]>(
    () => fetchProvinces(formData.regionCode),
    [formData.regionCode],
  );

  const muncities = useMemo<MunCityItem[]>(
    () => fetchMunCities(formData.provinceCode),
    [formData.provinceCode],
  );

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.provCode === formData.provinceCode),
    [provinces, formData.provinceCode],
  );

  const isHUC = selectedProvince?.cityClass === "HUC";

  // Effective municipality code handling for HUCs
  const effectiveMunCityCode = isHUC
    ? muncities[0]?.munCityCode
    : formData.munCityCode;

  const barangays = useMemo<BarangayItem[]>(
    () => fetchBarangays(effectiveMunCityCode),
    [effectiveMunCityCode],
  );

  // Filtered dropdown results
  const filteredRegions = useMemo(
    () =>
      regions.filter((r) =>
        r.regionName.toLowerCase().includes(regionQuery.toLowerCase().trim()),
      ),
    [regions, regionQuery],
  );

  const filteredProvinces = useMemo(
    () =>
      provinces.filter((p) =>
        p.provName.toLowerCase().includes(provinceQuery.toLowerCase().trim()),
      ),
    [provinces, provinceQuery],
  );

  const filteredMunCities = useMemo(
    () =>
      muncities.filter((m) =>
        m.munCityName.toLowerCase().includes(munCityQuery.toLowerCase().trim()),
      ),
    [muncities, munCityQuery],
  );

  const filteredBarangays = useMemo(
    () =>
      barangays.filter((b) => {
        const name = b.brgyOldName
          ? `${b.brgyName} (${b.brgyOldName})`
          : b.brgyName;
        return name.toLowerCase().includes(barangayQuery.toLowerCase().trim());
      }),
    [barangays, barangayQuery],
  );

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (countryRef.current && !countryRef.current.contains(target))
        setIsCountryOpen(false);
      if (regionRef.current && !regionRef.current.contains(target))
        setIsRegionOpen(false);
      if (provinceRef.current && !provinceRef.current.contains(target))
        setIsProvinceOpen(false);
      if (munCityRef.current && !munCityRef.current.contains(target))
        setIsMunCityOpen(false);
      if (barangayRef.current && !barangayRef.current.contains(target))
        setIsBarangayOpen(false);
      if (dialCodeRef.current && !dialCodeRef.current.contains(target))
        setIsDialCodeOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.postalCode.trim())
      return showToast("Please enter your Postal Code.", "warning");
    if (!formData.phoneNumber.trim())
      return showToast("Please enter your Phone Number.", "warning");

    saveContactData(formData);
    showToast("Contact information saved!", "success");
    router.push("/onboarding/icon-bio");
  };

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 02 / 03
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
          Contact & Location
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm font-light mt-1">
          Where can we reach you?
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country */}
          <div className="relative text-left" ref={countryRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Country <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-700"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-medium">{formData.country}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            </button>
            {isCountryOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, country: c }));
                      setIsCountryOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-xs font-medium text-[#8b5cf6] bg-violet-50/70"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Region */}
          <div className="relative text-left" ref={regionRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Region <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={regionQuery}
                onFocus={() => setIsRegionOpen(true)}
                onChange={(e) => {
                  setRegionQuery(e.target.value);
                  setIsRegionOpen(true);
                }}
                placeholder="Search Region"
                className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
              />
              <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {isRegionOpen && (
              <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
                {filteredRegions.map((reg) => (
                  <button
                    key={reg.regCode}
                    type="button"
                    onClick={() => {
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
                      setIsRegionOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
                  >
                    {reg.regionName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Province */}
          <div className="relative text-left" ref={provinceRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Province / HUC <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                disabled={!formData.regionCode}
                value={provinceQuery}
                onFocus={() => formData.regionCode && setIsProvinceOpen(true)}
                onChange={(e) => {
                  setProvinceQuery(e.target.value);
                  setIsProvinceOpen(true);
                }}
                placeholder={
                  formData.regionCode
                    ? "Search Province"
                    : "Select Region first"
                }
                className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
              />
              <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {isProvinceOpen && formData.regionCode && (
              <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
                {filteredProvinces.map((prov) => (
                  <button
                    key={prov.provCode}
                    type="button"
                    onClick={() => {
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
                      setIsProvinceOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
                  >
                    {prov.provName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Municipality / City */}
          <div className="relative text-left" ref={munCityRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Municipality / City <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                disabled={
                  !formData.provinceCode || isHUC || muncities.length === 1
                }
                value={
                  isHUC
                    ? muncities[0]?.munCityName || formData.provinceName
                    : munCityQuery
                }
                onFocus={() =>
                  formData.provinceCode && !isHUC && setIsMunCityOpen(true)
                }
                onChange={(e) => {
                  setMunCityQuery(e.target.value);
                  setIsMunCityOpen(true);
                }}
                placeholder={
                  !formData.provinceCode
                    ? "Select Province first"
                    : isHUC
                      ? "City direct jurisdiction (HUC)"
                      : "Search Municipality/City"
                }
                className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
              />
              <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
            </div>

            {isMunCityOpen && formData.provinceCode && !isHUC && (
              <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
                {filteredMunCities.map((mun) => (
                  <button
                    key={mun.munCityCode}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        munCityCode: mun.munCityCode,
                        munCityName: mun.munCityName,
                        barangayCode: "",
                        barangayName: "",
                      }));
                      setMunCityQuery(mun.munCityName);
                      setBarangayQuery("");
                      setIsMunCityOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
                  >
                    {mun.munCityName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Barangay */}
        <div className="relative text-left" ref={barangayRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Barangay <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={
                !formData.provinceCode || (!isHUC && !formData.munCityCode)
              }
              value={barangayQuery}
              onFocus={() =>
                formData.provinceCode &&
                (isHUC || formData.munCityCode) &&
                setIsBarangayOpen(true)
              }
              onChange={(e) => {
                setBarangayQuery(e.target.value);
                setIsBarangayOpen(true);
              }}
              placeholder={
                !formData.provinceCode
                  ? "Select Location first"
                  : "Search Barangay"
              }
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
            />
            <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
          </div>

          {isBarangayOpen && (isHUC || formData.munCityCode) && (
            <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
              {filteredBarangays.map((brgy) => {
                const fullName = brgy.brgyOldName
                  ? `${brgy.brgyName} (${brgy.brgyOldName})`
                  : brgy.brgyName;
                return (
                  <button
                    key={brgy.brgyCode}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        barangayCode: brgy.brgyCode,
                        barangayName: fullName,
                      }));
                      setBarangayQuery(fullName);
                      setIsBarangayOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
                  >
                    {fullName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="4000"
              maxLength={4}
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex w-full items-center rounded-xl border border-zinc-100 bg-zinc-50/50 focus-within:border-[#8b5cf6] focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50/50 overflow-hidden transition-all">
              <div className="relative shrink-0" ref={dialCodeRef}>
                <button
                  type="button"
                  onClick={() => setIsDialCodeOpen(!isDialCodeOpen)}
                  className="flex items-center gap-1.5 border-r border-zinc-200/80 px-2.5 sm:px-3 py-3.5 sm:py-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100/60 transition-all"
                >
                  <span>{formData.phoneDialCode}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                      isDialCodeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDialCodeOpen && (
                  <div className="absolute z-50 mt-2 w-20 rounded-xl border border-zinc-100 bg-white p-1 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
                    {DIAL_CODES.map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            phoneDialCode: code,
                          }));
                          setIsDialCodeOpen(false);
                        }}
                        className="flex w-full items-center justify-center rounded-lg py-2 text-xs font-semibold bg-violet-50/70 text-[#8b5cf6] hover:bg-violet-100 hover:text-[#8b5cf6] transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setFormData((prev) => ({ ...prev, phoneNumber: cleaned }));
                }}
                placeholder="917 123 4567"
                maxLength={10}
                className="w-full bg-transparent px-3.5 py-3.5 sm:py-4 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              saveContactData(formData);
              router.back();
            }}
            className="w-full sm:w-1/3 border border-zinc-100 text-zinc-400 py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-violet-50 hover:text-[#8b5cf6] transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-full sm:w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98]"
          >
            Continue to Bio
          </button>
        </div>
      </form>
    </>
  );
}
