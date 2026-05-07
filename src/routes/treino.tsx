import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TREINO_DO_DIA } from "@/lib/mock-treino";

export const Route = createFileRoute("/treino")({
  component: TreinoPage,
});

function TreinoPage() {
  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider" style={{ color: "var(--primary)" }}>
          Treino de hoje
        </p>
        <h1 className="text-2xl font-bold mt-1">{TREINO_DO_DIA.nome}</h1>
        <div className="flex gap-3 mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {TREINO_DO_DIA.duracaoMin} min
          </span>
          <span>· {TREINO_DO_DIA.exercicios.length} exercícios</span>
        </div>
      </header>

      <ul className="space-y-3">
        {TREINO_DO_DIA.exercicios.map((ex, idx) => (
          <li key={ex.id} className="elevo-card p-3 flex items-center gap-3">
            <div
              className="size-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {ex.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-snug truncate">
                {idx + 1}. {ex.nome}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {ex.series} séries × {ex.reps}
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
        <Link to="/treino/ativo" className="btn-primary">
          Começar treino
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
