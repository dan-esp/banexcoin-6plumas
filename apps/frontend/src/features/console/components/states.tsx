import { AlertTriangle, Database, Info, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { ConsoleNotice } from "../data";
import { brandGradient } from "../lib";

const toneStyles = {
  info: {
    card: "border-[var(--info-blue)]/30 bg-[var(--info-blue)]/10",
    icon: "text-[#b9adff]",
    Icon: Info,
  },
  error: {
    card: "border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10",
    icon: "text-[var(--warning-orange)]",
    Icon: AlertTriangle,
  },
} as const;

export function NoticeBanner({ notice }: { notice: NonNullable<ConsoleNotice> }) {
  const style = toneStyles[notice.tone];
  return (
    <Card className={cn("p-4 text-white", style.card)}>
      <div className="flex gap-3">
        <style.Icon className={cn("mt-0.5 size-5 shrink-0", style.icon)} />
        <div>
          <p className="font-bold">{notice.title}</p>
          <p className="mt-1 text-sm text-white/60">{notice.message}</p>
        </div>
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-40 place-items-center rounded-3xl border border-dashed border-white/14 bg-white/[0.03] p-6 text-center">
      <div>
        <Database className="mx-auto size-8 text-white/36" />
        <p className="mt-3 font-bold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-white/50">{description}</p>
      </div>
    </div>
  );
}

export function LockedActionNotice({
  label = "Action locked",
  reason,
}: {
  label?: string;
  reason: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.08] text-white/58">
          <LockKeyhole className="size-4" />
        </span>
        <div>
          <p className="font-bold">{label}</p>
          <p className="mt-1 text-sm text-white/52">{reason}</p>
        </div>
      </div>
      <Button className={cn("text-white", brandGradient)} disabled>
        Locked
      </Button>
    </div>
  );
}
