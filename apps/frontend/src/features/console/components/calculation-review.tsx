"use client";

import { Download, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { approveBatchAction } from "../actions/batch-export";
import type { PublicBatchDto, PublicResultDto } from "../data";
import {
  brandGradient,
  consoleMutedText,
  consoleSoftSurface,
  consoleSurface,
  formatOracleRate,
  formatUsdt,
} from "../lib";
import { ResultsTable } from "./results-table";

export function CalculationReview({
  batch,
  results,
}: {
  batch: PublicBatchDto;
  results: PublicResultDto[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const canApprove =
    batch.validation.blockedRows === 0 && !batch.approval.approved;

  function handleApprove() {
    if (!canApprove || isPending) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await approveBatchAction(batch.id);

      if (result.status === "error") {
        setMessage(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Card className={consoleSurface} id="calculations">
      <CardHeader>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <CardTitle>Revisión de cálculo</CardTitle>
            <CardDescription>
              Finanzas revisa el pasivo en USDT, la tasa del oráculo, el nivel
              aplicado y las advertencias antes de aprobar.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="warning">Incluye advertencias</Badge>
            <Button
              className={cn(canApprove && brandGradient)}
              disabled={!canApprove || isPending}
              onClick={handleApprove}
            >
              <ShieldCheck />
              {isPending ? "Aprobando" : "Aprobar lote"}
            </Button>
            <Button
              className={cn("hover:bg-[var(--brand-soft)]", consoleSoftSurface)}
              disabled={!batch.export.ready}
              variant="outline"
            >
              <Download />
              Borrador de exportación
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[var(--warning-orange)]/30 bg-[var(--warning-orange)]/10 p-4">
            <p className={cn("font-semibold text-xs", consoleMutedText)}>
              Oráculo de pago
            </p>
            <p className="mt-2 font-bold text-xl">
              {formatOracleRate(batch.payoutOracle.rate)}
            </p>
            <p className={cn("mt-1 text-xs", consoleMutedText)}>
              {batch.payoutOracle.source ?? "Origen del oráculo pendiente"}
            </p>
          </div>
          <div className={cn("rounded-3xl p-4", consoleSoftSurface)}>
            <p className={cn("font-semibold text-xs", consoleMutedText)}>
              Pasivo de cashback
            </p>
            <p className="mt-2 font-bold text-xl">
              {formatUsdt(batch.totals.cashbackUsdt)}
            </p>
            <p className={cn("mt-1 text-xs", consoleMutedText)}>
              Bloqueado solo para revisión de finanzas
            </p>
          </div>
          <div className={cn("rounded-3xl p-4", consoleSoftSurface)}>
            <p className={cn("font-semibold text-xs", consoleMutedText)}>
              Control de exportación
            </p>
            <p className="mt-2 font-bold text-xl">
              {batch.export.ready ? "Listo" : "Bloqueado"}
            </p>
            <p className={cn("mt-1 text-xs", consoleMutedText)}>
              Requiere aprobación y limpieza de filas bloqueadas
            </p>
          </div>
        </div>
        {message ? (
          <div className="mb-5 rounded-xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-3 text-sm text-[var(--blocked-red)]">
            {message}
          </div>
        ) : null}
        <ResultsTable results={results} />
        <div className={cn("mt-5 rounded-3xl p-4", consoleSoftSurface)}>
          <p className="font-bold text-foreground">Traza de fórmula</p>
          <p className={cn("mt-2 text-sm", consoleMutedText)}>
            cashbackUsdt = cashbackBs / tasa bloqueada del oráculo de pago. Las
            tasas efectivas históricas se muestran solo para auditoría y nunca
            reemplazan al oráculo de pago.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
