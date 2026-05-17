import {
  AlertTriangle,
  Banknote,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  History,
  LayoutDashboard,
  Search,
  Upload,
} from "lucide-react";
import type { PropsWithChildren } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { ConsoleDataSource, PublicBatchDto } from "../data";
import { brandGradient, brandGradientText } from "../lib";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "#dashboard" },
  { label: "Upload report", icon: Upload, href: "#upload" },
  { label: "Validation", icon: ClipboardCheck, href: "#validation" },
  { label: "Tier rules", icon: CircleDollarSign, href: "#tiers" },
  { label: "Calculations", icon: Banknote, href: "#calculations" },
  { label: "AI anomalies", icon: AlertTriangle, href: "#anomalies" },
  { label: "Export center", icon: Download, href: "#export" },
  { label: "Audit log", icon: History, href: "#audit" },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div
        aria-hidden="true"
        className={cn(
          "grid size-10 place-items-center rounded-full font-black text-[var(--brand-bg)] text-sm shadow-[0_0_28px_rgba(255,93,48,0.34)]",
          brandGradient,
        )}
      >
        B
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-lg leading-tight text-white">
          BanexReintegra
        </p>
        <p className={cn("font-semibold text-xs", brandGradientText)}>
          Manager
        </p>
      </div>
    </div>
  );
}

function SidebarNav({ batch }: { batch: PublicBatchDto }) {
  return (
    <aside className="flex min-h-full w-full flex-col border-[var(--brand-border)] border-r bg-[var(--brand-bg)] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
      <BrandMark />
      <nav className="mt-8 grid gap-1.5" aria-label="Console navigation">
        {navItems.map((item, index) => (
          <a
            className={cn(
              "group flex h-10 items-center gap-3 rounded-full border border-transparent px-3 font-semibold text-sm text-white/58 transition-colors hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
              index === 0 &&
                "border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
            )}
            href={item.href}
            key={item.label}
          >
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full bg-white/[0.06] text-white/70",
                index === 0 && brandGradient,
              )}
            >
              <item.icon className="size-4" />
            </span>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-4 lg:mt-auto">
        <p className="font-semibold text-white/45 text-xs">Current batch</p>
        <p className="mt-2 font-bold text-2xl">{batch.period.label}</p>
        <Badge className="mt-4" tone="warning">
          {batch.status}
        </Badge>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full w-2/3 rounded-full", brandGradient)} />
        </div>
      </div>
    </aside>
  );
}

function Topbar({
  dataSource,
  error,
}: {
  dataSource: ConsoleDataSource;
  error: string | null;
}) {
  return (
    <header className="sticky top-0 z-20 border-[var(--brand-border)] border-b bg-[rgba(23,23,36,0.86)] backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="min-w-0">
          <p className="font-bold text-2xl text-white">
            BanexReintegra Console
          </p>
          <p className="text-sm text-white/48">
            Internal QR cashback workflow for USDT payouts in bolivianos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={dataSource === "api" && !error ? "success" : "warning"}>
            {dataSource === "api" && !error ? "API connected" : "Fixture mode"}
          </Badge>
          <div className="relative w-full sm:w-64">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-white/40" />
            <Input
              className="border-white/10 bg-white/[0.06] pl-9 text-white placeholder:text-white/38"
              placeholder="Search batch, user, tx"
            />
          </div>
          <Button
            className="border-white/10 bg-white/[0.06] text-white hover:bg-white/10"
            size="lg"
            variant="outline"
          >
            <Building2 />
            Acceso Empresas
          </Button>
          <Button className={cn("text-white", brandGradient)} size="lg">
            <Download />
            Descargar App
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  batch,
  dataSource,
  error,
  children,
}: PropsWithChildren<{
  batch: PublicBatchDto;
  dataSource: ConsoleDataSource;
  error: string | null;
}>) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-foreground">
      <SidebarNav batch={batch} />
      <div className="lg:pl-72">
        <Topbar dataSource={dataSource} error={error} />
        <main className="grid gap-7 p-5 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
