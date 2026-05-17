"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  type AppTheme,
  applyTheme,
  persistTheme,
  resolveClientTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  isReady: boolean;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<AppTheme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedTheme = resolveClientTheme();
    setThemeState(storedTheme);
    applyTheme(storedTheme);
    setIsReady(true);
  }, []);

  function setTheme(nextTheme: AppTheme) {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const value: ThemeContextValue = {
    isReady,
    setTheme,
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
