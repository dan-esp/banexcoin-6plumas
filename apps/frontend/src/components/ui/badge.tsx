import type * as React from "react";

import { cn } from "@/lib/utils";

const toneClass = {
  default: "bg-primary text-primary-foreground",
  success: "bg-[var(--success)]/15 text-[var(--success)]",
  warning: "bg-[var(--warning-orange)]/15 text-[var(--warning-orange)]",
  danger: "bg-[var(--blocked-red)]/15 text-[var(--blocked-red)]",
  info: "bg-[var(--info-blue)]/15 text-[#b9adff]",
  neutral: "bg-muted text-muted-foreground",
} as const;

function Badge({
  className,
  tone = "default",
  ...props
}: React.ComponentProps<"span"> & {
  tone?: keyof typeof toneClass;
}) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 font-semibold text-xs",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
