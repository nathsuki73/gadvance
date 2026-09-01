"use client";

import React from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div
        className="fixed inset-0"
        onClick={isPending ? undefined : onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-100 p-6 z-10 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-900">
              Leave Organization?
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to leave{" "}
              <span className="font-semibold text-zinc-800">{orgName}</span>?
              You may lose access to courses and materials linked to this organization.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          {/* 🎯 Explicit Red Action Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Leaving...</span>
              </>
            ) : (
              <span>Leave Organization</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}