import { CheckCircle2, FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import { brandGradient } from "../lib";

const expectedColumns = [
  "Transaccion Id",
  "Numero de Cuenta",
  "Creado por",
  "Monto Pagado",
  "Monto intercambio",
  "Precio",
  "Fecha de creacion",
  "Estado",
  "Tipo de servicio",
];

export function UploadPanel({ batch }: { batch: PublicBatchDto }) {
  return (
    <section
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
      id="upload"
    >
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Upload monthly report</CardTitle>
          <CardDescription className="text-white/52">
            Manual workbook intake for Pago QR rows. The private API owns
            parsing, validation, and batch creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-52 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/16 bg-black/14 p-6 text-center">
            <FileSpreadsheet className="size-10 text-[var(--warning-orange)]" />
            <p className="mt-4 font-bold text-lg text-white">
              Drop Excel or CSV report here
            </p>
            <p className="mt-2 max-w-xl text-sm text-white/52">
              Expected source: Banexcoin Pago QR workbook for{" "}
              {batch.period.label}. Use sample data until private upload
              endpoints are ready.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className={cn("text-white", brandGradient)}>
              <Upload />
              Choose file
            </Button>
            <Button
              className="border-white/12 bg-white/[0.06] text-white hover:bg-white/10"
              variant="outline"
            >
              <FileSpreadsheet />
              Use sample data
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-white/[0.06] text-white">
        <CardHeader>
          <CardTitle className="text-white">Batch details</CardTitle>
          <CardDescription className="text-white/52">
            Visible context before any finance action.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {[
            ["Period month", batch.period.label],
            ["Source", "Manual Banexcoin report"],
            ["Currency asset", "USDT payout, BOB QR"],
            ["Status after upload", "Uploaded -> Validating"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-semibold text-white/45 text-xs">{label}</p>
              <div className="mt-2 rounded-2xl border border-white/10 bg-black/14 px-3 py-2 font-semibold text-sm text-white">
                {value}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-white/10 bg-white/[0.06] text-white xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">
            Pre-import column checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expectedColumns.map((check) => (
            <div className="flex items-center gap-3" key={check}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-white",
                  brandGradient,
                )}
              >
                <CheckCircle2 className="size-4" />
              </span>
              <span className="font-semibold text-sm text-white/78">
                {check}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
