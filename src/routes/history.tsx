import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cylinder, Trash2, ScanLine } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { loadCylinders, removeCylinder, statusFor, quarterLabel, type Cylinder as Tank } from "@/lib/storage";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — SafeCylinder" },
      { name: "description", content: "All cylinders you've scanned, with expiry status." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [cylinders, setCylinders] = useState<Tank[]>([]);
  useEffect(() => {
    const refresh = () => setCylinders(loadCylinders());
    refresh();
    window.addEventListener("safecylinder:update", refresh);
    return () => window.removeEventListener("safecylinder:update", refresh);
  }, []);

  return (
    <AppShell title="History" subtitle={`${cylinders.length} cylinder${cylinders.length === 1 ? "" : "s"} tracked`}>
      {cylinders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Cylinder className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-semibold">No scans yet</p>
          <Link to="/scan" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            <ScanLine className="h-4 w-4" /> Scan a cylinder
          </Link>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {cylinders.map((c) => {
            const s = statusFor(c.monthsRemaining);
            const stripe = s === "safe" ? "status-stripe-safe" : s === "warn" ? "status-stripe-warn" : "status-stripe-danger";
            return (
              <li key={c.id} className={`rounded-xl bg-card p-4 ${stripe}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.nickname}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono text-foreground">{c.expiryCode}</span> · {quarterLabel(c.expiryQuarter)} {c.expiryYear}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Scanned {new Date(c.scanDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={s} label={s === "danger" ? "Expired" : s === "warn" ? `${c.monthsRemaining}mo` : "Safe"} />
                    <button
                      onClick={() => removeCylinder(c.id)}
                      className="text-muted-foreground hover:text-danger"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
