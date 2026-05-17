"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import {
  brandGradient,
  consoleMutedText,
  consoleSoftSurface,
  consoleStatePanel,
  consoleSurface,
  formatBs,
  formatUsdt,
  resultTone,
} from "../lib";
import { AppShell } from "./app-shell";
import { ErrorState } from "./states";

type PublicListResponse<T> = {
  data: T[];
};

type BatchListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | {
      status: "ready";
      batches: PublicBatchDto[];
    };

let cachedBatchList: PublicBatchDto[] | null = null;

function LoadingState() {
  return (
    <AppShell>
      <div className={`${consoleStatePanel} max-w-sm p-6 text-center`}>
        <p className="font-bold">Cargando lotes</p>
        <p className={`mt-1 text-sm ${consoleMutedText}`}>
          Cargando el historial público autenticado de lotes.
        </p>
      </div>
    </AppShell>
  );
}

export function BatchListClient() {
  const apiFetch = useApiClient();
  const [state, setState] = useState<BatchListState>(
    cachedBatchList
      ? {
          status: "ready",
          batches: cachedBatchList,
        }
      : { status: "loading" },
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBatches() {
      if (cachedBatchList) {
        setState({
          status: "ready",
          batches: cachedBatchList,
        });
        return;
      }

      setState({ status: "loading" });

      try {
        const response = await apiFetch("/v1/batches?limit=20");

        if (!response.ok) {
          throw new Error(`Public API responded with ${response.status}`);
        }

        const payload =
          (await response.json()) as PublicListResponse<PublicBatchDto>;

        if (cancelled) {
          return;
        }

        if (payload.data.length === 0) {
          setState({ status: "empty" });
          return;
        }

        cachedBatchList = payload.data;

        setState({
          status: "ready",
          batches: payload.data,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "API pública no disponible",
        });
      }
    }

    void loadBatches();

    return () => {
      cancelled = true;
    };
  }, [apiFetch]);

  if (state.status === "loading") {
    return <LoadingState />;
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <ErrorState message={state.message} />
        </div>
      </AppShell>
    );
  }

  if (state.status === "empty") {
    return (
      <AppShell>
        <div className="grid gap-5">
          <section className="grid gap-4" id="dashboard">
            <div>
              <h1 className="font-bold text-3xl text-foreground">
                Panel operativo
              </h1>
              <p className={`mt-2 text-sm ${consoleMutedText}`}>
                La consola ya está lista para trabajar. Cuando subas el primer
                lote, este tablero mostrará su validación, cálculo y
                exportación.
              </p>
            </div>
          </section>
          <Card className={cn(consoleSurface, "rounded-[2rem]")}>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-bold text-2xl text-foreground">
                  Empieza creando tu primer lote mensual
                </p>
                <p
                  className={cn(
                    "mt-2 max-w-2xl text-sm leading-6",
                    consoleMutedText,
                  )}
                >
                  La API pública está disponible, pero todavía no existe un lote
                  persistido. Sube el reporte manual de pagos QR para activar el
                  flujo completo de validación, cálculo y exportación.
                </p>
              </div>
              <Button
                asChild
                className={cn("px-5 text-white", brandGradient)}
                size="lg"
              >
                <Link href="/batches/new">
                  Cargar lote
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className={consoleSurface}>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Lotes publicados</CardTitle>
                <p className={`mt-2 text-sm ${consoleMutedText}`}>
                  Aún no hay lotes persistidos, pero esta lista quedará visible
                  desde aquí en cuanto subas el primero.
                </p>
              </div>
              <Badge tone="neutral">0 lotes</Badge>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[0, 1].map((item) => (
                <div
                  className={cn(
                    "rounded-[1.5rem] border border-dashed border-[var(--brand-border)] p-5",
                    consoleSoftSurface,
                  )}
                  key={item}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Esperando lote mensual
                      </p>
                      <p className={`mt-2 text-sm ${consoleMutedText}`}>
                        Aquí verás el período, estado, consumo, cashback y
                        accesos rápidos al resumen cuando exista un lote.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span
                        className={cn(
                          "rounded-full border px-4 py-2 font-semibold text-sm opacity-60",
                          consoleSoftSurface,
                        )}
                      >
                        Resumen
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-4 py-2 font-semibold text-sm opacity-60",
                          consoleSoftSurface,
                        )}
                      >
                        Resultados
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-4 py-2 font-semibold text-sm opacity-60",
                          consoleSoftSurface,
                        )}
                      >
                        Transacciones
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-4 py-2 font-semibold text-sm opacity-60",
                          consoleSoftSurface,
                        )}
                      >
                        Exportación
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const latestBatch = state.batches[0];

  return (
    <AppShell batch={latestBatch}>
      <section className="grid gap-4" id="dashboard">
        <div>
          <h1 className="font-bold text-3xl text-foreground">
            Panel operativo
          </h1>
          <p className={`mt-2 text-sm ${consoleMutedText}`}>
            Vista autenticada de lotes de cashback persistidos. Abre un lote
            para continuar con la revisión, el cálculo y la exportación.
          </p>
        </div>
      </section>
      <section className="grid gap-4">
        {state.batches.map((batch) => (
          <Card className={consoleSurface} key={batch.id}>
            <CardHeader className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle>{batch.period.label}</CardTitle>
                <p className={`mt-2 text-sm ${consoleMutedText}`}>
                  {batch.validation.blockedRows} filas bloqueadas,{" "}
                  {batch.validation.warningRows} filas con advertencia,{" "}
                  {batch.totals.users} usuarios en alcance.
                </p>
              </div>
              <Badge tone={resultTone(batch.validation.status)}>
                {batch.status}
              </Badge>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className={`text-xs ${consoleMutedText}`}>Consumo</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatBs(batch.totals.consumptionBs)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${consoleMutedText}`}>
                    Pasivo de cashback
                  </p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatUsdt(batch.totals.cashbackUsdt)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${consoleMutedText}`}>Oracle</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {batch.payoutOracle.rate ?? "Pendiente"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className={`rounded-full border px-4 py-2 font-semibold text-sm text-foreground transition-colors hover:bg-[var(--brand-soft)] ${consoleSoftSurface}`}
                  href={`/batches/${batch.id}`}
                >
                  Resumen
                </Link>
                <Link
                  className={`rounded-full border px-4 py-2 font-semibold text-sm text-foreground transition-colors hover:bg-[var(--brand-soft)] ${consoleSoftSurface}`}
                  href={`/batches/${batch.id}/results`}
                >
                  Resultados
                </Link>
                <Link
                  className={`rounded-full border px-4 py-2 font-semibold text-sm text-foreground transition-colors hover:bg-[var(--brand-soft)] ${consoleSoftSurface}`}
                  href={`/batches/${batch.id}/transactions`}
                >
                  Transacciones
                </Link>
                <Link
                  className={`rounded-full border px-4 py-2 font-semibold text-sm text-foreground transition-colors hover:bg-[var(--brand-soft)] ${consoleSoftSurface}`}
                  href={`/batches/${batch.id}/export`}
                >
                  Exportación
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
