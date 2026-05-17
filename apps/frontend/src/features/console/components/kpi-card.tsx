import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { consoleMutedText, consoleSurface } from "../lib";

const toneClass = {
  success: "text-[var(--success)]",
  info: "text-[var(--info-blue)]",
  warning: "text-[var(--warning-orange)]",
  danger: "text-[var(--blocked-red)]",
} as const;

export function KpiCard({
  label,
  value,
  note,
  tone = "success",
}: {
  label: string;
  value: string;
  note: string;
  tone?: keyof typeof toneClass;
}) {
  return (
    <Card className={cn("p-5", consoleSurface)}>
      <p className={cn("font-semibold text-xs", consoleMutedText)}>{label}</p>
      <p className="mt-3 break-words font-bold text-2xl text-foreground">
        {value}
      </p>
      <p className={cn("mt-4 font-semibold text-xs", toneClass[tone])}>
        {note}
      </p>
    </Card>
  );
}
