export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_48%),linear-gradient(180deg,_#f8fbff_0%,_#eef3fb_100%)] px-6">
      <div className="rounded-[28px] border border-white/70 bg-white/85 px-8 py-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="text-sm font-semibold text-slate-900">Loading TaskFlow AI</p>
        <p className="mt-1 text-sm text-slate-500">Preparing your workspace…</p>
      </div>
    </div>
  );
}
