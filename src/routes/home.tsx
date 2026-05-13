import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, Calendar, CheckCircle2, ChevronRight, Circle, Dumbbell, Flame, LogOut, Sparkles, Target, TrendingUp, Trophy, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { META_POR_NIVEL, useElevoUser } from "@/lib/elevo-store";
import { getTreinoDoDia } from "@/lib/treinos";
import { exerciciosFeitosHoje } from "@/lib/treino-progress";
import { supabase } from "@/integrations/supabase/client";
import {
  calcularInsightSemanal,
  jaMostradoEstaSemana,
  marcarInsightMostrado,
  type InsightSemanal,
} from "@/lib/analytics";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function tempoRelativo(ms: number) {
  const diff = Date.now() - ms;
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  if (dias < 7) return `${dias} dias atrás`;
  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return "1 semana atrás";
  return `${semanas} semanas atrás`;
}

function HomePage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const treinoHoje = useMemo(() => getTreinoDoDia(user), [user]);

  const nome = user.nome ?? "Atleta";
  const initial = nome.charAt(0).toUpperCase();

  // Plano: ciclo de 12 semanas baseado em diasJornada
  const diasJornada = user.diasJornada ?? 1;
  const semanaAtual = Math.min(12, Math.max(1, Math.ceil(diasJornada / 7)));
  const totalSemanas = 12;
  const progressoGeral = Math.round((semanaAtual / totalSemanas) * 100);

  // Treinos da semana
  const freq = user.frequencia ?? Math.max(1, Math.round(META_POR_NIVEL[user.nivel ?? "iniciante"] / 2));
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const treinosDaSemana = (user.historicoTreinos ?? []).filter((t) => t.data >= seteDiasAtras).length;
  const metaSemana = freq;
  const pctSemana = Math.min(100, Math.round((treinosDaSemana / metaSemana) * 100));

  // Próximo treino — agendado para amanhã 07:00
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(7, 0, 0, 0);
  const diaSemana = DIAS_SEMANA[amanha.getDay()];

  // Histórico recente (últimos 5)
  const historico = [...(user.historicoTreinos ?? [])].sort((a, b) => b.data - a.data).slice(0, 5);

  // Card "Como você tá" — só segunda-feira, e se ainda não foi mostrado nessa semana.
  const [insight, setInsight] = useState<InsightSemanal | null>(null);
  const [insightDismissed, setInsightDismissed] = useState(false);
  useEffect(() => {
    const ehSegunda = new Date().getDay() === 1;
    if (!ehSegunda) return;
    let cancelado = false;
    (async () => {
      const ja = await jaMostradoEstaSemana();
      if (ja || cancelado) return;
      const i = calcularInsightSemanal(user);
      if (!i || cancelado) return;
      setInsight(i);
      void marcarInsightMostrado();
    })();
    return () => {
      cancelado = true;
    };
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link to="/perfil" className="flex items-center gap-3 min-w-0">
          <div
            className="size-11 rounded-full flex items-center justify-center font-bold text-base shrink-0"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {saudacao()},
            </div>
            <div className="text-sm font-semibold truncate">{nome} 💪</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="size-10 rounded-full flex items-center justify-center elevo-card"
            aria-label="Notificações"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="size-10 rounded-full flex items-center justify-center elevo-card"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Card "Como você tá" — segunda-feira com insight real */}
      {insight && !insightDismissed && (
        <button
          onClick={() => navigate({ to: "/treino" })}
          className="w-full text-left rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 22%, var(--card)) 0%, var(--card) 80%)",
            border: "1px solid color-mix(in oklab, var(--secondary) 35%, var(--border))",
          }}
        >
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setInsightDismissed(true);
            }}
            className="absolute top-2 right-2 size-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in oklab, var(--card) 80%, transparent)" }}
            aria-label="Fechar"
          >
            <X size={14} />
          </span>
          <div className="flex items-start gap-3 pr-8">
            <div
              className="size-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)" }}
            >
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--secondary)" }}>
                <Sparkles size={11} /> Como você tá
              </div>
              <div className="font-bold text-sm mt-0.5">{insight.titulo}</div>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {insight.descricao}
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Cards de resumo */}
      <section className="grid grid-cols-3 gap-3 mb-4">
        <div className="elevo-card p-3">
          <div
            className="size-8 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <Calendar size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Semana
          </div>
          <div className="text-base font-bold leading-tight">
            {semanaAtual}<span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>/{totalSemanas}</span>
          </div>
        </div>

        <div className="elevo-card p-3">
          <div
            className="size-8 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 20%, transparent)" }}
          >
            <Target size={16} style={{ color: "var(--secondary)" }} />
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Esta semana
          </div>
          <div className="text-base font-bold leading-tight">
            {treinosDaSemana}<span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>/{metaSemana}</span>
          </div>
        </div>

        <div className="elevo-card p-3">
          <div
            className="size-8 rounded-lg flex items-center justify-center mb-2"
            style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <TrendingUp size={16} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Progresso
          </div>
          <div className="text-base font-bold leading-tight">
            {progressoGeral}<span className="text-xs font-normal" style={{ color: "var(--muted-foreground)" }}>%</span>
          </div>
        </div>
      </section>

      {/* Barra de progresso semanal */}
      <section className="elevo-card p-4 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: "var(--muted-foreground)" }}>Meta semanal</span>
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            {pctSemana}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pctSemana}%` }} />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--subtle)" }}>
          {treinosDaSemana >= metaSemana
            ? "Meta da semana batida! Continue assim 🏆"
            : `Faltam ${metaSemana - treinosDaSemana} treinos para fechar a semana 🎯`}
        </p>
      </section>

      {/* Treino de hoje — grid de exercícios clicáveis */}
      <TreinoHojeGrid />


      {/* Streak */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="elevo-card p-4">
          <Flame size={20} style={{ color: "var(--warning)" }} />
          <div className="mt-2 font-bold text-lg">{user.streak ?? 0} dias</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            sequência ativa
          </div>
        </div>
        <div className="elevo-card p-4">
          <Trophy size={20} style={{ color: "var(--secondary)" }} />
          <div className="mt-2 font-bold text-lg">{user.treinosFeitos ?? 0}</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            treinos no total
          </div>
        </div>
      </div>

      {/* Histórico recente */}
      <section className="mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Histórico recente</h3>
          <Link to="/evolucao" className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
            Ver tudo
          </Link>
        </div>

        {historico.length === 0 ? (
          <div className="elevo-card p-6 text-center">
            <Dumbbell size={28} className="mx-auto mb-2" style={{ color: "var(--subtle)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhum treino registrado ainda
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--subtle)" }}>
              Comece seu primeiro treino para ver seu progresso aqui
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {historico.map((t) => (
              <li key={t.id} className="elevo-card p-3 flex items-center gap-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
                >
                  <CheckCircle2 size={18} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.nome}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {tempoRelativo(t.data)} · {t.duracaoMin} min · {t.exercicios} exercícios
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: "var(--subtle)" }} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
