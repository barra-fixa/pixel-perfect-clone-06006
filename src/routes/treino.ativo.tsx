import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown, Info, Minus, Plus, Shuffle, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { loadUser, saveUser, useElevoUser, addTreinoHistorico } from "@/lib/elevo-store";
import { alternativasDe, getPlanoSemanal, type Exercicio } from "@/lib/treinos";
import { checkUnlocks, checkMetaSemanal } from "@/lib/badges";
import { startProgresso, logSerie, clearProgresso, marcarBateuMeta, sugerirProgresso, marcarExercicioFeito } from "@/lib/treino-progress";

const searchSchema = z.object({
  dia: z.coerce.number().optional(),
  ex: z.string().optional(),
});

export const Route = createFileRoute("/treino/ativo")({
  validateSearch: (s) => searchSchema.parse(s),
  component: TreinoAtivoPage,
});

/**
 * Extrai a meta de reps de uma string como "10", "8-10", "30s", etc.
 * Para ranges (ex: "8-10"), usa o limite SUPERIOR (mais conservador pra
 * decidir se bateu a meta — bater 8 quando a meta é 8-10 não conta como
 * "bater"; o usuário precisa fechar o range pra ganhar progressão).
 */
function parseRepsMeta(reps: string): number {
  const range = reps.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return parseInt(range[2], 10);
  const single = reps.match(/\d+/);
  if (single) return parseInt(single[0], 10);
  return 0;
}

