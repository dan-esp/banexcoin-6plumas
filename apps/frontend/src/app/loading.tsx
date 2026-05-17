export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--brand-bg)] p-6 text-white">
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="mx-auto h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[linear-gradient(84deg,#ff8e0a_-20.6%,#ff5d30_27.31%,#5d3dff_81.32%,#ffffff_129.22%)]" />
        </div>
        <p className="mt-5 font-bold">Loading BanexReintegra</p>
        <p className="mt-1 text-sm text-white/50">
          Preparing QR cashback workflow data.
        </p>
      </div>
    </main>
  );
}
