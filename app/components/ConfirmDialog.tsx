"use client";

import React, { useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-slate-950/40">
        <div className="absolute inset-x-0 top-0 h-1" />

        <div className="p-6 sm:p-7">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#083344] text-white ring-1 ring-inset ring-[#083344]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h12m0 0-4-4m4 4-4 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v-1a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-1"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-[#083344]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#083344]">{description}</p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-700/25 bg-white/5 px-5 py-3 text-sm font-semibold text-[#083344] transition hover:bg-white/10 hover:text-white"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center rounded-2xl bg-[#083344] px-5 py-3 text-sm font-semibold text-white  transition"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
