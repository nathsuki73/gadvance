import React from "react";
import { motion } from "framer-motion";

interface PhaseWrapperProps {
  title: React.ReactNode;
  children: React.ReactNode;
  primaryButtonText: string;
  isPrimaryDisabled: boolean;
  onPrimaryClick?: () => void;
  onBackClick?: () => void;
  showBackButton?: boolean;
}

const PhaseWrapper = ({
  title,
  children,
  primaryButtonText,
  isPrimaryDisabled,
  onPrimaryClick,
  onBackClick,
  showBackButton = false,
}: PhaseWrapperProps) => {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-black leading-tight">{title}</h1>

      <div className="space-y-4">{children}</div>

      <div className="flex gap-4 pt-2">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="w-1/3 py-4 border border-zinc-200 rounded-xl font-bold text-zinc-400 hover:bg-zinc-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          disabled={isPrimaryDisabled}
          onClick={onPrimaryClick}
          className={`py-4 rounded-xl font-bold transition-all shadow-lg ${
            showBackButton ? "w-2/3" : "w-full"
          } ${
            primaryButtonText === "Next Phase" ||
            title?.toString().includes("Academic")
              ? "bg-[#FF7A00] shadow-orange-100"
              : "bg-[#00A8CC] shadow-teal-100"
          } text-white disabled:opacity-30`}
        >
          {primaryButtonText}
        </button>
      </div>
    </motion.div>
  );
};

export default PhaseWrapper;
