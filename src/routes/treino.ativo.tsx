import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { saveUser, useElevoUser, addTreinoHistorico } from "@/lib/elevo-store";
import { TREINO_DO_DIA } from "@/lib/mock-treino";

export const Route = createFileRoute("/treino/ativo")({
  component: TreinoAtivoPage,
});

function TreinoAtivoPage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const [exIdx, setExIdx] = useState(0);
  const [serie, setSerie] = useState(1);
  const [reps, setReps] = useState(0);
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);

  const ex = TREINO_DO_DIA.exercicios[exIdx];

  useEffect(() => {
    if (!resting) return;
    if (restLeft <= 0) {
      setResting(false);
      setReps(0);
      return;
    }
    const t = setTimeout(() => setRestLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resting, restLeft]);

  const concluirSerie = () => {
    if (serie < ex.series) {
      setSerie((s) => s + 1);
      setRestLeft(ex.descansoSeg);
      setResting(true);
    } else {
      // próximo exercício
      if (exIdx < TREINO_DO_DIA.exercicios.length - 1) {
        setExIdx((i) => i + 1);
        setSerie(1);
        setReps(0);
      } else {
        // concluir treino
        saveUser({
          treinosFeitos: (user.treinosFeitos ?? 0) + 1,
          streak: (user.streak ?? 0) + 1,
          diasJornada: (user.diasJornada ?? 1) + 1,
        });
        void addTreinoHistorico({
          id: crypto.randomUUID(),
          nome: TREINO_DO_DIA.nome,
          data: Date.now(),
          duracaoMin: TREINO_DO_DIA.duracaoMin ?? 30,
          exercicios: TREINO_DO_DIA.exercicios.length,
        });
        navigate({ to: "/treino/concluido" });
      }
    }
  };

  return (
    <div className="elevo-shell flex flex-col px-5 pt-5 pb-6 min-h-dvh">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate({ to: "/treino" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Exercício {exIdx + 1}/{TREINO_DO_DIA.exercicios.length}
        </div>
        <div className="size-10" />
      </div>

      <div className="progress-track mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((exIdx + serie / ex.series) / TREINO_DO_DIA.exercicios.length) * 100}%` }}
        />
      </div>

      {/* GIF placeholder */}
      <div
        className="aspect-square rounded-3xl flex items-center justify-center mb-5"
        style={{
          background:
            "linear-gradient(135deg, var(--card-elevated), color-mix(in oklab, var(--primary) 12%, var(--card)))",
        }}
      >
        <span className="text-[120px]">{ex.emoji}</span>
      </div>

      <h1 className="text-xl font-bold leading-tight">{ex.nome}</h1>
      <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        Série {serie} de {ex.series} · {ex.reps} repetições
      </div>

      {/* contador ou descanso */}
      <div className="flex-1 flex items-center justify-center my-6">
        {resting ? (
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--secondary)" }}>
              Descanso
            </div>
            <div className="text-7xl font-black tabular-nums mt-2" style={{ color: "var(--secondary)" }}>
              {restLeft}s
            </div>
            <div className="flex gap-2 justify-center mt-5">
              <button
                className="chip"
                onClick={() => setRestLeft((s) => s + 30)}
              >
                +30s
              </button>
              <button
                className="chip"
                data-active="true"
                onClick={() => {
                  setResting(false);
                  setRestLeft(0);
                  setReps(0);
                }}
              >
                Pular descanso
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button
              className="size-14 rounded-full elevo-card-elevated flex items-center justify-center active:scale-95 transition"
              onClick={() => setReps((r) => Math.max(0, r - 1))}
              aria-label="Diminuir"
            >
              <Minus size={22} />
            </button>
            <div className="text-center w-32">
              <div className="text-7xl font-black tabular-nums">{reps}</div>
              <div className="text-xs mt-1" style={{ color: "var(--subtle)" }}>
                repetições
              </div>
            </div>
            <button
              className="size-14 rounded-full flex items-center justify-center active:scale-95 transition"
              onClick={() => setReps((r) => r + 1)}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
              aria-label="Aumentar"
            >
              <Plus size={22} />
            </button>
          </div>
        )}
      </div>

      {!resting && (
        <button className="btn-primary" onClick={concluirSerie}>
          {serie < ex.series
            ? "Concluir série"
            : exIdx < TREINO_DO_DIA.exercicios.length - 1
              ? "Próximo exercício"
              : "Finalizar treino"}
        </button>
      )}
    </div>
  );
}
