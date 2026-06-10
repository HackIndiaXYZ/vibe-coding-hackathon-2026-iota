import { Globe } from "lucide-react";
import { LANGUAGES, useI18n, type Lang } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <label className={`relative inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground ${className}`}>
      <Globe className="h-3.5 w-3.5 text-primary" aria-hidden />
      <span className="sr-only">{t("lang.label")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="bg-transparent pr-1 font-medium focus:outline-none"
        aria-label={t("lang.label")}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-surface text-foreground">
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
