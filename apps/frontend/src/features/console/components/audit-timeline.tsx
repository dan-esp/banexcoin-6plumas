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

import type { PublicBatchDto } from "../data";
import {
  consoleMutedText,
  consoleSurface,
  formatCount,
  formatUsdt,
} from "../lib";

export function AuditTimeline({ batch }: { batch: PublicBatchDto }) {
  const events = [
    [
      "08:20",
      "Carga aceptada",
      "Workbook de Pago QR registrado para procesamiento manual.",
    ],
    [
      "08:34",
      "Validación bloqueada",
      `${batch.validation.blockedRows} filas requieren revisión operativa.`,
    ],
    [
      "09:15",
      "Oráculo consultado",
      `${batch.payoutOracle.source ?? "Oráculo"} devolvió ${
        batch.payoutOracle.rate ?? "pendiente"
      } BOB/USDT.`,
    ],
    [
      "09:42",
      "Cálculo revisado",
      "Pasivo de pago en USDT preparado para revisión de finanzas.",
    ],
    [
      "Pendiente",
      "Aprobación de finanzas",
      "Requerida antes de generar la exportación para BanexTransfer.",
    ],
  ] as const;

  const history = [
    [
      batch.period.label,
      batch.status,
      batch.totals.users,
      batch.totals.cashbackUsdt,
    ],
    ["2026-04", "Exportado", 745, 1490.22],
    ["2026-03", "Exportado", 702, 1328.94],
    ["2026-02", "Aprobado", 688, 1210.77],
  ] as const;

  return (
    <section
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      id="audit"
    >
      <Card className={consoleSurface}>
        <CardHeader>
          <CardTitle>Historial de lotes</CardTitle>
          <CardDescription>
            Los lotes mensuales anteriores siguen disponibles para consulta
            operativa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Cashback USDT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(([month, status, users, usdt]) => (
                <TableRow key={String(month)}>
                  <TableCell className="font-semibold text-foreground">
                    {month}
                  </TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>{formatCount(Number(users))}</TableCell>
                  <TableCell>{formatUsdt(Number(usdt))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card className={consoleSurface}>
        <CardHeader>
          <CardTitle>Traza de auditoría</CardTitle>
          <CardDescription>
            Cada acción financiera deja una traza revisable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {events.map(([time, event, description], index) => (
            <div className="grid grid-cols-[24px_1fr] gap-3" key={event}>
              <div className="flex flex-col items-center">
                <span className="size-4 rounded-full bg-[var(--warning-orange)]" />
                {index < events.length - 1 ? (
                  <span className="mt-2 h-full w-px bg-border" />
                ) : null}
              </div>
              <div>
                <p className={`font-semibold text-xs ${consoleMutedText}`}>
                  {time}
                </p>
                <p className="mt-1 font-bold text-foreground">{event}</p>
                <p className={`mt-1 text-sm ${consoleMutedText}`}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
