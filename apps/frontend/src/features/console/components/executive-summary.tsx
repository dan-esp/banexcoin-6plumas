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
import { formatBs, formatCount, formatUsdt } from "../lib";

export function ExecutiveSummary({ batch }: { batch: PublicBatchDto }) {
  const rows = [
    ["Month processed", batch.period.label, "Selected report period"],
    [
      "Total users",
      formatCount(batch.totals.users),
      "Users with valid Pago QR consumption",
    ],
    [
      "Total QR transactions",
      formatCount(batch.totals.transactions),
      "Completed Pago QR rows only",
    ],
    [
      "Total cashback Bs",
      formatBs(batch.totals.cashbackBs),
      "Finance liability in local currency",
    ],
    [
      "Total cashback USDT",
      formatUsdt(batch.totals.cashbackUsdt),
      "BanexTransfer payout amount",
    ],
  ];

  return (
    <Card className="border-white/10 bg-white/[0.06] text-white">
      <CardHeader>
        <CardTitle className="text-white">Executive summary</CardTitle>
        <CardDescription className="text-white/52">
          A management view that still respects operational gates and review
          state.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10">
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Operational meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(([metric, value, meaning]) => (
              <TableRow className="border-white/10" key={metric}>
                <TableCell className="font-semibold text-white">
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
