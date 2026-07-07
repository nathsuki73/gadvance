"use client";

import { useEffect, useState } from "react";

export function useScrollDirection(threshold = 10) {
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      // Always show near the top
      if (currentY <= 20) {
        setShowHeader(true);
      }
      // Hide only after scrolling down a bit
      else if (currentY > lastY + threshold) {
        setShowHeader(false);
      }
      // Show immediately on any upward movement
      else if (currentY < lastY) {
        setShowHeader(true);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return showHeader;
}
