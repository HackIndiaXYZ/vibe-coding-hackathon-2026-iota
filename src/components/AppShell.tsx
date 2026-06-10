import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function AppShell({
  children,
  title,
  subtitle,
  showLanguage = true,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showLanguage?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-4 pt-6 pb-28">
        {showLanguage && (
          <div className="mb-3 flex justify-end">
            <LanguageSwitcher />
          </div>
        )}
        {title && (
          <header className="mb-5">
            <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
