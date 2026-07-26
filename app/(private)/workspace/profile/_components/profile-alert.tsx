"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileAlertProps {
  message: { type: "success" | "error"; text: string } | null;
}

export function ProfileAlert({ message }: ProfileAlertProps) {
  if (!message) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-4 text-xs font-medium transition-all ${
        isSuccess
          ? "border border-emerald-200/60 bg-emerald-50 text-emerald-700"
          : "border border-rose-200/60 bg-rose-50 text-rose-700"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}
