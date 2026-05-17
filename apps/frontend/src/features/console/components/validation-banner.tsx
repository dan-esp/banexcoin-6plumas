import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import { consoleMutedText, consoleSurface, formatCount } from "../lib";
import { KpiCard } from "./kpi-card";

const validationIssues = [
  [
    "122",
    "TX-90017",
    "Comercio 6 de Agosto",
    "Id de transacción duplicado",
    "Bloqueado",
  ],
  ["309", "TX-90183", "Punto QR Norte", "Falta Monto Pagado", "Bloqueado"],
  [
    "611",
    "TX-90470",
    "Mercado Central SRL",
    "Monto alto, apoyo de revisión con IA",
    "Advertencia",
  ],
] as const;

export function ValidationBanner({ batch }: { batch: PublicBatchDto }) {
  return (
    <Card className={consoleSurface} id="validation">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Resultados de validación</CardTitle>
            <CardDescription>
              La validación se revisa antes de cualquier pago. La exportación
              permanece bloqueada mientras existan filas bloqueadas.
            </CardDescription>
          </div>
          <Button variant="destructive">
            <AlertTriangle />
            Revisar errores
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Filas válidas"
            note="Filas elegibles de Pago QR"
            value={formatCount(batch.validation.validRows)}
          />
          <KpiCard
            label="Advertencias"
            note="Puede continuar con revisión"
            tone="warning"
            value={formatCount(batch.validation.warningRows)}
          />
          <KpiCard
            label="Errores"
            note="Requiere acción operativa"
            tone="danger"
            value="12"
          />
          <KpiCard
            label="Bloqueadas"
            note="Exportación bloqueada"
            tone="danger"
            value={formatCount(batch.validation.blockedRows)}
          />
        </div>
        <div className="mb-5 rounded-3xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-4">
          <p className="font-bold text-foreground">
            La validación del lote está bloqueada
          </p>
          <p className={cn("mt-1 text-sm", consoleMutedText)}>
            Resuelve las filas duplicadas o inválidas antes de calcular los
            archivos finales de exportación para BanexTransfer.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fila</TableHead>
              <TableHead>ID transacción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Incidencia</TableHead>
              <TableHead>Severidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validationIssues.map(([row, tx, user, issue, severity]) => (
              <TableRow key={tx}>
                <TableCell className="font-semibold text-foreground">
                  {row}
                </TableCell>
                <TableCell>{tx}</TableCell>
                <TableCell>{user}</TableCell>
                <TableCell>{issue}</TableCell>
                <TableCell>
                  <Badge tone={severity === "Bloqueado" ? "danger" : "warning"}>
                    {severity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
