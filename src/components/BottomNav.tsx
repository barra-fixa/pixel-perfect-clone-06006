import { Link, useLocation } from "@tanstack/react-router";
import { Home, Dumbbell, BarChart3, UtensilsCrossed, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/treino", label: "Treino", icon: Dumbbell },
  { to: "/evolucao", label: "Evolução", icon: BarChart3 },
  { to: "/dieta", label: "Dieta", icon: UtensilsCrossed },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40">
      <div
        className="mx-3 mb-3 rounded-2xl border backdrop-blur-xl"
        style={{
          backgroundColor: "color-mix(in oklab, var(--card) 85%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <ul className="grid grid-cols-5 px-2 py-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            return (
              <li key={to}>
                <Link
                  to={to}
                  className="flex flex-col items-center gap-1 py-1.5 rounded-xl transition"
                  style={{ color: active ? "var(--primary)" : "var(--subtle)" }}
                >
                  <Icon size={22} strokeWidth={active ? 2.4 : 2} />
                  <span className="text-[10px] font-medium" style={{ opacity: active ? 1 : 0.8 }}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
