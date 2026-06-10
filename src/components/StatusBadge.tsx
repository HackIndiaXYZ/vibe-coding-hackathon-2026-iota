import { useI18n } from "@/lib/i18n";

type Status = "safe" | "warn" | "danger";

const styles: Record<Status, string> = {
  safe: "bg-safe/15 text-safe border-safe/30",
  warn: "bg-warn/15 text-warn border-warn/30",
  danger: "bg-danger/15 text-danger border-danger/40",
};

const keys: Record<Status, string> = {
  safe: "status.safe",
  warn: "status.warn",
  danger: "status.danger",
};

export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  const { t } = useI18n();
  const dot = status === "safe" ? "bg-safe" : status === "warn" ? "bg-warn" : "bg-danger";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label ?? t(keys[status])}
    </span>
  );
}
