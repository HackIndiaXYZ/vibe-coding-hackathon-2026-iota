import { useEffect, useRef, useState } from "react";
import { Camera, X, RefreshCw } from "lucide-react";

type Props = {
  onCapture: (dataUrl: string) => void;
  busy?: boolean;
};

export function CameraCapture({ onCapture, busy }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch (e) {
        setError(
          e instanceof Error && e.name === "NotAllowedError"
            ? "Camera permission denied. Enable it in your browser settings to scan cylinders."
            : "Unable to access the camera on this device.",
        );
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    // Crop the central focus region to send a tighter image
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cropW = Math.floor(vw * 0.8);
    const cropH = Math.floor(vh * 0.45);
    const cx = Math.floor((vw - cropW) / 2);
    const cy = Math.floor((vh - cropH) / 2);
    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, cx, cy, cropW, cropH, 0, 0, cropW, cropH);
    onCapture(canvas.toDataURL("image/jpeg", 0.85));
  }

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <X className="mx-auto mb-3 h-8 w-8 text-danger" />
        <p className="text-sm text-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-black aspect-[3/4]">
      <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
      {/* Focus guide overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[45%] w-[80%]">
          <div className="absolute inset-0 rounded-lg border-2 border-primary/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
          <div className="absolute -top-7 left-0 right-0 text-center text-[11px] font-semibold uppercase tracking-widest text-primary">
            Align the metal test ring
          </div>
          {/* corner ticks */}
          <span className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-primary" />
          <span className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-primary" />
          <span className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-primary" />
          <span className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-primary" />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 flex justify-center">
        <button
          onClick={capture}
          disabled={!ready || busy}
          className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground font-semibold shadow-lg disabled:opacity-50"
        >
          {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          {busy ? "Analysing…" : "Capture"}
        </button>
      </div>
    </div>
  );
}
