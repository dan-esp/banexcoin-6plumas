"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  consoleMutedText,
  consolePageShell,
  consoleStatePanel,
} from "@/features/console/lib";
import { brand } from "@/lib/brand";

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={consolePageShell}>
      <div className={`${consoleStatePanel} max-w-lg p-6`}>
        <AlertTriangle className="size-8 text-[var(--warning-orange)]" />
        <h1 className="mt-4 font-bold text-2xl">
          {brand.consoleTitle} failed to render
        </h1>
        <p className={`mt-2 text-sm ${consoleMutedText}`}>
          {error.message || "Unexpected frontend error."}
        </p>
        <Button className="mt-5" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
