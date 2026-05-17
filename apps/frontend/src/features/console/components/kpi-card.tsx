import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className="border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <p className="font-semibold text-white/44 text-xs">{label}</p>
      <p className="mt-3 break-words font-bold text-2xl text-white">{value}</p>
      <p className={cn("mt-4 font-semibold text-xs", toneClass[tone])}>
        {note}
      </p>
    </Card>
  );
}
