"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { PublicTransactionDto } from "../data";
import { consoleMutedText, formatBs, formatUsdt } from "../lib";
import { EmptyState } from "./states";

export function TransactionsTable({
  transactions,
}: {
  transactions: PublicTransactionDto[];
}) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No se devolvieron transacciones"
        description="Este lote todavía no tiene transacciones asociadas en el gateway público o se está usando el fallback por período."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Cuenta</TableHead>
          <TableHead>Alias</TableHead>
          <TableHead>Monto Bs</TableHead>
          <TableHead>Monto USDT</TableHead>
          <TableHead>Tipo cambio</TableHead>
          <TableHead>Validación</TableHead>
          <TableHead>Anomalía</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className={consoleMutedText}>
              {new Date(transaction.createdAt).toLocaleDateString("es-BO")}
            </TableCell>
            <TableCell className="font-semibold text-foreground">
              <Link
                className="underline decoration-[var(--brand-border)] underline-offset-4"
                href={`/accounts/${transaction.accountNumber}`}
              >
                {transaction.accountNumber}
              </Link>
            </TableCell>
            <TableCell className={consoleMutedText}>
              {transaction.alias}
            </TableCell>
            <TableCell>{formatBs(transaction.amounts.bs)}</TableCell>
            <TableCell>{formatUsdt(transaction.amounts.usdt)}</TableCell>
            <TableCell>{transaction.amounts.impliedRate.toFixed(3)}</TableCell>
            <TableCell>
              <Badge
                tone={
                  transaction.validation.status === "valid"
                    ? "success"
                    : "warning"
                }
              >
                {transaction.validation.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge tone={transaction.anomaly.flagged ? "danger" : "neutral"}>
                {transaction.anomaly.flagged ? "Marcada" : "Normal"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
