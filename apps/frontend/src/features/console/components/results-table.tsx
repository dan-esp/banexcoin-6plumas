import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PublicResultDto } from "../data";
import { consoleMutedText, formatBs, formatUsdt, resultTone } from "../lib";
import { EmptyState } from "./states";

export function ResultsTable({ results }: { results: PublicResultDto[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        description="Cuando la API pública devuelva filas de cálculo, esta tabla mostrará directamente los DTOs de lectura."
        title="No se devolvieron resultados de cálculo"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID usuario</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Cantidad QR</TableHead>
          <TableHead>Consumo Bs</TableHead>
          <TableHead>Consumo USDT</TableHead>
          <TableHead>Nivel</TableHead>
          <TableHead>Cashback USDT</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow key={result.id}>
            <TableCell className="font-semibold text-foreground">
              {result.accountNumber}
            </TableCell>
            <TableCell className={consoleMutedText}>{result.alias}</TableCell>
            <TableCell>{result.totals.qrCount}</TableCell>
            <TableCell>{formatBs(result.totals.consumedBs)}</TableCell>
            <TableCell>{formatUsdt(result.totals.consumedUsdt)}</TableCell>
            <TableCell>{result.tier.name}</TableCell>
            <TableCell className="font-bold text-foreground">
              {formatUsdt(result.cashback.usdt)}
            </TableCell>
            <TableCell>
              <Badge tone={resultTone(result.reviewState)}>
                {result.reviewState}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
