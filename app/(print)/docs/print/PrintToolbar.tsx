"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { DOCS_PDF_PATH } from "@/app/(public)/docs/_lib/registry";

/**
 * Prepares the page for paper, then offers print and download actions.
 *
 * - Collapsed FAQ answers are opened, because a closed <details> prints
 *   without its answer.
 * - Screenshots are loaded up front; lazy images below the fold would
 *   otherwise print as blank boxes.
 * - Links between articles become jumps inside the document. Other site
 *   links become absolute when NEXT_PUBLIC_SITE_URL is set, and plain text
 *   otherwise, so the PDF never points at the machine that built it.
 *
 * `data-print-ready` on <body> tells the PDF build script the page is done.
 */
export default function PrintToolbar({ siteUrl }: { siteUrl?: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sheet = document.querySelector<HTMLElement>(".print-sheet");
    if (!sheet) return;

    sheet.querySelectorAll("details").forEach((d) => {
      d.open = true;
    });

    const base = siteUrl?.replace(/\/$/, "");
    sheet.querySelectorAll<HTMLAnchorElement>("a[href^='/']").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      const doc = href.match(/^\/docs\/([a-z0-9-]+)(#.+)?$/);
      if (doc && doc[1] !== "print") {
        a.setAttribute("href", doc[2] ?? `#doc-${doc[1]}`);
      } else if (base) {
        a.setAttribute("href", `${base}${href}`);
      } else {
        a.removeAttribute("href");
      }
    });

    const images = Array.from(sheet.querySelectorAll("img"));
    images.forEach((img) => {
      img.loading = "eager";
    });

    Promise.all(
      images.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
      ),
    ).then(() => {
      if (cancelled) return;
      document.body.dataset.printReady = "true";
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [siteUrl]);

  return (
    <div className="print-hidden sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" /> Back to documentation
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!ready}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            <Printer size={16} aria-hidden="true" /> Print
          </button>
          <a
            href={DOCS_PDF_PATH}
            download
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Download size={16} aria-hidden="true" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
