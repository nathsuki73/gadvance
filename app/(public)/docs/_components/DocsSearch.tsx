"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { searchDocs } from "../_lib/registry";

export function DocsSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchDocs(query).slice(0, 6), [query]);
  const open = query.trim().length > 0;

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Search the documentation
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Search docs"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          } else if (e.key === "Escape") {
            setQuery("");
          } else if (e.key === "Enter" && results[activeIndex]) {
            e.preventDefault();
            window.location.assign(`/docs/${results[activeIndex].slug}`);
          }
        }}
        className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      {open && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-700"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">No articles match &quot;{query}&quot;.</li>
          ) : (
            results.map((doc, index) => (
              <li key={doc.slug} role="option" aria-selected={index === activeIndex}>
                <Link
                  href={`/docs/${doc.slug}`}
                  onClick={() => {
                    setQuery("");
                    onNavigate?.();
                  }}
                  className={`block px-4 py-3 text-left ${index === activeIndex ? "bg-violet-50" : "hover:bg-zinc-50"}`}
                >
                  <span className="block text-sm font-medium text-zinc-900">{doc.title}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500 line-clamp-2">{doc.description}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
