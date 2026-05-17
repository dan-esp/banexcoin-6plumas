"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--brand-bg)] p-6 text-white">
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <AlertTriangle className="size-8 text-[var(--warning-orange)]" />
        <h1 className="mt-4 font-bold text-2xl">Console failed to render</h1>
        <p className="mt-2 text-sm text-white/55">
          {error.message || "Unexpected frontend error."}
        </p>
        <Button className="mt-5" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
