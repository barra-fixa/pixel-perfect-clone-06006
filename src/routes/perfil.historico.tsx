import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Calendar, Clock, Dumbbell } from "lucide-react";
import { useElevoUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/perfil/historico")({
  component: HistoricoPage,
});

// Mock fallback se não houver histórico
const MOCK = [
  { id: "m1", nome: "Costas + Bíceps", data: Date.now() - 86400000, duracaoMin: 28, exercicios: 4 },
  { id: "m2", nome: "Peito + Tríceps", data: Date.now() - 86400000 * 3, duracaoMin: 32, exercicios: 5 },
  { id: "m3", nome: "Pernas + Core", data: Date.now() - 86400000 * 5, duracaoMin: 35, exercicios: 6 },
  { id: "m4", nome: "Costas + Bíceps", data: Date.now() - 86400000 * 7, duracaoMin: 30, exercicios: 4 },
];

function HistoricoPage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const treinos = user.historicoTreinos?.length ? user.historicoTreinos : MOCK;
  const sorted = [...treinos].sort((a, b) => b.data - a.data);

  // Agrupar por mês
  const grupos = sorted.reduce<Record<string, typeof sorted>>((acc, t) => {
    const d = new Date(t.data);
    const k = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    (acc[k] ||= []).push(t);
    return acc;
  }, {});

  const totalMin = sorted.reduce((s, t) => s + t.duracaoMin, 0);

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
        <h1 className="text-xl font-bold">Histórico</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat value={String(sorted.length)} label="Treinos" />
        <Stat value={`${totalMin}`} label="Minutos" />
        <Stat value={`${Math.round(totalMin / 60)}h`} label="Total" />
      </div>

      {sorted.length === 0 ? (
        <div className="elevo-card p-6 text-center">
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Você ainda não concluiu nenhum treino.
          </p>
          <Link to="/treino" className="btn-primary mt-4 inline-flex">
            Começar treino
          </Link>
        </div>
      ) : (
        Object.entries(grupos).map(([mes, items]) => (
          <section key={mes} className="mb-6">
            <h2 className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--subtle)" }}>
              {mes}
            </h2>
            <ul className="elevo-card divide-y" style={{ borderColor: "var(--border)" }}>
              {items.map((t) => {
                const d = new Date(t.data);
                return (
                  <li key={t.id} className="p-3 flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                    <div
                      className="size-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
                    >
                      <Dumbbell size={16} style={{ color: "var(--primary)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{t.nome}</div>
                      <div className="flex gap-3 text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} />
                          {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {t.duracaoMin} min
                        </span>
                        <span>{t.exercicios} ex.</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="elevo-card p-3 text-center">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
    </div>
  );
}
