import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Cylinder, Radio, ScanLine } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { loadCylinders, statusFor, quarterLabel, type Cylinder as Tank } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeCylinder — LPG Safety at Home" },
      { name: "description", content: "Scan LPG cylinder expiry codes and detect gas micro-leaks from your phone." },
      { name: "theme-color", content: "#0F1117" },
    ],
  }),
  component: Home,
});

function Home() {
  const [cylinders, setCylinders] = useState<Tank[]>([]);
  useEffect(() => {
    const refresh = () => setCylinders(loadCylinders());
    refresh();
    window.addEventListener("safecylinder:update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("safecylinder:update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const soonExpiring = cylinders.filter((c) => c.monthsRemaining > 0 && c.monthsRemaining <= 2);

  return (
    <AppShell>
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary font-semibold">SafeCylinder</p>
          <h1 className="font-display text-3xl font-bold leading-tight">Home gas safety, in seconds.</h1>
        </div>
      </header>

      {soonExpiring.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/10 p-3 text-sm text-warn">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            <strong>{soonExpiring.length}</strong> cylinder{soonExpiring.length > 1 ? "s" : ""} expiring within 60 days. Plan a replacement.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-7">
        <Link
          to="/scan"
          className="group rounded-2xl bg-primary p-4 text-primary-foreground shadow-lg active:scale-[0.98] transition"
        >
          <ScanLine className="h-7 w-7" />
          <div className="mt-6 font-display text-lg font-bold leading-tight">Scan New Cylinder</div>
          <p className="text-[11px] mt-1 opacity-80">Read the expiry ring</p>
        </Link>
        <Link
          to="/leak-test"
          className="group rounded-2xl border border-border bg-surface-2 p-4 active:scale-[0.98] transition"
        >
          <Radio className="h-7 w-7 text-primary" />
          <div className="mt-6 font-display text-lg font-bold leading-tight">Run Leak Test</div>
          <p className="text-[11px] mt-1 text-muted-foreground">3-second audio scan</p>
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">Your cylinders</h2>
          {cylinders.length > 0 && (
            <Link to="/history" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          )}
        </div>

        {cylinders.length === 0 ? (
          <EmptyCylinders />
        ) : (
          <ul className="space-y-2.5">
            {cylinders.slice(0, 4).map((c) => (
              <CylinderRow key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function CylinderRow({ c }: { c: Tank }) {
  const s = statusFor(c.monthsRemaining);
  const stripe = s === "safe" ? "status-stripe-safe" : s === "warn" ? "status-stripe-warn" : "status-stripe-danger";
  return (
    <li className={`rounded-xl bg-card p-4 ${stripe} flex items-center gap-3`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-primary">
        <Cylinder className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold truncate">{c.nickname}</p>
          <StatusBadge status={s} label={s === "danger" ? "Expired" : s === "warn" ? `${c.monthsRemaining}mo left` : "Safe"} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Code <span className="font-mono text-foreground">{c.expiryCode}</span> · {quarterLabel(c.expiryQuarter)} {c.expiryYear}
        </p>
      </div>
    </li>
  );
}

function EmptyCylinders() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
        <Cylinder className="h-8 w-8 text-primary" />
      </div>
      <p className="font-semibold">No cylinders yet</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">Scan your first cylinder to get started.</p>
      <Link to="/scan" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
        <ScanLine className="h-4 w-4" /> Scan now
      </Link>
    </div>
  );
}
