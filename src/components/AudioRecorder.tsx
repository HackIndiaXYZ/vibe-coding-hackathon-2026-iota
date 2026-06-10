import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type Result = { audioDataUrl: string; rms: number; peakFreqHz: number; durationSec: number };

const DURATION_MS = 3000;
const BARS = 40;

export function AudioRecorder({ onComplete, busy }: { onComplete: (r: Result) => void; busy?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>(() => Array(BARS).fill(0.05));
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  async function start() {
    setError(null);
    setProgress(0);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch (e) {
      setError(
        e instanceof Error && e.name === "NotAllowedError"
          ? "Microphone permission denied. Enable it in your browser settings to run a leak test."
          : "Unable to access the microphone.",
      );
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    const timeData = new Uint8Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    let rmsSum = 0;
    let rmsCount = 0;
    const freqPeakAccum = new Float32Array(analyser.frequencyBinCount);

    // Record using MediaRecorder
    const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    setRecording(true);
    const startTime = performance.now();

    function tick() {
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      // RMS
      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeData.length);
      rmsSum += rms;
      rmsCount++;

      for (let i = 0; i < freqData.length; i++) {
        if (freqData[i] > freqPeakAccum[i]) freqPeakAccum[i] = freqData[i];
      }

      // Build bars from freq data (downsampled)
      const newBars: number[] = [];
      const step = Math.floor(freqData.length / BARS);
      for (let i = 0; i < BARS; i++) {
        let s = 0;
        for (let j = 0; j < step; j++) s += freqData[i * step + j];
        newBars.push(Math.min(1, s / step / 200));
      }
      setBars(newBars);

      const elapsed = performance.now() - startTime;
      setProgress(Math.min(1, elapsed / DURATION_MS));

      if (elapsed < DURATION_MS) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    recorder.start();
    setTimeout(() => {
      recorder.stop();
    }, DURATION_MS);

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setRecording(false);
      setBars(Array(BARS).fill(0.05));

      // Find peak frequency
      const nyquist = ctx.sampleRate / 2;
      let peakIdx = 0;
      let peakVal = 0;
      for (let i = 0; i < freqPeakAccum.length; i++) {
        if (freqPeakAccum[i] > peakVal) {
          peakVal = freqPeakAccum[i];
          peakIdx = i;
        }
      }
      const peakFreqHz = (peakIdx / freqPeakAccum.length) * nyquist;
      const avgRms = rmsCount > 0 ? rmsSum / rmsCount : 0;
      ctx.close();

      const blob = new Blob(chunks, { type: mime });
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onComplete({ audioDataUrl: dataUrl, rms: avgRms, peakFreqHz, durationSec: DURATION_MS / 1000 });
      };
      reader.readAsDataURL(blob);
    };
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="flex h-32 items-center justify-center gap-1">
        {bars.map((v, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full transition-[height,background-color] duration-75"
            style={{
              height: `${Math.max(6, v * 100)}%`,
              backgroundColor: recording ? `oklch(0.72 0.18 41 / ${0.4 + v * 0.6})` : "oklch(0.32 0.02 264)",
            }}
          />
        ))}
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
      </div>

      <button
        onClick={start}
        disabled={recording || busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-display text-base font-bold text-primary-foreground disabled:opacity-60"
      >
        {recording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        {recording ? "Listening…" : busy ? "Analysing…" : "Start Leak Test"}
      </button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Hold your phone within 5 cm of the regulator. Stay quiet for 3 seconds.
      </p>
    </div>
  );
}
