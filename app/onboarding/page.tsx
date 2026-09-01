"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InputField } from "./_components/InputField";
import { StepHeader } from "./_components/StepHeader";
import { OnboardingActions } from "./_components/OnboardingActions";
import { DatePickerField } from "./_components/DatePickerField";
import { GenderSelect } from "./_components/GenderSelect";
import { useToast } from "@/app/components/context/ToastContext";
import {
  OnboardingP1,
  ONBOARDING_CACHE_KEYS,
  getOnboardingCache,
  setOnboardingCache,
  computeAge,
} from "./service";

export default function OnboardingPageOne() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [persistedData] = useState<OnboardingP1 | null>(() =>
    getOnboardingCache<OnboardingP1>(ONBOARDING_CACHE_KEYS.p1),
  );

  const [birthday, setBirthday] = useState<string>(
    persistedData?.birthday || "",
  );
  const [calculatedAge, setCalculatedAge] = useState<string>(
    persistedData?.age || "",
  );
  const [gender, setGender] = useState<string>(persistedData?.gender || "");

  const handleBirthdayChange = (dateStr: string) => {
    setBirthday(dateStr);
    const age = computeAge(dateStr);
    if (age >= 0) setCalculatedAge(age.toString());
  };

  const rawNameParts = (session?.user?.name || "").trim().split(/\s+/);
  const fallbackFirst = rawNameParts[0] || "";
  const fallbackLast =
    rawNameParts.length > 1 ? rawNameParts.slice(1).join(" ") : "";

  const googleFirst = persistedData?.firstName || fallbackFirst;
  const googleLast = persistedData?.lastName || fallbackLast;

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const enteredAgeStr = (formData.get("age") as string)?.trim();

    if (!firstName || !lastName) {
      showToast("Please enter your first and last name.", "warning");
      return;
    }

    if (!birthday) {
      showToast("Please select your date of birth.", "warning");
      return;
    }

    const birthDateObj = new Date(birthday);
    if (birthDateObj > new Date()) {
      showToast("Date of birth cannot be in the future.", "warning");
      return;
    }

    const ageNumber = computeAge(birthday);

    if (ageNumber < 13) {
      showToast("You must be at least 13 years old to register.", "warning");
      return;
    }

    if (enteredAgeStr && parseInt(enteredAgeStr, 10) !== ageNumber) {
      showToast(
        `Your entered age (${enteredAgeStr}) does not match your calculated birthdate age (${ageNumber}).`,
        "warning",
      );
      return;
    }

    if (!gender.trim()) {
      showToast("Please select your gender.", "warning");
      return;
    }

    const pageOneData: OnboardingP1 = {
      firstName,
      middleName: (formData.get("middleName") as string)?.trim(),
      lastName,
      age: ageNumber.toString(),
      gender: gender.trim(),
      birthday,
    };

    setOnboardingCache(ONBOARDING_CACHE_KEYS.p1, pageOneData);
    router.push("/onboarding/contact-location");
  };

  return (
    <>
      <StepHeader
        step={1}
        title="Personal Identity"
        subtitle="Let's start with your basic information."
      />

      <form className="space-y-5" onSubmit={handleNext}>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            defaultValue={googleFirst}
            required
          />
          <InputField
            label="Last Name"
            name="lastName"
            defaultValue={googleLast}
            required
          />
        </div>

        <InputField
          label="Middle Name"
          name="middleName"
          defaultValue={persistedData?.middleName || ""}
          placeholder="Optional"
        />

        <div className="grid grid-cols-2 gap-4">
          <DatePickerField value={birthday} onChange={handleBirthdayChange} />

          <InputField
            label="Age"
            name="age"
            type="number"
            value={calculatedAge}
            readOnly
            placeholder="Auto-calculated"
            required
          />
        </div>

        <GenderSelect value={gender} onChange={setGender} />

        <OnboardingActions showBack={false} nextLabel="Continue to Location" />
      </form>
    </>
  );
}
