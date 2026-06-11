import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Flame, Trophy, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BottomNav } from "@/components/BottomNav";
import { listBadges } from "@/lib/badges";
import { useElevoUser, META_POR_NIVEL } from "@/lib/elevo-store";

export const Route = createFileRoute("/evolucao")({
  component: EvolucaoPage,
});

// Marcos derivados de treinosFeitos
type Milestone = { label: string; threshold: number };
const MILESTONES: Milestone[] = [
  { label: "Começar", threshold: 0 },
  { label: "Primeiro treino", threshold: 1 },
  { label: "5 treinos", threshold: 5 },
  { label: "10 treinos", threshold: 10 },
  { label: "25 treinos", threshold: 25 },
  { label: "50 treinos", threshold: 50 },
  { label: "100 treinos", threshold: 100 },
];

const DIAS_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];

function EvolucaoPage() {
  const user = useElevoUser();
  const treinosFeitos = user.treinosFeitos ?? 0;
  const streak = user.streak ?? 0;
  const historico = user.historicoTreinos ?? [];

  // Milestone atual e próximo
  const milestoneInfo = useMemo(() => {
    let atual: Milestone = MILESTONES[0];
    let proximo: Milestone | null = null;
    for (let i = 0; i < MILESTONES.length; i++) {
      if (treinosFeitos >= MILESTONES[i].threshold) {
        atual = MILESTONES[i];
        proximo = MILESTONES[i + 1] ?? null;
      }
    }
    return { atual, proximo };
  }, [treinosFeitos]);

  // Recorde semanal — semana com mais treinos
  const recordeSemanal = useMemo(() => {
    if (historico.length === 0) return 0;
    const buckets = new Map<string, number>();
    for (const t of historico) {
      const d = new Date(t.data);
      const inicio = new Date(d);
      inicio.setHours(0, 0, 0, 0);
      inicio.setDate(d.getDate() - d.getDay());
      const key = inicio.toISOString().slice(0, 10);
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Math.max(...buckets.values());
  }, [historico]);

  // Treinos por semana (últimas 6 semanas) — pro gráfico
  const dadosSemana = useMemo(() => {
    const semanas: { semana: string; treinos: number }[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioAtual = new Date(hoje);
    inicioAtual.setDate(hoje.getDate() - hoje.getDay());

    for (let i = 5; i >= 0; i--) {
      const inicio = new Date(inicioAtual);
      inicio.setDate(inicioAtual.getDate() - i * 7);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 7);

      const count = historico.filter((t) => t.data >= inicio.getTime() && t.data < fim.getTime()).length;
      const label = i === 0 ? "Esta" : `${i}s`;
      semanas.push({ semana: label, treinos: count });
    }
    return semanas;
  }, [historico]);

  // Atividade desta semana (7 dias)
  const dadosDia = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const fim = new Date(dia);
      fim.setDate(dia.getDate() + 1);
      const count = historico.filter((t) => t.data >= dia.getTime() && t.data < fim.getTime()).length;
      return { dia: DIAS_SEMANA_CURTO[i], treinos: count, isToday: dia.getTime() === hoje.getTime() };
    });
  }, [historico]);

  // Meta semanal
  const freq = user.frequencia ?? Math.max(1, Math.round(META_POR_NIVEL[user.nivel ?? "iniciante"] / 2));
  const treinosSemanaAtual = dadosDia.reduce((s, d) => s + d.treinos, 0);
  const pctSemana = Math.min(100, Math.round((treinosSemanaAtual / freq) * 100));

  // Badges (do lib oficial)
  const badges = useMemo(() => listBadges(user), [user]);
  const desbloqueadas = badges.filter((b) => b.unlocked).length;

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <h1 className="text-2xl font-bold">Sua evolução</h1>
      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        Cada treino é um degrau a mais.
      </p>

      {/* Stats principais */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <Stat icon={<TrendingUp size={16} />} value={String(treinosFeitos)} label="Treinos" />
        <Stat icon={<Flame size={16} />} value={String(streak)} label="Streak" colorVar="--warning" />
        <Stat icon={<Award size={16} />} value={String(recordeSemanal)} label="Recorde" colorVar="--secondary" />
      </div>

      {/* Meta semanal */}
      <section className="elevo-card p-4 mt-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: "var(--muted-foreground)" }}>
            Meta da semana ({treinosSemanaAtual}/{freq})
          </span>
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            {pctSemana}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pctSemana}%` }} />
        </div>
      </section>

      {/* Atividade da semana */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Atividade desta semana</h2>
        <div className="elevo-card p-4">
          <div className="grid grid-cols-7 gap-2">
            {dadosDia.map((d, i) => {
              const intensidade = Math.min(1, d.treinos / 2);
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor:
                        d.treinos > 0
                          ? `color-mix(in oklab, var(--primary) ${30 + intensidade * 70}%, transparent)`
                          : "var(--card-elevated)",
                      color: d.treinos > 0 ? "white" : "var(--subtle)",
                      border: d.isToday ? "1px solid var(--primary)" : "1px solid transparent",
                    }}
                  >
                    {d.treinos > 0 ? d.treinos : ""}
                  </div>
                  <span
                    translate="no"
                    className="notranslate text-[10px]"
                    style={{ color: d.isToday ? "var(--primary)" : "var(--subtle)", fontWeight: d.isToday ? 700 : 500 }}
                  >
                    {d.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gráfico de barras: últimas 6 semanas */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Últimas 6 semanas</h2>
        <div className="elevo-card p-4">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosSemana} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="semana" stroke="var(--subtle)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--subtle)" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--primary) 10%, transparent)" }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Bar dataKey="treinos" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Jornada / próximo milestone */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Sua jornada</h2>
        <div className="elevo-card p-4">
          {milestoneInfo.proximo ? (
            <>
              <div className="flex items-center justify-between text-xs mb-2">
                <span style={{ color: "var(--muted-foreground)" }}>
                  De <strong style={{ color: "var(--foreground)" }}>{milestoneInfo.atual.label}</strong> até{" "}
                  <strong style={{ color: "var(--foreground)" }}>{milestoneInfo.proximo.label}</strong>
                </span>
                <span className="font-semibold" style={{ color: "var(--secondary)" }}>
                  {treinosFeitos}/{milestoneInfo.proximo.threshold}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(100, Math.round((treinosFeitos / milestoneInfo.proximo.threshold) * 100))}%`,
                    background: "linear-gradient(90deg, var(--primary), var(--secondary))",
                  }}
                />
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--subtle)" }}>
                Faltam {milestoneInfo.proximo.threshold - treinosFeitos} treinos para o próximo marco 🎯
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Trophy size={24} style={{ color: "var(--secondary)" }} />
              <div>
                <div className="text-sm font-semibold">Lenda da barra! 👑</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Você completou todos os marcos.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Conquistas */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Conquistas</h2>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {desbloqueadas}/{badges.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className="elevo-card p-3 flex flex-col items-center text-center"
              style={{ opacity: b.unlocked ? 1 : 0.4 }}
              title={b.descricao}
            >
              <span className="text-3xl">{b.emoji}</span>
              <span className="text-[10px] mt-1.5 font-medium leading-tight">{b.titulo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA quando user ainda não treinou */}
      {treinosFeitos === 0 && (
        <div className="elevo-card p-4 mt-6 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Faça seu primeiro treino e comece a desbloquear conquistas.
          </p>
          <Link to="/treino" className="btn-primary mt-3 inline-flex">
            Começar treino
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  colorVar = "--primary",
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  colorVar?: string;
}) {
  return (
    <div className="elevo-card p-3">
      <div style={{ color: `var(${colorVar})` }}>{icon}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
    </div>
  );
}
