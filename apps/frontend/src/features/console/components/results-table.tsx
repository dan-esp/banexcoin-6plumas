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
import { formatBs, formatUsdt, resultTone } from "../lib";
import { EmptyState } from "./states";

export function ResultsTable({ results }: { results: PublicResultDto[] }) {
  if (results.length === 0) {
    return (
      <EmptyState
        description="Once the public API returns calculation rows, this table will render the read DTOs directly."
        title="No calculation results returned"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-white/10">
          <TableHead>User ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>QR count</TableHead>
          <TableHead>Consumed Bs</TableHead>
          <TableHead>Consumed USDT</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Cashback USDT</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow className="border-white/10" key={result.id}>
            <TableCell className="font-semibold text-white">
              {result.accountNumber}
            </TableCell>
            <TableCell>{result.alias}</TableCell>
            <TableCell>{result.totals.qrCount}</TableCell>
            <TableCell>{formatBs(result.totals.consumedBs)}</TableCell>
            <TableCell>{formatUsdt(result.totals.consumedUsdt)}</TableCell>
            <TableCell>{result.tier.name}</TableCell>
            <TableCell className="font-bold text-white">
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
