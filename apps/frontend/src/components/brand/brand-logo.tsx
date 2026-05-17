import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  subtitle?: string;
  textClassName?: string;
  variant?: "auth" | "console" | "icon";
};

function BrandMonogram({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative grid size-11 place-items-center overflow-hidden rounded-[1.1rem] border border-white/14 bg-[linear-gradient(145deg,#002c26_0%,#006e5e_56%,#eca62a_100%)] shadow-[0_18px_40px_rgba(0,62,55,0.32)]",
        className,
      )}
    >
      <div className="absolute inset-[2px] rounded-[0.95rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      <svg
        aria-hidden="true"
        className="relative z-10 h-[1.65rem] w-[1.65rem]"
        fill="none"
        viewBox="0 0 64 64"
      >
        <circle
          cx="32"
          cy="32"
          r="21"
          stroke="rgba(255,255,255,0.24)"
          strokeWidth="2.5"
        />
        <path
          d="M24 16h11.5c6.6 0 10.9 3.6 10.9 8.9 0 3.6-1.9 6.1-5.1 7.4 4.1 1 6.5 4.2 6.5 8.5 0 6.2-4.8 10.2-12 10.2H24V16Zm6.1 5.8v8H34c3.5 0 5.4-1.4 5.4-4s-1.8-4-5.1-4h-4.2Zm0 13.1v10.4h5c3.8 0 5.9-1.8 5.9-5 0-3.2-2.2-5-6.2-5h-4.7Z"
          fill="#fff"
        />
        <circle cx="47.5" cy="18.5" fill="#F7D36E" r="3.5" />
      </svg>
    </div>
  );
}

export function BrandLogo({
  className,
  iconClassName,
  subtitle,
  textClassName,
  variant = "console",
}: BrandLogoProps) {
  if (variant === "icon") {
    return <BrandMonogram className={iconClassName} />;
  }

  const resolvedSubtitle =
    subtitle ??
    (variant === "auth" ? brand.authLabel : brand.consoleDescriptor);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMonogram className={iconClassName} />
      <div className={cn("min-w-0", textClassName)}>
        <p className="truncate font-bold text-lg leading-tight text-foreground">
          {brand.appName}
        </p>
        <p className="truncate font-semibold text-[0.78rem] tracking-[0.18em] text-[var(--coin-gold)] uppercase">
          {resolvedSubtitle}
        </p>
      </div>
    </div>
  );
}
