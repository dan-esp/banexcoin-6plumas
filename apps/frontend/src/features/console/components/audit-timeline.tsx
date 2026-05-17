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
import { formatCount, formatUsdt } from "../lib";

export function AuditTimeline({ batch }: { batch: PublicBatchDto }) {
  const events = [
    [
      "08:20",
      "Upload accepted",
      "Pago QR workbook registered for manual processing.",
    ],
    [
      "08:34",
      "Validation blocked",
      `${batch.validation.blockedRows} rows require operator review.`,
    ],
    [
      "09:15",
      "Oracle fetched",
      `${batch.payoutOracle.source ?? "Oracle"} returned ${
        batch.payoutOracle.rate ?? "pending"
      } BOB/USDT.`,
    ],
    [
      "09:42",
      "Calculation reviewed",
      "USDT payout liability prepared for finance review.",
    ],
    [
      "Pending",
      "Finance approval",
      "Required before BanexTransfer export generation.",
    ],
  ] as const;

  const history = [
    [
      batch.period.label,
      batch.status,
      batch.totals.users,
      batch.totals.cashbackUsdt,
    ],
    ["2026-04", "Exported", 745, 1490.22],
    ["2026-03", "Exported", 702, 1328.94],
    ["2026-02", "Approved", 688, 1210.77],
  ] as const;

  return (
    <section
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      id="audit"
    >
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Batch history</CardTitle>
          <CardDescription className="text-white/52">
            Prior monthly batches remain scan-friendly for operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead>Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Cashback USDT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(([month, status, users, usdt]) => (
                <TableRow className="border-white/10" key={String(month)}>
                  <TableCell className="font-semibold text-white">
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
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Audit trail</CardTitle>
          <CardDescription className="text-white/52">
            Every finance action leaves a reviewable trail.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          {events.map(([time, event, description], index) => (
            <div className="grid grid-cols-[24px_1fr] gap-3" key={event}>
              <div className="flex flex-col items-center">
                <span className="size-4 rounded-full bg-[var(--warning-orange)]" />
                {index < events.length - 1 ? (
                  <span className="mt-2 h-full w-px bg-white/10" />
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-white/42 text-xs">{time}</p>
                <p className="mt-1 font-bold text-white">{event}</p>
                <p className="mt-1 text-sm text-white/52">{description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
