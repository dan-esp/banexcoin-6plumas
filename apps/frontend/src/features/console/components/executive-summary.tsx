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
import { consoleSurface, formatBs, formatCount, formatUsdt } from "../lib";

export function ExecutiveSummary({ batch }: { batch: PublicBatchDto }) {
  const rows = [
    ["Mes procesado", batch.period.label, "Período seleccionado del reporte"],
    [
      "Usuarios totales",
      formatCount(batch.totals.users),
      "Usuarios con consumo válido de Pago QR",
    ],
    [
      "Total de transacciones QR",
      formatCount(batch.totals.transactions),
      "Solo filas completadas de Pago QR",
    ],
    [
      "Cashback total en Bs",
      formatBs(batch.totals.cashbackBs),
      "Pasivo financiero en moneda local",
    ],
    [
      "Cashback total en USDT",
      formatUsdt(batch.totals.cashbackUsdt),
      "Monto de pago para BanexTransfer",
    ],
  ];

  return (
    <Card className={consoleSurface}>
      <CardHeader>
        <CardTitle>Resumen ejecutivo</CardTitle>
        <CardDescription>
          Una vista gerencial que sigue respetando los controles operativos y el
          estado de revisión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Significado operativo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([metric, value, meaning]) => (
              <TableRow key={metric}>
                <TableCell className="font-semibold text-foreground">
                  {metric}
                </TableCell>
                <TableCell>{value}</TableCell>
                <TableCell>{meaning}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
