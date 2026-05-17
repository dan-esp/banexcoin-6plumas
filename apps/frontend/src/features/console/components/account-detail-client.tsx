"use client";

import { useEffect, useState } from "react";

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
import { useApiClient } from "@/lib/api-client";

import type { PublicAccountDto, PublicAccountMonthDto } from "../data";
import {
  consoleMutedText,
  consolePageShell,
  consoleStatePanel,
  consoleSurface,
  formatBs,
  formatUsdt,
} from "../lib";
import { AppShell } from "./app-shell";
import { EmptyState, ErrorState } from "./states";

type AccountState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      account: PublicAccountDto;
      months: PublicAccountMonthDto[];
    };

type PublicItemResponse<T> = { data: T };
type AccountMonthsResponse = { data: PublicAccountMonthDto[] };

export function AccountDetailClient({
  accountNumber,
}: {
  accountNumber: number;
}) {
  const apiFetch = useApiClient();
  const [state, setState] = useState<AccountState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      setState({ status: "loading" });

      try {
        const [accountResponse, monthsResponse] = await Promise.all([
          apiFetch(`/v1/accounts/${accountNumber}`),
          apiFetch(`/v1/accounts/${accountNumber}/months`),
        ]);

        if (!accountResponse.ok) {
          throw new Error(
            `Account request failed with ${accountResponse.status}`,
          );
        }

        if (!monthsResponse.ok) {
          throw new Error(
            `Account months request failed with ${monthsResponse.status}`,
          );
        }

        const account =
          (await accountResponse.json()) as PublicItemResponse<PublicAccountDto>;
        const months = (await monthsResponse.json()) as AccountMonthsResponse;

        if (cancelled) {
          return;
        }

        setState({
          status: "ready",
          account: account.data,
          months: months.data,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Account unavailable",
        });
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, [accountNumber, apiFetch]);

  if (state.status === "loading") {
    return (
      <main className={consolePageShell}>
        <p className="font-bold">Cargando cuenta</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className={consolePageShell}>
        <div className={`${consoleStatePanel} max-w-3xl p-6`}>
          <ErrorState message={state.message} />
        </div>
      </main>
    );
  }

  return (
    <AppShell>
      <Card className={consoleSurface}>
        <CardHeader>
          <CardTitle>Cuenta {state.account.accountNumber}</CardTitle>
          <CardDescription>
            Historial de agregados mensuales de cashback para{" "}
            {state.account.alias}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className={`text-xs ${consoleMutedText}`}>Alias</p>
              <p className="mt-1 font-semibold text-foreground">
                {state.account.alias}
              </p>
            </div>
            <div>
              <p className={`text-xs ${consoleMutedText}`}>Creada</p>
              <p className="mt-1 font-semibold text-foreground">
                {new Date(state.account.createdAt).toLocaleDateString("es-BO")}
              </p>
            </div>
            <div>
              <p className={`text-xs ${consoleMutedText}`}>Actualizada</p>
              <p className="mt-1 font-semibold text-foreground">
                {new Date(state.account.updatedAt).toLocaleDateString("es-BO")}
              </p>
            </div>
          </div>

          {state.months.length === 0 ? (
            <EmptyState
              title="Sin meses agregados"
              description="La cuenta existe, pero todavía no tiene agregados mensuales publicados en la API pública."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>QR</TableHead>
                  <TableHead>Consumo Bs</TableHead>
                  <TableHead>Consumo USDT</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Cashback USDT</TableHead>
                  <TableHead>Revisión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.months.map((month) => (
                  <TableRow key={month.id}>
                    <TableCell className="font-semibold text-foreground">
                      {month.period.label}
                    </TableCell>
                    <TableCell>{month.qrCount}</TableCell>
                    <TableCell>{formatBs(month.consumedBs)}</TableCell>
                    <TableCell>{formatUsdt(month.consumedUsdt)}</TableCell>
                    <TableCell>{month.tier}</TableCell>
                    <TableCell>{formatUsdt(month.cashbackUsdt)}</TableCell>
                    <TableCell className={consoleMutedText}>
                      {month.reviewState}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
