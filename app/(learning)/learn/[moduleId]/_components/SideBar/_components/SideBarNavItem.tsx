"use client";

import React from "react";
import {
  FileText,
  ClipboardCheck,
  GraduationCap,
  PlayCircle,
  Lock,
  CheckCircle2,
} from "lucide-react";

type SideBarNavItemProps = {
  index: number;
  label: string;
  itemType?: string;
  assessmentType?: string | null;
  active: boolean;
  locked?: boolean;
  completed?: boolean;
  collapsed: boolean;
  onClick: () => void;
};

const getItemIcon = (
  itemType?: string,
  assessmentType?: string | null,
  active?: boolean,
  completed?: boolean,
) => {
  if (completed) {
    return <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />;
  }

  const colorClass = active ? "text-purple-600" : "text-zinc-400";

  if (itemType === "assessment") {
    if (assessmentType === "pre_test") {
      return <ClipboardCheck size={15} className={`${colorClass} shrink-0`} />;
    }
    if (assessmentType === "post_test") {
      return <GraduationCap size={15} className={`${colorClass} shrink-0`} />;
    }
    return <ClipboardCheck size={15} className={`${colorClass} shrink-0`} />;
  }

  if (itemType === "page") {
    return <FileText size={15} className={`${colorClass} shrink-0`} />;
  }

  return <PlayCircle size={15} className={`${colorClass} shrink-0`} />;
};

export default function SideBarNavItem({
  index,
  label,
  itemType,
  assessmentType,
  active,
  locked = false,
  completed = false,
  collapsed,
  onClick,
}: SideBarNavItemProps) {
  if (collapsed) {
    return (
      <button
        disabled={locked}
        onClick={onClick}
        title={label}
        className={`relative mx-auto hidden h-10 w-10 items-center justify-center rounded-xl transition-colors lg:flex cursor-pointer ${
          locked
            ? "cursor-not-allowed opacity-40 text-zinc-300"
            : active
              ? "bg-purple-50 text-[#8b5cf6] ring-1 ring-purple-200"
              : "hover:bg-zinc-200/50 text-zinc-600"
        }`}
      >
        {locked ? (
          <Lock size={14} className="text-zinc-400" />
        ) : (
          getItemIcon(itemType, assessmentType, active, completed)
        )}
      </button>
    );
  }

  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors cursor-pointer ${
        locked
          ? "cursor-not-allowed bg-zinc-100/30 text-zinc-400"
          : active
            ? "border-purple-100 bg-purple-50/70 text-[#8b5cf6] font-semibold"
            : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"
      }`}
    >
      {/* Type Icon */}
      <span className="shrink-0">
        {locked ? (
          <Lock size={14} className="text-zinc-300" />
        ) : (
          getItemIcon(itemType, assessmentType, active, completed)
        )}
      </span>

      {/* Index Number */}
      <span
        className={`shrink-0 font-mono text-[11px] font-bold ${
          active ? "text-[#8b5cf6]" : "text-zinc-300"
        }`}
      >
        {index.toString().padStart(2, "0")}
      </span>

      {/* Label Text */}
      <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}