function TreinoAtivoPage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const search = Route.useSearch();
  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const treino = plano[(search.dia ?? new Date().getDay()) % plano.length];

  // Modo single-exercise: se vier ?ex=, foca apenas naquele exercício.
  const singleMode = !!search.ex;
  const startIdx = useMemo(() => {
    if (!search.ex) return 0;
    const i = treino.exercicios.findIndex((e) => e.id === search.ex);
    return i >= 0 ? i : 0;
  }, [search.ex, treino]);

  const [exIdx, setExIdx] = useState(startIdx);
  const [exercicioConcluido, setExercicioConcluido] = useState(false);
  const [serie, setSerie] = useState(1);
  const [reps, setReps] = useState(0);
  const [peso, setPeso] = useState<number>(0);
  const [resting, setResting] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [showInstr, setShowInstr] = useState(false);

  // Map de overrides: índice do exercício no treino -> exercício substituto.
  // Usado pelo botão "🎲 Trocar exercício" pra permitir substituições locais
  // sem alterar o plano armazenado.
  const [overrides, setOverrides] = useState<Record<number, Exercicio>>({});

  // Painel de seleção de alternativas (modal/dropdown)
  const [mostrarAlternativas, setMostrarAlternativas] = useState(false);

  // Conta quantas séries do exercício atual o usuário bateu a meta
  const [seriesBatidas, setSeriesBatidas] = useState(0);

  // Exercício atual: ou o override do índice, ou o original do plano
  const ex = overrides[exIdx] ?? treino.exercicios[exIdx];

  // Alternativas pré-calculadas pro exercício atual
  const alternativas = useMemo(() => alternativasDe(ex.id as Parameters<typeof alternativasDe>[0], user), [ex.id, user]);

  // Sugestão de progressão (calculada uma vez ao trocar de exercício)
  const sugestao = useMemo(() => sugerirProgresso(ex.id, parseRepsMeta(ex.reps), ex.pesoSugerido ?? 0), [ex.id, ex.reps, ex.pesoSugerido]);

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

    // Conta se o usuário bateu a meta de reps nesta série
    const metaReps = parseRepsMeta(ex.reps);
    const bateuMetaNaSerie = reps >= metaReps;
    const novasSeriesBatidas = bateuMetaNaSerie ? seriesBatidas + 1 : seriesBatidas;
    setSeriesBatidas(novasSeriesBatidas);

    if (serie < ex.series) {
      setSerie((s) => s + 1);
      setRestLeft(ex.descansoSeg);
      setResting(true);
    } else {
      // Última série deste exercício — registra se bateu a meta em TODAS as séries
      marcarBateuMeta(ex.id, novasSeriesBatidas === ex.series);
      marcarExercicioFeito(treino.id, ex.id);

      // Modo single-exercise: para aqui e mostra tela de conclusão.
      if (singleMode) {
        setExercicioConcluido(true);
        return;
      }

      if (exIdx < treino.exercicios.length - 1) {
        setExIdx((i) => i + 1);
        setSerie(1);
        setReps(0);
        setSeriesBatidas(0); // reset pro próximo exercício
        return;
      }

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

  // Tela "Exercício concluído" — só em modo single-exercise.
  if (exercicioConcluido) {
    return (
      <div className="elevo-shell flex flex-col items-center justify-center px-5 py-8 min-h-dvh text-center">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-3xl font-black mb-2">Exercício concluído!</h1>
        <p className="text-base mb-1" style={{ color: "var(--muted-foreground)" }}>
          {ex.nome}
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--subtle)" }}>
          {ex.series} séries completas · Parabéns 💪
        </p>
        <button
          className="btn-primary"
          style={{ height: 56, fontSize: 16 }}
          onClick={() => navigate({ to: "/home" })}
        >
          ← Voltar pra lista
        </button>
      </div>
    );
  }

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

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-tight">{ex.nome}</h1>
          <div
            className="mt-2 text-2xl font-black tracking-tight uppercase"
            style={{ color: "var(--primary)" }}
          >
            Série {serie} de {ex.series}
          </div>
          <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Meta: {ex.reps} reps
          </div>
        </div>
        {/* Botão "Trocar exercício" — só aparece se há alternativas e
            não está em descanso/já começou a série atual. */}
        {alternativas.length > 0 && !resting && serie === 1 && reps === 0 && (
          <button
            onClick={() => setMostrarAlternativas(true)}
            className="elevo-card-elevated size-10 rounded-full flex items-center justify-center shrink-0"
            aria-label="Trocar exercício"
            title="Trocar exercício"
          >
            <Shuffle size={16} />
          </button>
        )}
      </div>

      {/* Sugestão de progressão — aparece se o usuário bateu a meta nas últimas 2 sessões */}
      {sugestao && !resting && serie === 1 && reps === 0 && (
        <div
          className="elevo-card p-3 mt-3 flex items-start gap-2"
          style={{
            backgroundColor: "color-mix(in oklab, var(--secondary) 12%, var(--card))",
            borderColor: "color-mix(in oklab, var(--secondary) 40%, var(--border))",
          }}
        >
          <TrendingUp size={16} className="mt-0.5 shrink-0" style={{ color: "var(--secondary)" }} />
          <div className="text-xs leading-snug">
            <div className="font-semibold" style={{ color: "var(--secondary)" }}>
              Hora de progredir!
            </div>
            <div className="mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              {sugestao.motivo}
              {sugestao.novasReps !== undefined && sugestao.novoPeso === undefined && (
                <> Meta sugerida: <strong>{sugestao.novasReps} reps</strong>.</>
              )}
              {sugestao.novoPeso !== undefined && (
                <> Meta sugerida: <strong>{sugestao.novoPeso}kg × {sugestao.novasReps ?? ex.reps} reps</strong>.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Painel modal de alternativas */}
      {mostrarAlternativas && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setMostrarAlternativas(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-5 pb-8"
            style={{ backgroundColor: "var(--card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-12 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--border)" }} />
            <h2 className="text-lg font-bold mb-1">Trocar exercício</h2>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
              Mesmo músculo ({ex.musculo.toLowerCase()}), mesmo equipamento.
            </p>
            <ul className="space-y-2">
              {alternativas.map((alt) => (
                <li key={alt.id}>
                  <button
                    onClick={() => {
                      setOverrides((prev) => ({ ...prev, [exIdx]: alt }));
                      setMostrarAlternativas(false);
                    }}
                    className="elevo-card p-3 w-full text-left flex items-center gap-3"
                  >
                    {alt.imagem ? (
                      <img
                        src={alt.imagem}
                        alt={alt.nome}
                        className="size-12 rounded-lg object-cover shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-12 rounded-lg flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: "var(--card-elevated)" }}>
                        {alt.emoji}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{alt.nome}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {alt.series} × {alt.reps}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setMostrarAlternativas(false)}
              className="btn-outline mt-4 w-full"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
