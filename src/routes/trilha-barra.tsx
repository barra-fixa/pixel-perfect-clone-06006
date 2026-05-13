// Página visual da jornada do usuário na barra fixa.
// Lê o histórico LOCAL (treino-progress) dos exercícios de barra
// e marca o nível atual baseado no máximo de reps já alcançado.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChevronLeft, Lock, CheckCircle2, Zap } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { loadHistorico } from "@/lib/treino-progress";

export const Route = createFileRoute("/trilha-barra")({
  component: TrilhaBarraPage,
});

type NivelBarra = {
  numero: number;
  nome: string;
  descricao: string;
  exercicios: string[];
  // IDs do banco que contam pra esse nível (precisamos cruzar com treino-progress)
  exercicioIds: string[];
  minimoReps: number;
  maximoReps: number;
  icon: string;
};

const NIVEIS: NivelBarra[] = [
  {
    numero: 1,
    nome: "Fundação",
    descricao: "Construindo força inicial: negativas, australiana, suportes.",
    exercicios: ["Remada australiana", "Negativa na barra", "Suporte morto"],
    exercicioIds: ["remadaAustraliana"],
    minimoReps: 1,
    maximoReps: 3,
    icon: "💪",
  },
  {
    numero: 2,
    nome: "Clássico",
    descricao: "Pull-ups limpos: barra fixa pronada e supinada.",
    exercicios: ["Barra fixa", "Barra supinada (chin-up)"],
    exercicioIds: ["barraFixa", "barraFixaSupinada"],
    minimoReps: 4,
    maximoReps: 8,
    icon: "🔥",
  },
  {
    numero: 3,
    nome: "Avançado",
    descricao: "Pull-ups com carga, L-sit, archer.",
    exercicios: ["Barra + peso", "L-sit pull-up", "Archer pull-up"],
    exercicioIds: ["barraFixa", "barraFixaSupinada"],
    minimoReps: 9,
    maximoReps: 999,
    icon: "⚡",
  },
];

function TrilhaBarraPage() {
  const navigate = useNavigate();

  // Calcula max reps em qualquer exercício de barra a partir do histórico local.
  const { maxReps, totalSessoes } = useMemo(() => {
    const hist = loadHistorico();
    let max = 0;
    let total = 0;
    const idsBarra = new Set([
      "barraFixa",
      "barraFixaSupinada",
      "remadaAustraliana",
    ]);
    for (const [exId, sessoes] of Object.entries(hist)) {
      if (!idsBarra.has(exId)) continue;
      total += sessoes.length;
      for (const s of sessoes) {
        for (const set of s.series) {
          if (set.reps > max) max = set.reps;
        }
      }
    }
    return { maxReps: max, totalSessoes: total };
  }, []);

  const nivelAtual = useMemo(() => {
    let n = 1;
    for (const niv of NIVEIS) {
      if (maxReps >= niv.minimoReps) n = niv.numero;
    }
    return n;
  }, [maxReps]);

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/perfil" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Trilha da Barra</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Sua jornada na barra fixa
          </p>
        </div>
      </header>

      {/* Status atual */}
      <section
        className="rounded-2xl p-5 mb-5 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 30%, var(--card)) 0%, var(--card) 70%)",
          border: "1px solid color-mix(in oklab, var(--secondary) 35%, var(--border))",
        }}
      >
        <div className="text-xs uppercase tracking-wider" style={{ color: "var(--secondary)" }}>
          Você está no
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold">Nível {nivelAtual}</span>
          <span className="text-xl">{NIVEIS[nivelAtual - 1].icon}</span>
        </div>
        <div className="text-sm font-semibold mt-1">{NIVEIS[nivelAtual - 1].nome}</div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span>🏋️ {maxReps} reps máx</span>
          <span>📅 {totalSessoes} sessões</span>
        </div>
      </section>

      {/* Trilha visual */}
      <section className="space-y-3 mb-6">
        {NIVEIS.map((niv) => {
          const concluido = nivelAtual > niv.numero;
          const atual = nivelAtual === niv.numero;
          const bloqueado = nivelAtual < niv.numero;
          return (
            <div
              key={niv.numero}
              className="elevo-card p-4 relative"
              style={{
                opacity: bloqueado ? 0.6 : 1,
                borderColor: atual
                  ? "color-mix(in oklab, var(--secondary) 50%, var(--border))"
                  : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="size-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{
                    backgroundColor: concluido
                      ? "color-mix(in oklab, var(--primary) 20%, transparent)"
                      : atual
                        ? "color-mix(in oklab, var(--secondary) 25%, transparent)"
                        : "color-mix(in oklab, var(--subtle) 12%, transparent)",
                  }}
                >
                  {concluido ? (
                    <CheckCircle2 size={22} style={{ color: "var(--primary)" }} />
                  ) : bloqueado ? (
                    <Lock size={20} style={{ color: "var(--subtle)" }} />
                  ) : (
                    <Zap size={22} style={{ color: "var(--secondary)" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted-foreground)" }}>
                      Nível {niv.numero}
                    </span>
                    {atual && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)",
                          color: "var(--secondary)",
                        }}
                      >
                        Você está aqui
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-base mt-0.5">
                    {niv.icon} {niv.nome}
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    {niv.descricao}
                  </p>
                  <div className="text-[11px] mt-2" style={{ color: "var(--subtle)" }}>
                    {niv.maximoReps === 999
                      ? `${niv.minimoReps}+ reps`
                      : `${niv.minimoReps}-${niv.maximoReps} reps`}{" "}
                    · {niv.exercicios.join(" · ")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <Link to="/treino/ativo" className="btn-primary block text-center">
        Começar um treino
      </Link>

      <BottomNav />
    </div>
  );
}
