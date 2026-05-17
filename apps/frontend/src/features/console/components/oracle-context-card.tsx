"use client";

import { Activity, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { PublicOracleContextDto } from "../data";
import { consoleMutedText, consoleSurface, formatOracleRate } from "../lib";
import { EmptyState } from "./states";

export function OracleContextCard({
  oracle,
}: {
  oracle: PublicOracleContextDto | null;
}) {
  if (!oracle) {
    return (
      <Card className={consoleSurface}>
        <CardContent className="p-5">
          <EmptyState
            title="Sin contexto oracle"
            description="Todavía no se pudo leer el contexto de payout oracle para este lote."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={consoleSurface}>
      <CardHeader>
        <CardTitle>Oracle de payout</CardTitle>
        <CardDescription>
          Contexto de tasa que terminará afectando el pago final en USDT.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className={`text-xs ${consoleMutedText}`}>Estado</p>
          <div className="mt-2">
            <Badge tone={oracle.status === "valid" ? "success" : "warning"}>
              {oracle.status}
            </Badge>
          </div>
        </div>
        <div>
          <p className={`text-xs ${consoleMutedText}`}>Tasa</p>
          <p className="mt-2 font-semibold text-foreground">
            {formatOracleRate(oracle.rate)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${consoleMutedText}`}>Fuente</p>
          <p className="mt-2 flex items-center gap-2 font-semibold text-foreground">
            <Activity className="size-4 text-muted-foreground" />
            {oracle.source ?? "Pendiente"}
          </p>
        </div>
        <div>
          <p className={`text-xs ${consoleMutedText}`}>Última lectura</p>
          <p className="mt-2 flex items-center gap-2 font-semibold text-foreground">
            <Clock3 className="size-4 text-muted-foreground" />
            {oracle.fetchedAt
              ? new Date(oracle.fetchedAt).toLocaleString("es-BO")
              : "Pendiente"}
          </p>
        </div>
        {oracle.reason ? (
          <div className="sm:col-span-2 xl:col-span-4">
            <p className={`text-xs ${consoleMutedText}`}>Observación</p>
            <p className="mt-2 text-sm text-foreground">{oracle.reason}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
