"use client";

import { useEffect } from "react";
import { applyTheme, getStoredTheme, initializeTheme } from "@/app/lib/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useEffect(() => {
    initializeTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if ((getStoredTheme() ?? "system") === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
