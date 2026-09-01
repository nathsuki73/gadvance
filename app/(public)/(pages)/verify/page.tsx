"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Search,
} from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [inputCode, setInputCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [certData, setCertData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const performVerification = async (verifyCode: string) => {
    if (!verifyCode.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    setCertData(null);

    try {
      // 🔑 Use standard native fetch for public routes to avoid auth redirects
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.14:8000/api";
      const response = await fetch(
        `${apiUrl}/api/certificates/verify?code=${encodeURIComponent(verifyCode)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.valid) {
        setCertData(data.data);
      } else {
        setErrorMsg(data?.message || "Invalid or expired certificate code.");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Failed to connect to verification server or invalid code.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 Auto-verify if code exists in URL query parameter on initial load
  useEffect(() => {
    if (initialCode) {
      performVerification(initialCode);
    }
  }, [initialCode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    performVerification(inputCode);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-xl overflow-hidden p-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-50 rounded-2xl text-[#8b5cf6]">
            <ShieldCheck size={32} />
          </div>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 text-center mb-1">
          Certificate Verification
        </h1>
        <p className="text-xs text-zinc-500 text-center mb-6">
          Official Authenticity Lookup System
        </p>

        {/* Manual Code Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter certificate code (e.g., CERT-XXXXXX)"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full text-xs font-mono font-medium border border-zinc-200 rounded-xl px-4 py-3 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-[#8b5cf6] outline-none transition-all uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] py-3 text-xs font-bold text-white hover:bg-[#7c3aed] transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            <span>Verify Code</span>
          </button>
        </form>

        {/* Results Area */}
        {isLoading && !certData ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 border-t border-zinc-100 pt-6">
            <Loader2 className="animate-spin text-[#8b5cf6]" size={28} />
            <p className="text-xs text-zinc-500 font-medium">
              Verifying certificate details...
            </p>
          </div>
        ) : certData ? (
          <div className="space-y-4 animate-in fade-in duration-300 border-t border-zinc-100 pt-6">
            <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 py-2.5 px-4 rounded-xl text-xs font-bold">
              <CheckCircle2 size={16} />
              <span>Valid & Authentic Certificate</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Recipient Name
                </span>
                <p className="text-sm font-bold text-zinc-800">
                  {certData.recipient_name}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Completed Program
                </span>
                <p className="text-sm font-bold text-zinc-800">
                  {certData.learning_plan}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Verification Code
                  </span>
                  <p className="text-xs font-mono font-bold text-[#8b5cf6]">
                    {certData.verify_code}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Issued Date
                  </span>
                  <p className="text-xs font-semibold text-zinc-700">
                    {certData.issued_at}
                  </p>
                </div>
              </div>
            </div>

            {certData.download_url && (
              <a
                href={certData.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                View Official Certificate PDF
              </a>
            )}
          </div>
        ) : errorMsg ? (
          <div className="space-y-3 animate-in fade-in duration-300 border-t border-zinc-100 pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 py-2.5 px-4 rounded-xl text-xs font-bold">
              <XCircle size={16} />
              <span>Invalid Certificate</span>
            </div>
            <p className="text-xs text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
              {errorMsg}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#8b5cf6]" size={32} />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
