"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import {
  ContactLocationData,
  PSGCItem,
  getInitialContactData,
  filterProvinces,
  filterCities,
  saveContactData,
} from "./service";

const COUNTRIES = ["Philippines"];
const DIAL_CODES = ["+63"];

export default function ContactLocation() {
  const router = useRouter();

  const [formData, setFormData] = useState<ContactLocationData>(() =>
    getInitialContactData(),
  );

  const [isCountryOpen, setIsCountryOpen] = useState<boolean>(false);
  const [isProvinceOpen, setIsProvinceOpen] = useState<boolean>(false);
  const [isCityOpen, setIsCityOpen] = useState<boolean>(false);
  const [isDialCodeOpen, setIsDialCodeOpen] = useState<boolean>(false);

  const [provinceQuery, setProvinceQuery] = useState<string>(
    formData.stateProvince || "",
  );
  const [cityQuery, setCityQuery] = useState<string>(formData.city || "");

  const countryRef = useRef<HTMLDivElement>(null);
  const provinceRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const dialCodeRef = useRef<HTMLDivElement>(null);

  const displayedProvinces = useMemo<PSGCItem[]>(
    () => filterProvinces(provinceQuery),
    [provinceQuery],
  );

  const displayedCities = useMemo<PSGCItem[]>(
    () => filterCities(formData.stateProvince, cityQuery),
    [formData.stateProvince, cityQuery],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (countryRef.current && !countryRef.current.contains(target)) {
        setIsCountryOpen(false);
      }
      if (provinceRef.current && !provinceRef.current.contains(target)) {
        setIsProvinceOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(target)) {
        setIsCityOpen(false);
      }
      if (dialCodeRef.current && !dialCodeRef.current.contains(target)) {
        setIsDialCodeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.stateProvince) {
      alert("Please select a valid State / Province.");
      return;
    }
    if (!formData.city) {
      alert("Please select a valid City.");
      return;
    }
    if (!formData.address.trim()) {
      alert("Please enter your Address Line.");
      return;
    }
    if (!formData.postalCode.trim()) {
      alert("Please enter your Postal Code.");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      alert("Please enter your Phone Number.");
      return;
    }

    saveContactData(formData);
    router.push("/onboarding/icon-bio");
  };

  const handleBack = () => {
    saveContactData(formData);
    router.back();
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

      <form className="space-y-4" onSubmit={handleNext}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country Dropdown */}
          <div className="relative text-left" ref={countryRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Country <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              className={`flex w-full items-center justify-between rounded-xl border p-3.5 sm:p-4 text-sm transition-all text-left ${
                isCountryOpen
                  ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                  : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <span className="font-medium text-zinc-700">
                  {formData.country}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                  isCountryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCountryOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
                {COUNTRIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, country: c });
                      setIsCountryOpen(false);
                    }}
                    className="flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left bg-violet-50/70 text-[#8b5cf6]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* State / Province */}
          <div className="relative text-left" ref={provinceRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              State / Province <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={provinceQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = e.target.value;
                  setProvinceQuery(val);
                  setIsProvinceOpen(true);
                  if (!val) {
                    setFormData({
                      ...formData,
                      stateProvince: "",
                      city: "",
                    });
                    setCityQuery("");
                  }
                }}
                onFocus={() => setIsProvinceOpen(true)}
                placeholder="Search or select Province"
                className={`w-full rounded-xl border p-3.5 sm:p-4 pr-10 text-sm transition-all ${
                  isProvinceOpen
                    ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                    : "border-zinc-100 bg-zinc-50/50 text-zinc-800 placeholder-zinc-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setIsProvinceOpen(!isProvinceOpen)}
                className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isProvinceOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {isProvinceOpen && (
              <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
                {displayedProvinces.length > 0 ? (
                  displayedProvinces.map((prov) => (
                    <button
                      key={prov.code || prov.name}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          stateProvince: prov.name,
                          city: "",
                        });
                        setProvinceQuery(prov.name);
                        setCityQuery("");
                        setIsProvinceOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                        formData.stateProvince === prov.name
                          ? "bg-violet-50/70 text-[#8b5cf6]"
                          : "text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {prov.name}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2.5 text-xs text-zinc-400 text-center">
                    No provinces found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* City / Municipality */}
        <div className="relative text-left" ref={cityRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            City / Municipality <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              disabled={!formData.stateProvince}
              value={cityQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCityQuery(e.target.value);
                setIsCityOpen(true);
              }}
              onFocus={() => formData.stateProvince && setIsCityOpen(true)}
              placeholder={
                formData.stateProvince
                  ? "Search or select City"
                  : "Select a Province first"
              }
              className={`w-full rounded-xl border p-3.5 sm:p-4 pr-10 text-sm transition-all ${
                !formData.stateProvince
                  ? "border-zinc-100 bg-zinc-100/50 text-zinc-300 cursor-not-allowed"
                  : isCityOpen
                    ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                    : "border-zinc-100 bg-zinc-50/50 text-zinc-800 placeholder-zinc-300"
              }`}
            />
            <button
              type="button"
              disabled={!formData.stateProvince}
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center text-zinc-400 hover:text-zinc-600 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isCityOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {isCityOpen && formData.stateProvince && (
            <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
              {displayedCities.length > 0 ? (
                displayedCities.map((c) => (
                  <button
                    key={c.code || c.name}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, city: c.name });
                      setCityQuery(c.name);
                      setIsCityOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                      formData.city === c.name
                        ? "bg-violet-50/70 text-[#8b5cf6]"
                        : "text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2.5 text-xs text-zinc-400 text-center">
                  No cities found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Address Line */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Address Line <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="House No., Street, Subdivision"
            className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all"
          />
        </div>

        {/* Postal Code & Phone Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g. 4000"
              className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-800 placeholder-zinc-300 focus:border-[#8b5cf6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-50/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Phone Number <span className="text-red-500">*</span>
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
                          setFormData({ ...formData, phoneDialCode: code });
                          setIsDialCodeOpen(false);
                        }}
                        className="flex w-full items-center justify-center rounded-lg py-2 text-xs font-semibold bg-violet-50/70 text-[#8b5cf6]"
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, phoneNumber: cleaned });
                }}
                placeholder="9xx xxx xxxx"
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
            onClick={handleBack}
            className="w-full sm:w-1/3 border border-zinc-100 text-zinc-400 py-3.5 sm:py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
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
