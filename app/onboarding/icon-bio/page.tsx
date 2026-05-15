"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import logoIcon from "@/app/assets/logo.ico";

const IconBio = () => {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("onboarding_p3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // prefer base64 preview if available so preview persists across reloads
        setAvatarPreview(parsed.avatarBase64 || parsed.avatarPreview || null);
        setAvatarBase64(parsed.avatarBase64 || null);
        setBio(parsed.bio || "");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // use data URL for both preview and persistence
      setAvatarBase64(result);
      setAvatarPreview(result);
      // persist immediately
      const existing = localStorage.getItem("onboarding_p3");
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem("onboarding_p3", JSON.stringify({ ...parsed, avatarBase64: result, avatarPreview: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bioValue = String(formData.get("bio") || "");

    const payload = {
      avatarPreview,
      avatarBase64,
      bio: bioValue,
    };

    localStorage.setItem("onboarding_p3", JSON.stringify(payload));

    // Finalize onboarding — navigate to workspace module (adjust as needed)
    router.push("/workspace/module");
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
            <span className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-[0.4em]">step 03 / 03</span>
            <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">Avatar & Bio</h1>
            <p className="text-zinc-400 text-sm font-light mt-2">Add a profile picture and a short bio so others can know you.</p>
          </div>

          <form className="space-y-6" onSubmit={handleNext}>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-zinc-300">No photo</span>
                  )}
                </div>
                <div className="flex-grow">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  <p className="text-[11px] text-zinc-400 mt-2">Max 2MB. JPG, PNG accepted.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">Short Bio</label>
              <textarea
                name="bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  const existing = localStorage.getItem("onboarding_p3");
                  const parsed = existing ? JSON.parse(existing) : {};
                  localStorage.setItem("onboarding_p3", JSON.stringify({ ...parsed, bio: e.target.value }));
                }}
                required
                placeholder="Tell us a bit about yourself (2-3 sentences)"
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-sky-50/50 focus:border-[#00A8CC] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm h-28 resize-none"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-zinc-100 text-zinc-400 px-6 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-sky-100 active:scale-[0.98]"
              >
                Finish Profile Setup
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#00A8CC] flex-col items-center justify-center p-12 text-white relative" style={{ clipPath: 'ellipse(100% 100% at 100% 50%)' }}>
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Let others see <br />
            <span className="font-semibold italic font-serif">who you are.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            A friendly avatar and a good bio helps other learners and mentors connect with you.
          </p>
        </div>

        <div className="absolute bottom-12 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default IconBio;
