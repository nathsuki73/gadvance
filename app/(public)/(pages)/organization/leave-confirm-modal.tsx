"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LeaveConfirmModalProps {
  isOpen: boolean;
  orgName: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LeaveConfirmModal({
  isOpen,
  orgName,
  isPending = false,
  onClose,
  onConfirm,
}: LeaveConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/10 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Dialog Card matching LogoutConfirmationDialog styling */}
      <div className="relative w-full max-w-md rounded-[24px] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-200/40 transition-all z-10">
        {/* Content Layout */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 leading-tight lowercase">
            ready to{" "}
            <span className="italic font-serif text-[#e05353]">
              leave organization?
            </span>
          </h2>

          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed lowercase">
            are you sure you want to leave{" "}
            <span className="font-medium text-zinc-600">{orgName}</span>? you
            may lose access to courses and materials linked to this
            organization.
          </p>
        </div>

        {/* Action Controls: Soft Red & White Pill Layout */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-full rounded-md border border-zinc-200 bg-white px-6 py-4 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 font-medium cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-[#e05353] px-6 py-4 text-white transition-all hover:bg-[#cc4646] hover:shadow-lg hover:shadow-red-50 font-medium cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Leaving...</span>
              </>
            ) : (
              <span>Leave</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
