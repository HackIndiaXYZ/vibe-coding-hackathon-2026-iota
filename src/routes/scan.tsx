import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { CameraCapture } from "@/components/CameraCapture";
import { StatusBadge } from "@/components/StatusBadge";
import { analyzeCylinderImage } from "@/lib/safecylinder.functions";
import { useI18n, LANG_NAMES_FOR_AI } from "@/lib/i18n";
import { addCylinder, statusFor, quarterLabel } from "@/lib/storage";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan Cylinder — SafeCylinder" },
      { name: "description", content: "Photograph the test ring on your LPG cylinder to read its expiry quarter." },
    ],
  }),
  component: ScanPage,
});

type ScanResult =
  | { code: string; quarter: number; year: number; expiry_date: string; is_expired: boolean; months_remaining: number }
  | { error: string };

function ScanPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [nickname, setNickname] = useState(t("scan.nicknamePh"));
  const [saved, setSaved] = useState(false);

  async function handleCapture(dataUrl: string) {
    setBusy(true);
    setResult(null);
    try {
      const r = (await analyzeCylinderImage({
        data: { imageDataUrl: dataUrl, language: LANG_NAMES_FOR_AI[lang] },
      })) as ScanResult;
      setResult(r);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Network error" });
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!result || "error" in result) return;
    addCylinder({
      id: crypto.randomUUID(),
      nickname: nickname.trim() || "Cylinder",
      scanDate: new Date().toISOString(),
      expiryCode: result.code,
      expiryYear: result.year,
      expiryQuarter: result.quarter,
      expiryDateLabel: result.expiry_date,
      monthsRemaining: result.months_remaining,
    });
    scheduleExpiryReminder(nickname, result.months_remaining);
    setSaved(true);
    setTimeout(() => router.navigate({ to: "/" }), 700);
  }

  function reset() {
    setResult(null);
    setSaved(false);
  }

  return (
    <AppShell title={t("scan.title")} subtitle={t("scan.subtitle")}>
      {!result && <CameraCapture onCapture={handleCapture} busy={busy} />}

      {result && "error" in result && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center status-stripe-warn">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-warn" />
          <p className="font-semibold">{t("scan.unreadable.title")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("scan.unreadable.body")}</p>
          <button onClick={reset} className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {t("scan.tryAgain")}
          </button>
        </div>
      )}

      {result && !("error" in result) && (
        <ResultCard
          result={result}
          nickname={nickname}
          setNickname={setNickname}
          onSave={save}
          onRetake={reset}
          saved={saved}
        />
      )}

      {result && (
        <button onClick={reset} className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> {t("scan.rescan")}
        </button>
      )}
    </AppShell>
  );
}

function ResultCard({
  result,
  nickname,
  setNickname,
  onSave,
  saved,
}: {
  result: { code: string; quarter: number; year: number; expiry_date: string; is_expired: boolean; months_remaining: number };
  nickname: string;
  setNickname: (s: string) => void;
  onSave: () => void;
  onRetake: () => void;
  saved: boolean;
}) {
  const { t } = useI18n();
  const s = statusFor(result.months_remaining);
  const stripe = s === "safe" ? "status-stripe-safe" : s === "warn" ? "status-stripe-warn" : "status-stripe-danger";
  const Icon = s === "safe" ? CheckCircle2 : s === "warn" ? AlertTriangle : XCircle;
  const tone = s === "safe" ? "text-safe" : s === "warn" ? "text-warn" : "text-danger";

  const message = result.is_expired
    ? t("scan.msg.expired")
    : s === "warn"
      ? t("scan.msg.warn", { n: result.months_remaining })
      : t("scan.msg.safe", { date: result.expiry_date });

  return (
    <div className={`rounded-2xl bg-card p-5 ${stripe}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("scan.expiryCode")}</p>
          <p className="font-display text-4xl font-bold mt-1">{result.code}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {quarterLabel(result.quarter)} {result.year}
          </p>
        </div>
        <StatusBadge status={s} />
      </div>

      <div className={`mt-5 flex items-start gap-3 rounded-xl bg-surface-2 p-4 ${tone}`}>
        <Icon className="h-6 w-6 shrink-0" />
        <p className="text-sm leading-snug text-foreground">{message}</p>
      </div>

      <label className="mt-5 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("scan.nickname")}</span>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t("scan.nicknamePh")}
        />
      </label>

      <button
        onClick={onSave}
        disabled={saved}
        className="mt-4 w-full rounded-xl bg-primary py-4 font-display font-bold text-primary-foreground disabled:opacity-60"
      >
        {saved ? t("scan.saved") : t("scan.save")}
      </button>
    </div>
  );
}

async function scheduleExpiryReminder(nickname: string, monthsRemaining: number) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm !== "granted") return;
    const daysUntilWarn = Math.max(0, monthsRemaining * 30 - 30);
    if (daysUntilWarn > 0 && daysUntilWarn < 24) {
      setTimeout(
        () => new Notification("LPG cylinder expiring soon", { body: `Your LPG cylinder ${nickname} expires in 30 days — time to request a replacement.` }),
        daysUntilWarn * 24 * 60 * 60 * 1000,
      );
    }
  } catch {
    // ignore
  }
}
