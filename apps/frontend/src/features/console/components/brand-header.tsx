import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import {
  brandGradient,
  brandGradientText,
  consoleGlassSurface,
  consoleMutedText,
  consoleSoftSurface,
  formatBs,
  formatOracleRate,
  formatUsdt,
  getNextAction,
} from "../lib";

export function BrandHeader({ batch }: { batch: PublicBatchDto }) {
  const nextAction = getNextAction(batch);
  const oracleStatusTone =
    batch.payoutOracle.status?.toLowerCase() === "valid"
      ? "success"
      : "warning";
  const oracleFetchedAt = batch.payoutOracle.fetchedAt
    ? new Date(batch.payoutOracle.fetchedAt).toLocaleString("es-BO")
    : "Pendiente";

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 text-foreground shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:p-7"
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
            {batch.validation.exportBlocked
              ? "Exportación bloqueada"
              : "Control superado"}
          </Badge>
          <h1 className="mt-5 max-w-3xl font-bold text-4xl leading-[1.04] tracking-normal lg:text-5xl">
            Protege el valor del reintegro con{" "}
            <span className={brandGradientText}>USDT</span>
          </h1>
          <p className={cn("mt-4 max-w-2xl text-base", consoleMutedText)}>
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
              className={cn(
                "h-10 rounded-full px-5 hover:bg-[var(--brand-soft)]",
                consoleSoftSurface,
              )}
              variant="outline"
            >
              <ShieldCheck />
              Ver controles
            </Button>
          </div>
        </div>
        <div className={cn("rounded-[1.5rem] p-5", consoleGlassSurface)}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={cn("font-semibold text-xs", consoleMutedText)}>
                Lote actual
              </p>
              <p className="mt-1 font-bold text-3xl">{batch.period.label}</p>
            </div>
            <Badge tone="warning">{batch.status}</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            <div className={cn("rounded-2xl p-4", consoleSoftSurface)}>
              <p className={cn("text-xs", consoleMutedText)}>
                Pasivo de cashback
              </p>
              <p className="mt-2 font-bold text-2xl">
                {formatUsdt(batch.totals.cashbackUsdt)}
              </p>
            </div>
            <div className={cn("rounded-2xl p-4", consoleSoftSurface)}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("text-xs", consoleMutedText)}>
                    Oracle actual
                  </p>
                  <p className="mt-2 font-bold text-xl text-foreground">
                    {formatOracleRate(batch.payoutOracle.rate)}
                  </p>
                </div>
                <Badge tone={oracleStatusTone}>
                  {batch.payoutOracle.status ?? "Pendiente"}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <p className={consoleMutedText}>
                  Fuente:{" "}
                  <span className="font-medium text-foreground">
                    {batch.payoutOracle.source ?? "Pendiente"}
                  </span>
                </p>
                <p className={consoleMutedText}>
                  Lectura:{" "}
                  <span className="font-medium text-foreground">
                    {oracleFetchedAt}
                  </span>
                </p>
                {!batch.payoutOracle.rate ? (
                  <p className={consoleMutedText}>
                    Sin tasa bloqueada todavía para este lote.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={cn("rounded-2xl p-4", consoleSoftSurface)}>
                <p className={cn("text-xs", consoleMutedText)}>Consumo</p>
                <p className="mt-2 font-bold">
                  {formatBs(batch.totals.consumptionBs)}
                </p>
              </div>
              <div className={cn("rounded-2xl p-4", consoleSoftSurface)}>
                <p className={cn("text-xs", consoleMutedText)}>
                  Filas bloqueadas
                </p>
                <p className="mt-2 flex items-center gap-2 font-bold text-[var(--blocked-red)]">
                  <AlertTriangle className="size-4" />
                  {batch.validation.blockedRows}
                </p>
              </div>
            </div>
          </div>
          <p className={cn("mt-4 text-sm", consoleMutedText)}>
            {nextAction.description}
          </p>
        </div>
      </div>
    </section>
  );
}
