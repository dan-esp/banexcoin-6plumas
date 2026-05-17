"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useBatchFlow } from "../data/use-batch-flow";
import { consolePageShell, consoleStatePanel, consoleSurface } from "../lib";
import { AppShell } from "./app-shell";
import { EmptyState, ErrorState } from "./states";
import { TransactionsTable } from "./transactions-table";

export function BatchTransactionsClient({ batchId }: { batchId: string }) {
  const state = useBatchFlow(batchId);

  if (state.status === "loading") {
    return (
      <main className={consolePageShell}>
        <p className="font-bold">Cargando transacciones del lote</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <ErrorState message={state.message} />
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
        </div>
      </main>
    );
  }

  return (
    <AppShell batch={state.data.batch}>
      <Card className={consoleSurface}>
        <CardHeader>
          <CardTitle>Transacciones del lote</CardTitle>
          <CardDescription>
            Lectura pública de los pagos QR asociados al lote o recuperados por
            período cuando aún no exista relación directa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={state.data.transactions} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
