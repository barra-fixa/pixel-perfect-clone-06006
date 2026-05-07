import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Apple, Bell, Flame, Lightbulb, Play, Shield, Trophy, Users } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";
import { TREINO_DO_DIA } from "@/lib/mock-treino";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const nome = user.nome ?? "Atleta";
  const initial = nome.charAt(0).toUpperCase();
  const diasJornada = user.diasJornada ?? 1;
  const treinosFeitos = user.treinosFeitos ?? 0;
  const meta = 8;
  const restantes = Math.max(0, meta - treinosFeitos);

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      {/* header */}
      <header className="flex items-center justify-between mb-6">
        <Link to="/perfil" className="flex items-center gap-3">
          <div
            className="size-10 rounded-full flex items-center justify-center font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--primary), var(--secondary))",
            }}
          >
            {initial}
          </div>
          <div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Bom dia,
            </div>
            <div className="text-sm font-semibold">{nome} 💪</div>
          </div>
        </Link>
        <button
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </button>
      </header>

      {/* meta */}
      <section className="elevo-card p-4 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span style={{ color: "var(--muted-foreground)" }}>
            Dia {diasJornada} de 20 — {treinosFeitos} treinos
          </span>
          <span className="font-semibold" style={{ color: "var(--primary)" }}>
            {Math.round((treinosFeitos / meta) * 100)}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(treinosFeitos / meta) * 100}%` }} />
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--subtle)" }}>
          {restantes > 0
            ? `Faltam ${restantes} treinos para garantir o mês grátis 🎯`
            : "Meta batida! Próximo mês é grátis 🏆"}
        </p>
      </section>

      {/* treino do dia */}
      <section
        className="rounded-2xl p-5 mb-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 28%, var(--card)) 0%, var(--card) 70%)",
          border: "1px solid color-mix(in oklab, var(--primary) 35%, var(--border))",
        }}
      >
        <div
          className="absolute -right-10 -top-10 size-40 rounded-full opacity-30"
          style={{ background: "radial-gradient(var(--primary), transparent 70%)" }}
        />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--primary)" }}>
            Treino de hoje
          </div>
          <h2 className="text-2xl font-bold mt-1">{TREINO_DO_DIA.nome}</h2>
          <div className="flex gap-4 mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <span>⏱ {TREINO_DO_DIA.duracaoMin} min</span>
            <span>🏋️ {TREINO_DO_DIA.exercicios.length} exercícios</span>
          </div>
          <button
            className="btn-primary mt-5"
            onClick={() => navigate({ to: "/treino" })}
          >
            <Play size={18} className="mr-2" />
            Iniciar treino
          </button>
        </div>
      </section>

      {/* streak + dica */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="elevo-card p-4">
          <Flame size={20} style={{ color: "var(--warning)" }} />
          <div className="mt-2 font-bold text-lg">{user.streak ?? 0} dias</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            seguidos treinando
          </div>
        </div>
        <div className="elevo-card p-4">
          <Lightbulb size={20} style={{ color: "var(--secondary)" }} />
          <div className="mt-2 text-xs font-semibold">Dica do dia</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Beba água antes, durante e depois.
          </div>
        </div>
      </div>

      {/* atalhos */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link to="/nutricao" className="elevo-card p-4 transition active:scale-[0.98]">
          <div
            className="size-10 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <Apple size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div className="text-sm font-semibold">Nutrição</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Pré, pós e hidratação
          </div>
        </Link>
        <Link to="/comunidade" className="elevo-card p-4 transition active:scale-[0.98]">
          <div
            className="size-10 rounded-xl flex items-center justify-center mb-2"
            style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 20%, transparent)" }}
          >
            <Users size={18} style={{ color: "var(--secondary)" }} />
          </div>
          <div className="text-sm font-semibold">Comunidade</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Desafios e ranking
          </div>
        </Link>
      </div>

      <Link
        to="/taf"
        className="rounded-2xl p-4 flex items-center gap-3 mb-2 transition active:scale-[0.99] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, var(--card)) 0%, var(--card) 80%)",
          border: "1px solid color-mix(in oklab, var(--primary) 30%, var(--border))",
        }}
      >
        <div
          className="size-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--primary) 22%, transparent)" }}
        >
          <Shield size={20} style={{ color: "var(--primary)" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Preparação TAF</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Escolha seu cargo e simule a prova
          </div>
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
          Abrir
        </span>
      </Link>

      <Link
        to="/comunidade"
        className="elevo-card p-4 flex items-center gap-3 mb-2 transition active:scale-[0.99]"
      >
        <div
          className="size-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 20%, transparent)" }}
        >
          <Trophy size={20} style={{ color: "var(--secondary)" }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Desafio 30 dias na barra</div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            842 participantes · ainda dá tempo
          </div>
        </div>
        <span className="text-xs font-semibold" style={{ color: "var(--secondary)" }}>
          Ver
        </span>
      </Link>

      <BottomNav />
    </div>
  );
}
