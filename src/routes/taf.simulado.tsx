import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, Minus, Check, X, ArrowRight } from "lucide-react";
import { getCargo } from "@/lib/taf-data";
import { loadUser, saveUser, useElevoUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/taf/simulado")({
  component: SimuladoPage,
});

function SimuladoPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const cargo = getCargo(user.tafCargoId);
  const sexo = user.tafSexo ?? "masc";

  const [idx, setIdx] = useState(0);
  const [resultados, setResultados] = useState<Record<string, number>>({});
  const prova = cargo?.provas[idx];

  const initial = prova?.duracaoSegundos ?? 0;
  const [restante, setRestante] = useState(initial);
  const [rodando, setRodando] = useState(false);
  const [valor, setValor] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // reset on prova change
  useEffect(() => {
    setRestante(prova?.duracaoSegundos ?? 0);
    setValor(0);
    setRodando(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [idx, prova?.duracaoSegundos]);

  // timer
  useEffect(() => {
    if (!rodando) return;
    intervalRef.current = window.setInterval(() => {
      setRestante((r) => {
        if (!prova?.duracaoSegundos) return r;
        if (r <= 1) {
          setRodando(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [rodando, prova?.duracaoSegundos]);

  if (!cargo || !prova) {
    return (
      <div className="elevo-shell px-5 pt-10 min-h-dvh">
        <p>Selecione um cargo primeiro.</p>
        <button className="btn-primary mt-4" onClick={() => navigate({ to: "/taf" })}>
          Voltar
        </button>
      </div>
    );
  }

  const meta = prova.meta[sexo];
  const ok = valor >= meta;
  const fim = idx === cargo.provas.length - 1;

  const proximaProva = () => {
    const novos = { ...resultados, [prova.id]: valor };
    setResultados(novos);
    if (fim) {
      const cur = loadUser();
      const hist = cur.tafHistorico ?? [];
      saveUser({
        tafHistorico: [
          ...hist,
          { cargoId: cargo.id, data: Date.now(), sexo, resultados: novos },
        ],
      });
      navigate({ to: "/taf" });
    } else {
      setIdx(idx + 1);
    }
  };

  const mm = String(Math.floor(restante / 60)).padStart(2, "0");
  const ss = String(restante % 60).padStart(2, "0");
  const totalProgress = prova.duracaoSegundos
    ? ((prova.duracaoSegundos - restante) / prova.duracaoSegundos) * 100
    : 0;

  return (
    <div className="elevo-shell px-5 pt-6 pb-10 min-h-dvh flex flex-col">
      {/* Header progress */}
      <div className="flex items-center justify-between text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
        <button onClick={() => navigate({ to: "/taf" })}>
          <X size={20} />
        </button>
        <span>
          Prova {idx + 1} de {cargo.provas.length}
        </span>
        <span>{cargo.sigla}</span>
      </div>
      <div className="progress-track mb-6">
        <div
          className="progress-fill"
          style={{ width: `${((idx + (ok ? 1 : 0.4)) / cargo.provas.length) * 100}%` }}
        />
      </div>

      {/* Prova */}
      <div className="text-center mb-4 fade-up">
        <div className="text-6xl mb-2">{prova.emoji}</div>
        <h1 className="text-2xl font-bold">{prova.nome}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {prova.descricao}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 chip" style={{ paddingTop: 4, paddingBottom: 4 }}>
          🎯 Meta: {meta} {prova.unidade}
        </div>
      </div>

      {/* Timer */}
      {prova.duracaoSegundos ? (
        <div className="elevo-card p-6 mb-4 text-center">
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
            Tempo restante
          </div>
          <div
            className="text-6xl font-bold tabular-nums"
            style={{
              color: restante === 0 ? "var(--destructive)" : restante < 10 ? "var(--warning)" : "var(--foreground)",
            }}
          >
            {mm}:{ss}
          </div>
          <div className="progress-track mt-4">
            <div className="progress-fill" style={{ width: `${totalProgress}%` }} />
          </div>
          <button
            className="mt-4 inline-flex items-center gap-2 chip"
            onClick={() => setRodando((r) => !r)}
            disabled={restante === 0}
          >
            {rodando ? <Pause size={16} /> : <Play size={16} />}
            {rodando ? "Pausar" : restante === initial ? "Iniciar" : "Continuar"}
          </button>
        </div>
      ) : null}

      {/* Counter */}
      <div className="elevo-card p-6 mb-4 text-center flex-1">
        <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>
          Suas {prova.unidade}
        </div>
        <div className="flex items-center justify-center gap-6">
          <button
            className="size-14 rounded-full flex items-center justify-center elevo-card-elevated"
            onClick={() => setValor((v) => Math.max(0, v - 1))}
          >
            <Minus size={24} />
          </button>
          <div
            className="text-7xl font-bold tabular-nums min-w-[120px]"
            style={{ color: ok ? "var(--primary)" : "var(--foreground)" }}
          >
            {valor}
          </div>
          <button
            className="size-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            onClick={() => setValor((v) => v + 1)}
          >
            <Plus size={24} />
          </button>
        </div>
        {prova.tipo === "distancia" && (
          <div className="mt-3 flex justify-center gap-2">
            {[100, 500, 1000].map((step) => (
              <button
                key={step}
                className="chip text-xs"
                onClick={() => setValor((v) => v + step)}
              >
                +{step}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 text-sm" style={{ color: ok ? "var(--primary)" : "var(--muted-foreground)" }}>
          {ok ? (
            <span className="inline-flex items-center gap-1 font-semibold">
              <Check size={14} /> Meta atingida
            </span>
          ) : (
            <>Faltam {meta - valor} {prova.unidade}</>
          )}
        </div>
      </div>

      <button className="btn-primary" onClick={proximaProva}>
        {fim ? "Finalizar simulado" : "Próxima prova"}
        <ArrowRight size={18} className="ml-2" />
      </button>
    </div>
  );
}
