import React from "react";
import { Menu } from "lucide-react";

type LearnLayoutProps = {
  collapsed: boolean;
  title: string;
  description: string | undefined;
  onOpenMobile: () => void; // Added handler prop
  children: React.ReactNode;
};

const LearnLayout = ({
  collapsed,
  title,
  description,
  onOpenMobile,
  children,
}: LearnLayoutProps) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col bg-white
        /* Dynamic padding offset based on desktop sidebar state */
        ${collapsed ? "lg:pl-[72px]" : "lg:pl-80"}
      `}
    >
      {/* MOBILE TOP BAR - Hidden on desktop, visible on mobile */}
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:hidden sticky top-0 z-30">
        <button
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 active:bg-zinc-100"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        
        <span className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]">
          {title}
        </span>
        
        {/* Empty balancing div to keep title perfectly centered */}
        <div className="w-9" />
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
        <div className="mb-6 hidden lg:block">
          <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
          {description && <p className="mt-1 text-zinc-500 text-sm">{description}</p>}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default LearnLayout;