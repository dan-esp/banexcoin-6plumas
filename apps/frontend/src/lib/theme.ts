export const THEME_COOKIE_NAME = "banexcoin-theme";
export const THEME_STORAGE_KEY = "banexcoin-theme";

export type AppTheme = "light" | "dark";

export function isDarkTheme(value: string | undefined) {
  return value === "dark";
}

export function normalizeTheme(value: string | null | undefined): AppTheme {
  return isDarkTheme(value ?? undefined) ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export function persistTheme(theme: AppTheme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  // Cookie keeps landing and console theme in sync across localhost ports.
  // biome-ignore lint/suspicious/noDocumentCookie: cross-app theme sync needs a shared cookie.
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function resolveClientTheme(): AppTheme {
  const cookieTheme = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${THEME_COOKIE_NAME}=`))
    ?.split("=")[1];

  return normalizeTheme(
    cookieTheme ?? window.localStorage.getItem(THEME_STORAGE_KEY),
  );
}
