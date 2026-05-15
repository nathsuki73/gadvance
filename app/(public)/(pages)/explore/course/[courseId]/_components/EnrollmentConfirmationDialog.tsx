"use client";

import React from "react";
import ReactDOM from "react-dom";

type EnrollmentConfirmationDialogProps = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const EnrollmentConfirmationDialog = ({
  open,
  loading,
  onClose,
  onConfirm,
}: EnrollmentConfirmationDialogProps) => {
  if (!open || typeof window === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-900/10 backdrop-blur-md p-4 animate-fade-in">
      
      {/* Dialog Container */}
      <div className="w-full max-w-md rounded-[24px] border border-zinc-100 bg-white p-10 shadow-xl shadow-zinc-200/40 transition-all">
        
        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light tracking-tight text-zinc-900 leading-tight lowercase">
            begin your <span className="italic font-serif text-[#00aeef]">learning journey?</span>
          </h2>

          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed lowercase">
            you will be officially enrolled in this professional curriculum and gain access to its structured learning modules.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full rounded-md border border-zinc-200 bg-white px-6 py-4 text-zinc-500 transition-all hover:bg-zinc-50 hover:text-zinc-700 font-medium lowercase disabled:opacity-50"
          >
            cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center rounded-md bg-[#00aeef] px-6 py-4 text-white transition-all hover:bg-[#0098d1] hover:shadow-lg hover:shadow-sky-100 font-medium lowercase disabled:opacity-50"
          >
            {loading ? "enrolling..." : "Enroll"}
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
    document.body
  );
};

export default EnrollmentConfirmationDialog;