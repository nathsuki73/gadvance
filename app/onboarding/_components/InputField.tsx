"use client";

import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  type = "text",
  className = "",
  ...props
}) => (
  <div>
    <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      required={required}
      className={`w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm ${className}`}
      {...props}
    />
  </div>
);
