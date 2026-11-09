"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Menu, X } from "lucide-react";
import { DOC_GROUPS, docsInGroup } from "../_lib/registry";
import { DocsSearch } from "./DocsSearch";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation" className="space-y-7">
      <DocsSearch onNavigate={onNavigate} />
      <Link
        href="/docs"
        onClick={onNavigate}
        aria-current={pathname === "/docs" ? "page" : undefined}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          pathname === "/docs" ? "bg-violet-50 text-primary" : "text-zinc-700 hover:bg-zinc-50"
        }`}
      >
        <BookOpen size={16} aria-hidden="true" /> Documentation home
      </Link>
      {DOC_GROUPS.map((group) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">{group}</p>
          <ul className="space-y-0.5">
            {docsInGroup(group).map((doc) => {
              const href = `/docs/${doc.slug}`;
              const active = pathname === href;
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      active ? "bg-violet-50 font-medium text-primary" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="bg-white text-zinc-900">
      <div className="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-8 pr-2">
            <SidebarNav />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-16 z-20 -mx-4 flex items-center gap-3 border-b border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="docs-mobile-nav"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700"
            >
              <Menu size={16} aria-hidden="true" /> Docs menu
            </button>
          </div>
          {children}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Documentation menu">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-900/30"
            aria-label="Close documentation menu"
            onClick={() => setMobileOpen(false)}
          />
          <div id="docs-mobile-nav" className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900">Documentation</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close documentation menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
