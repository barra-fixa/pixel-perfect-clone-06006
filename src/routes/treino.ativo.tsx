import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown, Info, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { loadUser, saveUser, useElevoUser, addTreinoHistorico } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";
import { checkUnlocks, checkMetaSemanal } from "@/lib/badges";
import { startProgresso, logSerie, clearProgresso } from "@/lib/treino-progress";

const searchSchema = z.object({ dia: z.coerce.number().optional() });

export const Route = createFileRoute("/treino/ativo")({
  validateSearch: (s) => searchSchema.parse(s),
  component: TreinoAtivoPage,
});

function TreinoAtivoPage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const search = Route.useSearch();
  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const treino = plano[(search.dia ?? new Date().getDay()) % plano.length];

  const [exIdx, setExIdx] = useState(0);
  const [serie, setSerie] = useState(1);
  const [reps, setReps] = useState(0);
  const [peso, setPeso] = useState<number>(0);
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [showInstr, setShowInstr] = useState(false);

  const ex = treino.exercicios[exIdx];

  // Inicia progresso ao montar
  useEffect(() => {
    startProgresso(treino.id);
    return () => {
      // limpeza ao sair sem terminar fica a critério; mantemos para retomada
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza peso sugerido ao trocar de exercício
  useEffect(() => {
    setPeso(ex?.pesoSugerido ?? 0);
    setShowInstr(false);
  }, [exIdx, ex?.pesoSugerido]);

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
    logSerie(ex.id, { reps, peso });
    if (serie < ex.series) {
      setSerie((s) => s + 1);
      setRestLeft(ex.descansoSeg);
      setResting(true);
    } else if (exIdx < treino.exercicios.length - 1) {
      setExIdx((i) => i + 1);
      setSerie(1);
      setReps(0);
    } else {
      // concluir treino
      const prev = loadUser();
      saveUser({
        treinosFeitos: (user.treinosFeitos ?? 0) + 1,
        streak: (user.streak ?? 0) + 1,
        diasJornada: (user.diasJornada ?? 1) + 1,
      });
      void addTreinoHistorico({
        id: crypto.randomUUID(),
        nome: treino.nome,
        data: Date.now(),
        duracaoMin: treino.duracaoMin,
        exercicios: treino.exercicios.length,
      });
      const next = loadUser();
      checkUnlocks(prev, next);
      checkMetaSemanal(next);
      clearProgresso();
      navigate({ to: "/treino/concluido", search: { dur: treino.duracaoMin, ex: treino.exercicios.length } });
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
          Exercício {exIdx + 1}/{treino.exercicios.length}
        </div>
        <div className="size-10" />
      </div>

      <div className="progress-track mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((exIdx + serie / ex.series) / treino.exercicios.length) * 100}%` }}
        />
      </div>

      {/* Imagem do exercício (com fallback para emoji) */}
      <div
        className="aspect-square rounded-3xl overflow-hidden mb-5 relative"
        style={{
          background:
            "linear-gradient(135deg, var(--card-elevated), color-mix(in oklab, var(--primary) 12%, var(--card)))",
        }}
      >
        {ex.imagem ? (
          <>
            <img
              src={ex.imagem}
              alt={ex.nome}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => {
                // Se a imagem falhar, mostra o emoji
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[120px] opacity-0 pointer-events-none">
              {ex.emoji}
            </span>
          </>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[120px]">{ex.emoji}</span>
        )}
        {/* Badge com nome do músculo */}
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider"
          style={{
            backgroundColor: "color-mix(in oklab, var(--primary) 20%, var(--card))",
            color: "var(--primary)",
          }}
        >
          {ex.musculo}
        </span>
      </div>

      <h1 className="text-xl font-bold leading-tight">{ex.nome}</h1>
      <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        Série {serie} de {ex.series} · {ex.reps} repetições
      </div>

      {/* Toggle de instruções */}
      <button
        className="elevo-card p-3 mt-3 flex items-center justify-between w-full text-left"
        onClick={() => setShowInstr((v) => !v)}
        aria-expanded={showInstr}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Info size={16} style={{ color: "var(--primary)" }} />
          Como executar
        </span>
        <ChevronDown
          size={18}
          style={{
            color: "var(--muted-foreground)",
            transform: showInstr ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        />
      </button>

      {showInstr && (
        <div className="elevo-card p-4 mt-2 space-y-3">
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold mb-1.5" style={{ color: "var(--primary)" }}>
              Passo a passo
            </h3>
            <ol className="text-sm space-y-1 list-decimal pl-4" style={{ color: "var(--foreground)" }}>
              {ex.instrucoes.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
          {ex.errosComuns && ex.errosComuns.length > 0 && (
            <div>
              <h3
                className="text-xs uppercase tracking-wider font-semibold mb-1.5"
                style={{ color: "var(--warning)" }}
              >
                Erros comuns
              </h3>
              <ul className="text-sm space-y-1 list-disc pl-4" style={{ color: "var(--muted-foreground)" }}>
                {ex.errosComuns.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {ex.dicas && ex.dicas.length > 0 && (
            <div>
              <h3
                className="text-xs uppercase tracking-wider font-semibold mb-1.5"
                style={{ color: "var(--secondary)" }}
              >
                Dicas
              </h3>
              <ul className="text-sm space-y-1 list-disc pl-4" style={{ color: "var(--muted-foreground)" }}>
                {ex.dicas.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Peso */}
      {!resting && ex.pesoSugerido !== undefined && (
        <div className="flex items-center justify-between mt-4 elevo-card p-3">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Carga (kg)</span>
          <div className="flex items-center gap-3">
            <button
              className="size-8 rounded-full elevo-card-elevated flex items-center justify-center"
              onClick={() => setPeso((p) => Math.max(0, p - 1))}
              aria-label="Menos peso"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold tabular-nums w-10 text-center">{peso}</span>
            <button
              className="size-8 rounded-full elevo-card-elevated flex items-center justify-center"
              onClick={() => setPeso((p) => p + 1)}
              aria-label="Mais peso"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

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
              <button className="chip" onClick={() => setRestLeft((s) => s + 30)}>
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
            : exIdx < treino.exercicios.length - 1
              ? "Próximo exercício"
              : "Finalizar treino"}
        </button>
      )}
    </div>
  );
}
