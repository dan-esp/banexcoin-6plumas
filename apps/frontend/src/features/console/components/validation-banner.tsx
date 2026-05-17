import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

import type { ProcessingReportDto } from "../actions/upload.types";
import type { PublicBatchDto } from "../data";
import {
  consoleMutedText,
  consoleSurface,
  formatCount,
} from "../lib";
import { KpiCard } from "./kpi-card";

type Props = {
  batch: PublicBatchDto;
  validationReport?: ProcessingReportDto;
};

// ── Live-data view (shown after a real upload preview) ────────────────────────

function LiveValidationView({
  validationReport,
}: {
  validationReport: ProcessingReportDto;
}) {
  const {
    audit,
    errors,
    warnings,
    usersQualifyingForCashback,
    usersNotQualifying,
    totalUsersAnalyzed,
  } = validationReport;

  const blocked = errors.length > 0;

  return (
    <Card className={consoleSurface} id="validation">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Vista previa del procesamiento</CardTitle>
            <CardDescription>
              {formatCount(totalUsersAnalyzed)} usuarios analizados —{" "}
              {new Date(validationReport.calculatedAt).toLocaleTimeString(
                "es-BO",
              )}
            </CardDescription>
          </div>
          {blocked ? (
            <Button variant="destructive">
              <AlertTriangle />
              Revisar errores
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-[var(--success)]" />
              Listo para procesar
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* KPI row */}
        <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Filas procesadas"
            note="Después de filtro + deduplicación"
            value={formatCount(audit.rowsProcessed)}
          />
          <KpiCard
            label="Usuarios elegibles"
            note="Por encima del mínimo en Bs"
            tone="success"
            value={formatCount(usersQualifyingForCashback)}
          />
          <KpiCard
            label="No elegibles"
            note="Por debajo del mínimo en Bs"
            tone="info"
            value={formatCount(usersNotQualifying)}
          />
          <KpiCard
            label="Revisión manual"
            note="Transacciones de alto valor"
            tone={audit.manualReviewTransactions > 0 ? "warning" : "success"}
            value={formatCount(audit.manualReviewTransactions)}
          />
        </div>

        {/* Audit breakdown */}
        <div className={cn("mb-5 grid gap-2 rounded-2xl border p-4 text-sm", consoleSurface)}>
          <p className={consoleMutedText}>
            <span className="font-semibold text-foreground">
              {formatCount(audit.totalRowsFromStore)}
            </span>{" "}
            filas cargadas →{" "}
            <span className="font-semibold text-foreground">
              {formatCount(audit.rowsAfterTripleFilter)}
            </span>{" "}
            después del triple filtro (Completado + Venta + BOB) →{" "}
            <span className="font-semibold text-foreground">
              {formatCount(audit.rowsProcessed)}
            </span>{" "}
            después de deduplicación (
            {formatCount(audit.duplicatesDropped)} duplicados eliminados)
          </p>
        </div>

        {/* Pipeline errors */}
        {blocked && (
          <div className="mb-5 rounded-3xl border border-[var(--blocked-red)]/30 bg-[var(--blocked-red)]/10 p-4">
            <p className="font-bold text-foreground">
              Errores del pipeline encontrados
            </p>
            <p className={cn("mt-1 text-sm", consoleMutedText)}>
              Resuelve estos errores en el archivo fuente antes de guardar el
              lote.
            </p>
            <ul className="mt-3 space-y-1">
              {errors.map((e, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <li className={cn("font-mono text-xs", consoleMutedText)} key={i}>
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings table */}
        {warnings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Advertencia</TableHead>
                <TableHead>Severidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warnings.slice(0, 20).map((w, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                <TableRow key={i}>
                  <TableCell className="font-semibold text-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className={cn("font-mono text-xs", consoleMutedText)}>
                    {w}
                  </TableCell>
                  <TableCell>
                    <Badge tone="warning">ADVERTENCIA</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {warnings.length > 20 && (
                <TableRow>
                  <TableCell
                    className={cn("text-center text-xs", consoleMutedText)}
                    colSpan={3}
                  >
                    + {warnings.length - 20} advertencias más
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Fixture fallback (no upload yet — shows batch-level validation state) ─────

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

function FixtureValidationView({ batch }: { batch: PublicBatchDto }) {
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

// ── Public export ─────────────────────────────────────────────────────────────

export function ValidationBanner({ batch, validationReport }: Props) {
  if (validationReport) {
    return <LiveValidationView validationReport={validationReport} />;
  }

  return <FixtureValidationView batch={batch} />;
}
