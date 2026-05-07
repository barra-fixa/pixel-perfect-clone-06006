import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, X, Trophy, Calendar, RefreshCw, Home, History, ChevronRight } from "lucide-react";
import { getCargo, CARGOS } from "@/lib/taf-data";
import { useElevoUser } from "@/lib/elevo-store";

type Search = { i?: number };

export const Route = createFileRoute("/taf/resultado")({
  component: ResultadoPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    i: typeof s.i === "number" ? s.i : s.i ? Number(s.i) : undefined,
  }),
});

function ResultadoPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const { i } = Route.useSearch();
  const historico = user.tafHistorico ?? [];
  const idx = typeof i === "number" && i >= 0 && i < historico.length ? i : historico.length - 1;
  const ultimo = historico[idx];
  const cargo = getCargo(ultimo?.cargoId);


  if (!ultimo || !cargo) {
    return (
      <div className="elevo-shell px-5 pt-10 min-h-dvh">
        <p>Nenhum simulado encontrado.</p>
        <button className="btn-primary mt-4" onClick={() => navigate({ to: "/taf" })}>
          Voltar ao TAF
        </button>
      </div>
    );
  }

  const detalhes = cargo.provas.map((p) => {
    const v = ultimo.resultados[p.id] ?? 0;
    const meta = p.meta[ultimo.sexo];
    const ok = v >= meta;
    const pct = meta > 0 ? Math.min(100, (v / meta) * 100) : 0;
    return { p, v, meta, ok, pct };
  });

  const aprovadas = detalhes.filter((d) => d.ok).length;
  const total = detalhes.length;
  const aprovadoGeral = aprovadas === total;
  const scorePct = Math.round((aprovadas / total) * 100);

  return (
    <div className="elevo-shell px-5 pt-8 pb-10 min-h-dvh flex flex-col">
      {/* Hero */}
      <div className="text-center fade-up">
        <div className="relative inline-block mb-4">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{
              backgroundColor: aprovadoGeral ? "var(--primary)" : "var(--warning)",
            }}
          />
          <div
            className="relative size-24 rounded-full flex items-center justify-center"
            style={{
              background: aprovadoGeral
                ? "linear-gradient(135deg, var(--primary), var(--primary-glow))"
                : "linear-gradient(135deg, var(--warning), var(--secondary))",
            }}
          >
            <Trophy size={44} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl font-black">
          {aprovadoGeral ? "Aprovado!" : "Quase lá!"}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {cargo.emoji} {cargo.nome} · {ultimo.sexo === "masc" ? "Masculino" : "Feminino"}
        </p>
        <div
          className="inline-flex items-center gap-1.5 chip mt-3"
          style={{ paddingTop: 4, paddingBottom: 4 }}
        >
          <Calendar size={12} />
          {new Date(ultimo.data).toLocaleString("pt-BR")}
        </div>
      </div>

      {/* Score geral */}
      <div className="elevo-card p-4 mt-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Provas atingidas
            </div>
            <div className="text-3xl font-bold mt-0.5">
              {aprovadas}
              <span className="text-base font-normal" style={{ color: "var(--muted-foreground)" }}>
                /{total}
              </span>
            </div>
          </div>
          <div
            className="text-3xl font-black"
            style={{ color: aprovadoGeral ? "var(--primary)" : "var(--warning)" }}
          >
            {scorePct}%
          </div>
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${scorePct}%` }} />
        </div>
      </div>

      {/* Detalhes por prova */}
      <div className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">Desempenho por prova</h2>
        {detalhes.map(({ p, v, meta, ok, pct }) => (
          <div key={p.id} className="elevo-card p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.nome}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Meta: {meta} {p.unidade}
                </div>
              </div>
              <div
                className="size-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: ok
                    ? "color-mix(in oklab, var(--primary) 20%, transparent)"
                    : "color-mix(in oklab, var(--destructive) 20%, transparent)",
                  color: ok ? "var(--primary)" : "var(--destructive)",
                }}
              >
                {ok ? <Check size={16} /> : <X size={16} />}
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <div className="text-2xl font-bold tabular-nums">
                {v}
                <span className="text-xs ml-1 font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {p.unidade}
                </span>
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: ok ? "var(--primary)" : "var(--destructive)" }}
              >
                {ok ? `+${v - meta} acima da meta` : `Faltou ${meta - v} ${p.unidade}`}
              </div>
            </div>
            <div className="progress-track mt-2">
              <div
                className="progress-fill"
                style={{
                  width: `${pct}%`,
                  background: ok
                    ? "linear-gradient(90deg, var(--primary), var(--primary-glow))"
                    : "var(--warning)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Histórico */}
      {historico.length > 1 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <History size={14} style={{ color: "var(--secondary)" }} />
            Histórico de simulados
          </h2>
          <div className="space-y-2">
            {[...historico]
              .map((h, originalIdx) => ({ h, originalIdx }))
              .reverse()
              .map(({ h, originalIdx }) => {
                const c = CARGOS.find((c) => c.id === h.cargoId);
                if (!c) return null;
                const aprov = c.provas.filter(
                  (p) => (h.resultados[p.id] ?? 0) >= p.meta[h.sexo],
                ).length;
                const tot = c.provas.length;
                const okAll = aprov === tot;
                const isAtual = originalIdx === idx;
                return (
                  <button
                    key={h.data}
                    className="selectable w-full flex items-center gap-3 text-left"
                    data-active={isAtual}
                    onClick={() =>
                      navigate({ to: "/taf/resultado", search: { i: originalIdx } })
                    }
                  >
                    <span className="text-2xl">{c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {c.sigla} · {h.sexo === "masc" ? "M" : "F"}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {new Date(h.data).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-bold"
                        style={{ color: okAll ? "var(--primary)" : "var(--warning)" }}
                      >
                        {aprov}/{tot}
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--subtle)" }}>
                        {okAll ? "aprovado" : "parcial"}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--subtle)" }} />
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-2">
        <Link to="/taf/simulado" className="btn-primary">
          <RefreshCw size={18} className="mr-2" />
          Refazer simulado
        </Link>
        <Link to="/taf" className="btn-outline">
          Ver metas do cargo
        </Link>
        <Link to="/home" className="btn-ghost w-full">
          <Home size={16} className="mr-2" />
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
