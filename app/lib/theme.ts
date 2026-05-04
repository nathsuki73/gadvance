export type ThemeMode = "light" | "dark";
export type ThemePreference = ThemeMode | "system";

export const THEME_STORAGE_KEY = "gadvance-theme-mode";

const isBrowser = (): boolean => typeof window !== "undefined";

export const getSystemTheme = (): ThemeMode => {
  if (!isBrowser()) {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getStoredTheme = (): ThemePreference | null => {
  if (!isBrowser()) {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
  ) {
    return storedTheme;
  }

  return null;
};

export const resolveTheme = (preference: ThemePreference): ThemeMode => {
  return preference === "system" ? getSystemTheme() : preference;
};

export const applyTheme = (preference: ThemePreference): ThemeMode => {
  if (!isBrowser()) {
    return resolveTheme(preference);
  }

  const mode = resolveTheme(preference);
  document.body.classList.toggle("night-mode", mode === "dark");
  document.documentElement.setAttribute("data-theme", mode);

  return mode;
};

export const setTheme = (preference: ThemePreference): void => {
  if (!isBrowser()) {
    return;
  }

  applyTheme(preference);
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
};

export const initializeTheme = (): ThemeMode => {
  const storedTheme = getStoredTheme();
  const preference: ThemePreference = storedTheme ?? "system";
  return applyTheme(preference);
};
