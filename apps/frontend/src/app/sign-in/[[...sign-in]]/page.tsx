import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { brand } from "@/lib/brand";

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/batches");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e5f7f0_0%,#f4f5f8_42%,#eef0f4_100%)] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top,#0d3c35_0%,#171724_36%,#12121d_100%)] dark:text-white">
      <section className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5 lg:px-10">
        <Link
          className="flex min-w-0 items-center gap-3"
          href={brand.landingUrl}
        >
          <BrandLogo variant="auth" />
        </Link>

        <ThemeToggle />
      </section>

      <section className="mx-auto grid min-h-[calc(100vh-5.5rem)] w-full max-w-7xl items-center gap-10 px-6 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-10">
        <div className="space-y-5">
          <div className="space-y-4">
            <h1 className="max-w-2xl font-bold text-4xl tracking-[-0.04em] text-slate-950 sm:text-5xl dark:text-white">
              Ingreso a {brand.consoleTitle}.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 dark:text-white/68">
              Consola interna para revisar lotes, validar resultados y preparar
              exportaciones operativas de cashback.
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/90 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <SignIn />
          </div>
        </div>
      </section>
    </main>
  );
}
