"use client";

import { Download, FileCheck2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  approveBatchAction,
  prepareBanexTransferExportAction,
} from "../actions/batch-export";
import { useBatchFlow } from "../data/use-batch-flow";
import {
  brandGradient,
  consoleMutedText,
  consolePageShell,
  consoleSoftSurface,
  consoleStatePanel,
  consoleSurface,
} from "../lib";
import { AppShell } from "./app-shell";
import { ExportActionCard } from "./export-action-card";
import { EmptyState, ErrorState } from "./states";

type ExportCommandState =
  | { status: "idle" }
  | { status: "pending"; label: string }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

function PrivateExportTestPanel({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ExportCommandState>({ status: "idle" });

  function runCommand(
    label: string,
    action: () => Promise<
      { status: "success" } | { status: "error"; message: string }
    >,
    successMessage: string,
  ) {
    setState({ status: "pending", label });
    startTransition(async () => {
      const result = await action();

      if (result.status === "error") {
        setState({ status: "error", message: result.message });
        return;
      }

      setState({ status: "success", message: successMessage });
      router.refresh();
    });
  }

  return (
    <Card className={consoleSurface}>
      <CardHeader>
        <CardTitle>Prueba directa de exportación privada</CardTitle>
        <CardDescription>
          Este panel usa Server Actions contra la API privada para probar un
          lote por ID aunque la API pública todavía no tenga su proyección.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className={consoleSoftSurface}>
          <p className="font-semibold text-foreground text-sm">Batch ID</p>
          <p className="mt-2 break-all font-mono text-sm text-muted-foreground">
            {batchId}
          </p>
        </div>

        {state.status === "error" ? (
          <div className="rounded-xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-3 text-sm text-[var(--blocked-red)]">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" ? (
          <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-3 text-sm text-foreground">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <Button
            className={brandGradient}
            disabled={isPending}
            onClick={() =>
              runCommand(
                "Aprobando",
                () => approveBatchAction(batchId),
                "Aprobación registrada.",
              )
            }
          >
            <ShieldCheck />
            {state.status === "pending" && state.label === "Aprobando"
              ? "Aprobando"
              : "Aprobar"}
          </Button>

          <Button
            disabled={isPending}
            onClick={() =>
              runCommand(
                "Preparando",
                () => prepareBanexTransferExportAction(batchId),
                "Exportación preparada.",
              )
            }
            variant="outline"
          >
            <FileCheck2 />
            {state.status === "pending" && state.label === "Preparando"
              ? "Preparando"
              : "Preparar CSV"}
          </Button>

          <Button asChild variant="outline">
            <a href={`/api/batches/${batchId}/export/banextransfer`}>
              <Download />
              Descargar CSV
            </a>
          </Button>
        </div>

        <p className={`text-xs ${consoleMutedText}`}>
          Orden recomendado: aprobar, preparar CSV y descargar. Si el lote ya
          fue aprobado/exportado, las acciones son idempotentes.
        </p>
      </CardContent>
    </Card>
  );
}

export function BatchExportClient({ batchId }: { batchId: string }) {
  const state = useBatchFlow(batchId);

  if (state.status === "loading") {
    return (
      <main className={consolePageShell}>
        <p className="font-bold">Cargando centro de exportación</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <ErrorState message={state.message} />
          <div className="mt-5">
            <PrivateExportTestPanel batchId={batchId} />
          </div>
        </div>
      </main>
    );
  }

  if (state.status === "empty") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <EmptyState
            title="No hay un lote disponible"
            description="No se pudo cargar el lote seleccionado desde la API pública."
          />
          <div className="mt-5">
            <PrivateExportTestPanel batchId={batchId} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <AppShell batch={state.data.batch}>
      <ExportActionCard
        batch={state.data.batch}
        disbursements={state.data.disbursements}
      />
    </AppShell>
  );
}
