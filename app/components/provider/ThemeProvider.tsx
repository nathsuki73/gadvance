"use client";

import { useEffect } from "react";
import { initializeTheme } from "@/app/lib/theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useEffect(() => {
    initializeTheme();
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
