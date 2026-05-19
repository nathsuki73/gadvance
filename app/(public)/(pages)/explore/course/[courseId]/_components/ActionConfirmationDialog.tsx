"use client";

import React from "react";
import ReactDOM from "react-dom";

type ActionConfirmationDialogProps = {
  open: boolean;
  loading?: boolean;

  /**
   * enroll | unenroll
   */
  variant?: "enroll" | "unenroll";

  onClose: () => void;
  onConfirm: () => void;
};

const ActionConfirmationDialog = ({
  open,
  loading,
  variant = "enroll",
  onClose,
  onConfirm,
}: ActionConfirmationDialogProps) => {
  if (!open || typeof window === "undefined") {
    return null;
  }

  const isEnroll = variant === "enroll";

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/10 backdrop-blur-md p-4 animate-fade-in">

      {/* Dialog */}
      <div className="w-full max-w-md rounded-[24px] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-200/40 transition-all">

        {/* Content */}
        <div className="text-center mb-8">

          <h2 className="text-3xl font-light tracking-tight text-zinc-900 leading-tight lowercase">
            {isEnroll ? (
              <>
                begin your{" "}
                <span className="italic font-serif text-[#8b5cf6]">
                  learning journey?
                </span>
              </>
            ) : (
              <>
                leave this{" "}
                <span className="italic font-serif text-[#e05353]">
                  curriculum?
                </span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed lowercase">
            {isEnroll
              ? "you will be officially enrolled in this professional curriculum and gain access to its structured learning modules."
              : "your enrollment progress will be removed from this curriculum and you will lose access to its learning pathway."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-md border border-zinc-200 bg-white px-6 py-4 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 font-medium lowercase disabled:opacity-50"
          >
            cancel
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`
              w-full flex items-center justify-center rounded-md px-6 py-4 text-white transition-all font-medium lowercase disabled:opacity-50
              ${
                isEnroll
                  ? "bg-[#8b5cf6] hover:bg-[#7a4bd1] hover:shadow-lg hover:shadow-purple-100"
                  : "bg-[#e05353] hover:bg-[#cc4646] hover:shadow-lg hover:shadow-red-100"
              }
            `}
          >
            {loading
              ? isEnroll
                ? "enrolling..."
                : "removing..."
              : isEnroll
              ? "enroll"
              : "unenroll"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
            gadvance philippines
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ActionConfirmationDialog;