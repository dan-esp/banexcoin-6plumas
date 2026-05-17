"use client";

import { MoonStar, SunMedium } from "lucide-react";

import { cn } from "@/lib/utils";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { isReady, theme, toggleTheme } = useTheme();
  const isDark = isReady && theme === "dark";
  const nextThemeLabel = isDark ? "Usar modo claro" : "Usar modo oscuro";

  return (
    <button
      aria-label={nextThemeLabel}
      className={cn(
        "group inline-flex size-11 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-foreground shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-soft)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.24)]",
        className,
      )}
      onClick={toggleTheme}
      title={nextThemeLabel}
      type="button"
    >
      <span
        className={cn(
          "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-white transition-all duration-300",
          isDark
            ? "bg-[linear-gradient(135deg,#2f3657_0%,#111827_100%)] shadow-[0_8px_20px_rgba(15,23,42,0.28)]"
            : "bg-[linear-gradient(135deg,var(--coin-gold)_0%,var(--brand-gradient-mid)_100%)] shadow-[0_8px_20px_rgba(255,93,48,0.24)]",
        )}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_58%)]" />
        {isDark ? (
          <MoonStar className="relative z-10 size-3.5" />
        ) : (
          <SunMedium className="relative z-10 size-3.5" />
        )}
      </span>
    </button>
  );
}
