import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, AlertOctagon, PhoneCall, Wind, Lightbulb, Flame } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { AudioRecorder } from "@/components/AudioRecorder";
import { analyzeLeakAudio } from "@/lib/safecylinder.functions";

export const Route = createFileRoute("/leak-test")({
  head: () => ({
    meta: [
      { title: "Leak Test — SafeCylinder" },
      { name: "description", content: "Detect LPG micro-leaks using your phone's microphone in 3 seconds." },
    ],
  }),
  component: LeakTestPage,
});

type LeakResult = {
  leak_detected: boolean;
  confidence: "low" | "medium" | "high";
  frequency_notes: string;
  recommendation: string;
};

function LeakTestPage() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LeakResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete(r: { audioDataUrl: string; rms: number; peakFreqHz: number; durationSec: number }) {
    setBusy(true);
    setError(null);
    try {
      const res = (await analyzeLeakAudio({ data: r })) as LeakResult;
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Leak test" subtitle="Hold the phone near the regulator and stay quiet.">
      <AudioRecorder onComplete={handleComplete} busy={busy} />

      {error && <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-5 space-y-4">
          <ResultIndicator result={result} />
          {result.leak_detected && <EmergencySteps />}
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Acoustic notes</p>
            <p>{result.frequency_notes}</p>
            <p className="mt-2">{result.recommendation}</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function ResultIndicator({ result }: { result: LeakResult }) {
  if (result.leak_detected) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center status-stripe-danger">
        <AlertOctagon className="mx-auto h-14 w-14 text-danger" />
        <p className="mt-3 font-display text-2xl font-bold text-danger">🔴 Possible Leak</p>
        <p className="text-sm text-muted-foreground mt-1">Check immediately. Confidence: {result.confidence}.</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-card p-6 text-center status-stripe-safe">
      <CheckCircle2 className="mx-auto h-14 w-14 text-safe" />
      <p className="mt-3 font-display text-2xl font-bold text-safe">🟢 No Leak Detected</p>
      <p className="text-sm text-muted-foreground mt-1">Confidence: {result.confidence}.</p>
    </div>
  );
}

function EmergencySteps() {
  const steps = [
    { icon: Flame, text: "Turn off the cylinder knob immediately." },
    { icon: Wind, text: "Open all windows and doors for ventilation." },
    { icon: Lightbulb, text: "Do NOT switch lights or any electrical appliances on/off." },
    { icon: PhoneCall, text: "Call the LPG emergency helpline 1906." },
  ];
  return (
    <div className="rounded-2xl border border-danger/40 bg-danger/10 p-5">
      <p className="font-display text-lg font-bold text-danger mb-3">Emergency steps</p>
      <ul className="space-y-3">
        {steps.map(({ icon: Icon, text }, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger text-danger-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm text-foreground leading-snug pt-1">{text}</p>
          </li>
        ))}
      </ul>
      <a
        href="tel:1906"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-danger py-3.5 font-display font-bold text-danger-foreground"
      >
        <PhoneCall className="h-5 w-5" /> Call 1906
      </a>
    </div>
  );
}
