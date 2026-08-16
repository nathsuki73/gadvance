"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Download } from "lucide-react";

function DownloadCertificateContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id || !token) {
      setStatus("error");
      setErrorMessage("Missing secure download parameters in the link.");
      return;
    }

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      "http://localhost:8000";

    // Public fetch secured entirely by the Redis token payload in the URL
    fetch(`${apiBaseUrl}/api/certificates/download?id=${id}&token=${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.error || "This download link has expired or is invalid.",
          );
        }
        return res.json();
      })
      .then((data) => {
        setFileUrl(data.azure_file_path);
        setStatus("ready");
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(err.message);
      });
  }, [id, token]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl space-y-6">
        {/* Loading State */}
        {status === "loading" && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#8b5cf6]" />
            <h2 className="text-base font-bold text-zinc-900">
              Verifying Link...
            </h2>
            <p className="text-xs text-zinc-500">
              Please wait while we secure your file.
            </p>
          </div>
        )}

        {/* Ready / Success State with Download Button */}
        {status === "ready" && fileUrl && (
          <div className="space-y-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900">
                Your Certificate is Ready!
              </h2>
              <p className="text-xs text-zinc-500">
                Click the button below to download your file.
              </p>
            </div>

            <a
              href={fileUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#7c3aed]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </a>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="space-y-3">
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
            <h2 className="text-base font-bold text-zinc-900">
              Download Unavailable
            </h2>
            <p className="text-xs text-rose-600 font-medium">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DownloadCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4 font-sans">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl space-y-6">
            <div className="space-y-3">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#8b5cf6]" />
              <h2 className="text-base font-bold text-zinc-900">Loading...</h2>
              <p className="text-xs text-zinc-500">Preparing download page.</p>
            </div>
          </div>
        </div>
      }
    >
      <DownloadCertificateContent />
    </Suspense>
  );
}
