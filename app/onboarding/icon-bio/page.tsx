"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, getSession } from "next-auth/react";
import { finishOnBoarding } from "../../(public)/actions/onboarding"; // Ensure path is correct
import logoIcon from "@/app/assets/logo.ico";

const IconBio = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");

  // Logic from original code to wait for session sync
  const waitForActiveSession = async () => {
    for (let i = 0; i < 8; i += 1) {
      const latest = await getSession();
      if (latest?.user?.status?.trim().toLowerCase() === "active") return true;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return false;
  };

  useEffect(() => {
    const saved = localStorage.getItem("onboarding_p3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAvatarPreview(parsed.avatarBase64 || parsed.avatarPreview || null);
        setAvatarBase64(parsed.avatarBase64 || null);
        setBio(parsed.bio || "");
      } catch (e) { /* ignore */ }
    }
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarBase64(result);
      setAvatarPreview(result);
      const existing = localStorage.getItem("onboarding_p3");
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem("onboarding_p3", JSON.stringify({ ...parsed, avatarBase64: result, avatarPreview: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    router.back();
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. GATHER DATA FROM ALL PAGES
      const p1 = JSON.parse(localStorage.getItem("onboarding_p1") || "{}");
      const p2 = JSON.parse(localStorage.getItem("onboarding_p2") || "{}");
      
      // 2. CONSTRUCT COMPLETE PAYLOAD
      const finalPayload = {
        firstName: String(p1.firstName || ""),
        middleName: String(p1.middleName || ""),
        lastName: String(p1.lastName || ""),
        age: String(p1.age || ""),
        gender: String(p1.gender || ""),
        dob: String(p1.dob || ""),
        phone: String(p2.phone || ""),
        addressLine: String(p2.addressLine || ""),
        city: String(p2.city || ""),
        state: String(p2.state || ""),
        country: String(p2.country || ""),
        postalCode: String(p2.postalCode || ""),
        bio: bio,
        avatar: avatarBase64, // Sending the base64 string to your backend
      };

      // 3. CALL SERVER ACTION (Original Logic)
      const result = await finishOnBoarding(finalPayload);

      if (!result.success) {
        alert(result.error || "Failed to save profile");
        setLoading(false);
        return;
      }

      // 4. UPDATE SESSION (Original Logic)
      const nextStatus = result.user?.status ?? "active";
      const updatedSession = await update({
        ...session,
        user: {
          ...session?.user,
          status: nextStatus,
        },
      });

      // 5. WAIT AND REDIRECT
      if (updatedSession?.user?.status?.toLowerCase() !== "active") {
        await waitForActiveSession();
      }

      // Clear local storage after success
      localStorage.removeItem("onboarding_p1");
      localStorage.removeItem("onboarding_p2");
      localStorage.removeItem("onboarding_p3");

      router.replace("/workspace");
    } catch (error) {
      console.error("Onboarding Finalize Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <img src={logoIcon.src} alt="GADvance" className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="mb-10">
            <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">step 03 / 03</span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">Avatar & Bio</h1>
            <p className="text-zinc-400 text-sm font-light mt-2">Finalize your profile setup.</p>
          </div>

          <form className="space-y-6" onSubmit={handleFinalSubmit}>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-zinc-300 text-[10px] uppercase font-bold tracking-tighter">No photo</span>
                  )}
                </div>
                <div className="flex-grow">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#8b5cf6] hover:file:bg-violet-100 cursor-pointer"
                  />
                  <p className="text-[11px] text-zinc-400 mt-2">JPG or PNG accepted.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Short Bio</label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                placeholder="Tell us a bit about yourself..."
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm h-28 resize-none"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="w-1/3 border border-zinc-100 text-zinc-400 px-6 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? "Saving..." : "Finish Profile Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Decorative Right Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative" style={{ clipPath: 'ellipse(100% 100% at 100% 50%)' }}>
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Ready to <br />
            <span className="font-semibold italic font-serif">get started?</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light lowercase">
            Once you finish, you will have full access to our workspace and learning modules.
          </p>
        </div>
        <div className="absolute bottom-12 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance
        </div>
      </div>
    </div>
  );
};

export default IconBio;