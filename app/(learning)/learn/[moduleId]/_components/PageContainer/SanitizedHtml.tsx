"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

/**
 * Renders lesson HTML that was authored in the admin portal.
 *
 * The HTML comes from the database, so it is sanitized before it reaches the
 * page: scripts, event handlers, and `javascript:` links are removed. Nothing
 * is rendered on the server, where DOMPurify has no DOM to work with and
 * would return the markup unchanged.
 */
export default function SanitizedHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => {
    if (typeof window === "undefined" || !DOMPurify.isSupported) return "";
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  }, [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
