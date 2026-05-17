import { CheckCircle2, Download, LockKeyhole } from "lucide-react";

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

import type { PublicBatchDto, PublicDisbursementDto } from "../data";
import {
  brandGradient,
  consoleMutedText,
  consoleSoftSurface,
  consoleSurface,
} from "../lib";
import { LockedActionNotice } from "./states";

const exportOptions = [
  {
    name: "Reporte detallado de cashback",
    format: "XLSX / CSV",
    description:
      "Revisa totales, niveles, advertencias y trazabilidad por fila",
    emphasis: false,
  },
  {
    name: "Archivo de pagos BanexTransfer",
    format: "CSV",
    description: "Una fila positiva de cashback USDT por cuenta",
    emphasis: true,
  },
  {
    name: "Resumen ejecutivo",
    format: "PDF / XLSX",
    description: "Resumen gerencial con contexto de aprobación",
    emphasis: false,
  },
];

export function ExportActionCard({
  batch,
  disbursements,
}: {
  batch: PublicBatchDto;
  disbursements: PublicDisbursementDto[];
}) {
  const gates = [
    { label: "Validación limpia", done: batch.validation.blockedRows === 0 },
    { label: "Oráculo bloqueado", done: Boolean(batch.payoutOracle.rate) },
    { label: "Finanzas aprobó", done: batch.approval.approved },
    { label: "Exportación habilitada", done: batch.export.ready },
  ];
  const firstDisbursement = disbursements.at(0);

  return (
    <Card className={consoleSurface} id="export">
      <CardHeader>
        <CardTitle>Centro de exportación</CardTitle>
        <CardDescription>
          Las acciones de exportación permanecen deshabilitadas hasta que
          finanzas apruebe y no existan filas bloqueadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-4">
          {gates.map((gate) => (
            <div className="flex items-center gap-2" key={gate.label}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full",
                  gate.done
                    ? cn("text-white", brandGradient)
                    : `${consoleSoftSurface} text-muted-foreground`,
                )}
              >
                {gate.done ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <LockKeyhole className="size-4" />
                )}
              </span>
              <p className="font-semibold text-foreground text-sm">
                {gate.label}
              </p>
            </div>
          ))}
        </div>
        {!batch.export.ready ? (
          <LockedActionNotice reason="Las filas bloqueadas y la aprobación de finanzas deben resolverse antes de generar la exportación." />
        ) : null}
        {exportOptions.map((option) => (
          <div
            className={cn(
              "grid gap-4 rounded-3xl p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center",
              consoleSoftSurface,
            )}
            key={option.name}
          >
            <div>
              <p className="font-bold text-foreground text-lg">{option.name}</p>
              <p className={`mt-1 text-sm ${consoleMutedText}`}>
                {option.description}
              </p>
            </div>
            <Badge tone={option.emphasis ? "warning" : "neutral"}>
              {option.format}
            </Badge>
            <Button
              className={cn(
                option.emphasis && batch.export.ready && brandGradient,
                !option.emphasis &&
                  "border-[var(--brand-border)] bg-[var(--brand-surface)] text-foreground hover:bg-[var(--brand-soft)]",
              )}
              disabled={!batch.export.ready}
              variant={option.emphasis ? "default" : "outline"}
            >
              <Download />
              Generar
            </Button>
          </div>
        ))}
        <div className={cn("rounded-3xl p-5", consoleSoftSurface)}>
          <p className="font-bold text-foreground">Ejemplo de CSV de pagos</p>
          <p className="mt-3 overflow-x-auto whitespace-nowrap font-mono text-[var(--warning-orange)] text-xs">
            referencia,numero_cuenta,alias,cashback_usdt,estado {"->"}{" "}
            {firstDisbursement?.exportReference ?? "BR-202605-000000"},
            {firstDisbursement?.accountNumber ?? "000000"},
            {firstDisbursement?.alias ?? "Pendiente"},
            {firstDisbursement?.cashbackUsdt ?? "0.00"},borrador
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
