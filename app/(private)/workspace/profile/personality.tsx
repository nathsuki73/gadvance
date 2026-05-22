"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, User, Upload } from "lucide-react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export default function PersonalityInfo() {
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 1. Fetch current profile image path and bio text
  useEffect(() => {
    const fetchPersonalityData = async () => {
      if (status !== "authenticated" || !apiBaseUrl || !session?.laravelJwt) return;

      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${session.laravelJwt}`,
          },
        });

        if (response.ok) {
          const dbData = await response.json();
          setBio(dbData.bio || "");
          
          if (dbData.avatar) {
            // Check if stored URL is absolute or relative path from Laravel storage
            const fullAvatarUrl = dbData.avatar.startsWith("http") 
              ? dbData.avatar 
              : `${apiBaseUrl}/storage/${dbData.avatar}`;
            setAvatarPreview(fullAvatarUrl);
          }
        }
      } catch (error) {
        console.error("Error hydrating personality values:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalityData();
  }, [status, session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Display preview image locally
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // 🎯 CRITICAL: Use FormData instead of JSON to support file upload streams
      const dataPayload = new FormData();
      dataPayload.append("bio", bio);
      
      if (avatarFile) {
        dataPayload.append("avatar", avatarFile);
      }

      // Note: We use POST instead of PUT because native PHP/Laravel doesn't parse 
      // multipart/form-data payloads cleanly on PUT requests natively without workarounds.
      const response = await fetch(`${apiBaseUrl}/api/user/profile/personality-update`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session?.laravelJwt}`,
          // ⚠️ DO NOT set Content-Type header here manually. Browser fills it with boundary bounds.
        },
        body: dataPayload,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorText = result.message || "Failed to update personality configurations.";
        throw new Error(errorText);
      }

      setMessage({ type: "success", text: "Personality details updated successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Something went wrong." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="text-sm text-zinc-400">Loading profile traits...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      {message && (
        <div className={`rounded-xl p-4 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Avatar Presentation & Picker */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden group">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-zinc-300" />
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-semibold text-zinc-800">Profile Picture</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Image File
          </button>
          <p className="text-[11px] text-zinc-400">Supports JPG, PNG, or WebP formats.</p>
        </div>
      </div>

      {/* Biography Input Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-600">Biography / Short Summary</label>
        <textarea
          name="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us a bit about your journey, interests, or specialized fields..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
        />
      </div>

      <div className="flex items-center justify-end border-t border-zinc-100 pt-5">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00a9d1]/20 hover:bg-primary-hover transition-all disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Personality...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}