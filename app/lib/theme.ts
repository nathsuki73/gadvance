export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "gadvance-theme-mode";

const isBrowser = (): boolean => typeof window !== "undefined";

export const getStoredTheme = (): ThemeMode | null => {
  if (!isBrowser()) {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return null;
};

export const applyTheme = (mode: ThemeMode): void => {
  if (!isBrowser()) {
    return;
  }

  document.body.classList.toggle("night-mode", mode === "dark");
  document.documentElement.setAttribute("data-theme", mode);
};

export const setTheme = (mode: ThemeMode): void => {
  if (!isBrowser()) {
    return;
  }

  applyTheme(mode);
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
};

export const initializeTheme = (): ThemeMode => {
  const storedTheme = getStoredTheme();
  const mode: ThemeMode = storedTheme ?? "dark";
  applyTheme(mode);

  if (!storedTheme && isBrowser()) {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }

  return mode;
};
