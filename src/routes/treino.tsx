import { createFileRoute, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";

export const Route = createFileRoute("/treino")({
  component: TreinoLayout,
});

// Ordinal "6a" para sexta evita que tradutores convertam "Sex" em "Sexo".
const DIAS = ["Dom", "2a", "3a", "4a", "5a", "6a", "Sáb"];

/**
 * Wrapper que decide o que renderizar:
 * - Se a URL é exatamente `/treino` -> renderiza a lista (TreinoPage).
 * - Se a URL é uma rota filha (`/treino/ativo`, `/treino/concluido`) -> renderiza só o <Outlet />.
 *
 * Sem este wrapper, o TanStack Router renderizaria TreinoPage MAIS o Outlet das filhas,
 * mas como TreinoPage não tem <Outlet />, as rotas filhas ficavam invisíveis.
 */
function TreinoLayout() {
  const filhas = useChildMatches();
  if (filhas.length > 0) {
    return <Outlet />;
  }
  return <TreinoPage />;
}

function TreinoPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const hojeIdx = new Date().getDay() % plano.length;
  const [sel, setSel] = useState(hojeIdx);
  const treino = plano[sel];

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--primary)" }}>
          Plano da semana
        </p>
        <h1 className="text-2xl font-bold mt-1">{treino.nome}</h1>
        <div className="flex gap-3 mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {treino.duracaoMin} min
          </span>
          <span>· {treino.exercicios.length} exercícios</span>
        </div>
      </header>

      {/* Seletor de dia / treino */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-5 px-5">
        {plano.map((t, i) => {
          const active = i === sel;
          return (
            <button
              key={t.id}
              onClick={() => setSel(i)}
              className="shrink-0 rounded-xl px-3 py-2 text-left min-w-[110px] transition"
              style={{
                backgroundColor: active ? "var(--primary)" : "var(--card)",
                color: active ? "var(--primary-foreground)" : "var(--foreground)",
                border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              <div translate="no" className="notranslate text-[10px] uppercase tracking-wider opacity-80">
                {DIAS[i % 7]} {i === hojeIdx && "· hoje"}
              </div>
              <div className="text-xs font-semibold mt-0.5 leading-tight">{t.nome}</div>
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {treino.exercicios.map((ex, idx) => (
          <li key={ex.id} className="elevo-card p-3 flex items-center gap-3">
            <div
              className="size-16 rounded-xl flex items-center justify-center text-3xl shrink-0 overflow-hidden relative"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {ex.imagem ? (
                <>
                  <img
                    src={ex.imagem}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center -z-10">{ex.emoji}</span>
                </>
              ) : (
                <span>{ex.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-snug truncate">
                {idx + 1}. {ex.nome}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {ex.series} séries × {ex.reps}
                {ex.pesoSugerido ? ` · ${ex.pesoSugerido}kg` : ""}
              </div>
              <div className="flex gap-2 mt-1.5">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {ex.musculo}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--card-elevated)", color: "var(--muted-foreground)" }}
                >
                  {ex.dificuldade}
                </span>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "var(--subtle)" }} />
          </li>
        ))}
      </ul>

      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5">
        <button
          className="btn-primary"
          onClick={() => navigate({ to: "/treino/ativo", search: { dia: sel } })}
        >
          Começar treino
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
