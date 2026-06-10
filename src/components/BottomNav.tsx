import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ScanLine, Radio, History } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const items = [
  { to: "/", key: "nav.home", icon: Home },
  { to: "/scan", key: "nav.scan", icon: ScanLine },
  { to: "/leak-test", key: "nav.leak", icon: Radio },
  { to: "/history", key: "nav.history", icon: History },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur safe-area-bottom">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
        {items.map(({ to, key, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide uppercase">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
