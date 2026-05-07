import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, TrendingUp } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/evolucao")({
  component: EvolucaoPage,
});

const milestones = [
  { label: "0 reps", done: true },
  { label: "1ª rep", done: true },
  { label: "5 seguidas", done: false, current: true },
  { label: "10 seguidas", done: false },
  { label: "Muscle-up", done: false },
];

const badges = [
  { emoji: "🌱", label: "Primeira semana", on: true },
  { emoji: "🔥", label: "5 em sequência", on: true },
  { emoji: "🏆", label: "Meta batida", on: false },
  { emoji: "💯", label: "10 treinos", on: false },
  { emoji: "📅", label: "30 dias", on: false },
  { emoji: "💪", label: "Pull-up", on: false },
];

function EvolucaoPage() {
  const user = useElevoUser();
  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <h1 className="text-2xl font-bold">Sua evolução</h1>
      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        Cada treino é um degrau a mais.
      </p>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <Stat icon={<TrendingUp size={16} />} value={`${user.treinosFeitos ?? 0}`} label="Treinos" />
        <Stat icon={<Flame size={16} />} value={`${user.streak ?? 0}`} label="Streak" />
        <Stat icon={<Award size={16} />} value="7" label="Recorde" />
      </div>

      {/* jornada */}
      <section className="mt-7">
        <h2 className="text-sm font-semibold mb-3">Jornada na barra</h2>
        <div className="elevo-card p-4">
          <div className="relative pl-4">
            <div
              className="absolute left-1.5 top-2 bottom-2 w-px"
              style={{ backgroundColor: "var(--border)" }}
            />
            <ul className="space-y-3.5">
              {milestones.map((m) => (
                <li key={m.label} className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full -ml-[14px] ring-4 ring-[oklch(0.21_0_0)] shrink-0"
                    style={{
                      backgroundColor: m.done
                        ? "var(--primary)"
                        : m.current
                          ? "var(--secondary)"
                          : "var(--border)",
                    }}
                  />
                  <span
                    className="text-sm"
                    style={{
                      color: m.done || m.current ? "var(--foreground)" : "var(--subtle)",
                      fontWeight: m.current ? 700 : 500,
                    }}
                  >
                    {m.label}
                    {m.current && (
                      <span className="ml-2 text-xs" style={{ color: "var(--secondary)" }}>
                        você está aqui
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* gráfico de barras simples */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Treinos por semana</h2>
        <div className="elevo-card p-4">
          <div className="flex items-end gap-2 h-32">
            {[2, 3, 4, 3, 5].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-md"
                  style={{
                    height: `${(v / 5) * 100}%`,
                    background:
                      "linear-gradient(to top, var(--primary), color-mix(in oklab, var(--primary) 50%, transparent))",
                  }}
                />
                <span className="text-[10px]" style={{ color: "var(--subtle)" }}>
                  S{i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* badges */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Conquistas</h2>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.label}
              className="elevo-card p-3 flex flex-col items-center text-center"
              style={{ opacity: b.on ? 1 : 0.4 }}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span className="text-[10px] mt-1.5 font-medium leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="elevo-card p-3">
      <div style={{ color: "var(--primary)" }}>{icon}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
    </div>
  );
}
