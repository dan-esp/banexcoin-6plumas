"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Banknote,
  CircleSlash,
  ClipboardCheck,
  Download,
  LayoutDashboard,
  ListOrdered,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

import type { PublicBatchDto } from "../data";
import { brandGradient, consoleGlassSurface, consoleMutedText } from "../lib";

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  disabled?: boolean;
};

function SidebarNav({ batch }: { batch?: PublicBatchDto | null }) {
  const pathname = usePathname();
  const navItems: NavItem[] = batch
    ? [
        { label: "Lotes", icon: LayoutDashboard, href: "/batches" },
        { label: "Cargar lote", icon: Upload, href: "/batches/new" },
        {
          label: "Resumen",
          icon: ClipboardCheck,
          href: `/batches/${batch.id}`,
        },
        {
          label: "Cálculos",
          icon: Banknote,
          href: `/batches/${batch.id}/results`,
        },
        {
          label: "Transacciones",
          icon: ListOrdered,
          href: `/batches/${batch.id}/transactions`,
        },
        {
          label: "Centro de exportación",
          icon: Download,
          href: `/batches/${batch.id}/export`,
        },
      ]
    : [
        { label: "Lotes", icon: LayoutDashboard, href: "/batches" },
        { label: "Cargar lote", icon: Upload, href: "/batches/new" },
        { label: "Resumen", icon: ClipboardCheck, disabled: true },
        { label: "Cálculos", icon: Banknote, disabled: true },
        { label: "Transacciones", icon: ListOrdered, disabled: true },
        { label: "Centro de exportación", icon: Download, disabled: true },
      ];

  return (
    <aside className="flex min-h-full w-full flex-col border-[var(--brand-border)] border-r bg-[var(--brand-bg)] px-4 py-5 text-foreground lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
      <BrandLogo variant="console" />
      <nav aria-label="Console navigation" className="mt-8 grid gap-1.5">
        {navItems.map((item) => {
          const active =
            item.href === "/batches"
              ? pathname === "/batches"
              : item.href
                ? pathname.startsWith(item.href)
                : false;

          const itemClass = cn(
            "group flex h-10 items-center gap-3 rounded-full border border-transparent px-3 font-semibold text-sm transition-colors",
            consoleMutedText,
            !item.disabled &&
              "hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)] hover:text-foreground",
            active &&
              "border-[var(--brand-border)] bg-[var(--brand-soft)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
            item.disabled && "cursor-not-allowed opacity-50",
          );

          const iconClass = cn(
            "grid size-7 place-items-center rounded-full bg-[var(--brand-soft)] text-muted-foreground",
            active && brandGradient,
          );

          const content = (
            <>
              <span className={iconClass}>
                <item.icon className="size-4" />
              </span>
              {item.label}
            </>
          );

          if (item.href && !item.disabled) {
            return (
              <Link className={itemClass} href={item.href} key={item.label}>
                {content}
              </Link>
            );
          }

          return (
            <div className={itemClass} key={item.label}>
              {content}
            </div>
          );
        })}
      </nav>
      <div
        className={cn("mt-8 rounded-3xl p-4 lg:mt-auto", consoleGlassSurface)}
      >
        <p className={cn("font-semibold text-xs", consoleMutedText)}>
          {batch ? "Lote actual" : "Estado actual"}
        </p>
        <p className="mt-2 font-bold text-2xl">
          {batch ? batch.period.label : "Sin lotes persistidos"}
        </p>
        <Badge className="mt-4" tone={batch ? "warning" : "neutral"}>
          {batch ? batch.status : "Esperando primer lote"}
        </Badge>
        {!batch ? (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-soft)] p-3 text-sm",
              consoleMutedText,
            )}
          >
            <CircleSlash className="size-4 shrink-0" />
            Las vistas de resumen, cálculo y exportación se habilitan cuando el
            backend publique el primer lote.
          </div>
        ) : null}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              batch ? "w-2/3" : "w-1/5",
              brandGradient,
            )}
          />
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-[var(--brand-border)] border-b bg-background/88 backdrop-blur-xl">
      <div className="flex min-h-20 flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="min-w-0">
          <p className="font-bold text-2xl text-foreground">
            {brand.consoleTitle}
          </p>
          <p className={cn("text-sm", consoleMutedText)}>
            {brand.consoleDescriptor} para revisión mensual de cashback QR
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton appearance={{ elements: { avatarBox: "size-9" } }} />
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  batch,
  children,
}: PropsWithChildren<{
  batch?: PublicBatchDto | null;
}>) {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-foreground">
      <SidebarNav batch={batch} />
      <div className="lg:pl-72">
        <Topbar />
        <main className="grid gap-7 p-5 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
