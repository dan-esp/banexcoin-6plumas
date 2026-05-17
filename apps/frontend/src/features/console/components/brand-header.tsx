import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import {
  brandGradient,
  brandGradientText,
  formatBs,
  formatUsdt,
  getNextAction,
} from "../lib";

export function BrandHeader({ batch }: { batch: PublicBatchDto }) {
  const nextAction = getNextAction(batch);

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--brand-surface)] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:p-7"
      id="dashboard"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 opacity-55"
      >
        <div className="absolute right-[-4%] bottom-0 h-28 w-[65%] rounded-t-[100%] bg-[#262634]" />
        <div className="absolute right-[18%] bottom-0 h-20 w-[48%] rounded-t-[100%] bg-[#303044]" />
        <div className="absolute right-[38%] bottom-0 h-14 w-[32%] rounded-t-[100%] bg-[#3a3a50]" />
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-0 right-0 h-1 w-full opacity-95",
          brandGradient,
        )}
      />
      <div className="relative grid gap-6 xl:grid-cols-[1fr_380px] xl:items-end">
        <div className="max-w-3xl">
          <Badge tone={nextAction.tone}>
            {batch.validation.exportBlocked ? "Export locked" : "Gate clear"}
          </Badge>
          <h1 className="mt-5 max-w-3xl font-bold text-4xl leading-[1.04] tracking-normal lg:text-5xl">
            Protege el valor del reintegro con{" "}
            <span className={brandGradientText}>USDT</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/58">
            Revisa pagos QR, bloqueos de validacion y liability para pagar en
            bolivianos con un flujo auditable antes de BanexTransfer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className={cn("h-10 rounded-full px-5 text-white", brandGradient)}
            >
              {nextAction.label}
              <ArrowRight />
            </Button>
            <Button
              className="h-10 rounded-full border-white/12 bg-white/[0.06] px-5 text-white hover:bg-white/10"
              variant="outline"
            >
              <ShieldCheck />
              View controls
            </Button>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white/45 text-xs">
                Current batch
              </p>
              <p className="mt-1 font-bold text-3xl">{batch.period.label}</p>
            </div>
            <Badge tone="warning">{batch.status}</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
              <p className="text-white/45 text-xs">Cashback liability</p>
              <p className="mt-2 font-bold text-2xl">
                {formatUsdt(batch.totals.cashbackUsdt)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <p className="text-white/45 text-xs">Consumption</p>
                <p className="mt-2 font-bold">
                  {formatBs(batch.totals.consumptionBs)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <p className="text-white/45 text-xs">Blocked rows</p>
                <p className="mt-2 flex items-center gap-2 font-bold text-[var(--blocked-red)]">
                  <AlertTriangle className="size-4" />
                  {batch.validation.blockedRows}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/50">{nextAction.description}</p>
        </div>
      </div>
    </section>
  );
}
