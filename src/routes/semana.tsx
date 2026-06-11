import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";

export const Route = createFileRoute("/semana")({
  component: SemanaPage,
});

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function SemanaPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const hojeIdx = (new Date().getDay() + 6) % 7; // segunda=0

  return (
    <div className="elevo-shell px-5 pt-5 pb-32 min-h-dvh">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/home"
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold">Semana inteira</h1>
        <div className="size-10" />
      </div>

      <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
        Toque em qualquer exercício pra abrir — você não precisa seguir uma ordem.
      </p>

      <div className="space-y-5">
        {DIAS.map((dia, i) => {
          const treino = plano[i % plano.length];
          const ehHoje = i === hojeIdx;
          return (
            <section key={dia}>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-bold">
                  <span translate="no" className="notranslate">{dia}</span>: <span style={{ color: "var(--primary)" }}>{treino.nome}</span>
                </h2>
                {ehHoje && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    Hoje
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {treino.exercicios.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() =>
                      navigate({ to: "/exercicio-detalhe", search: { dia: i, exId: ex.id } })
                    }
                    className="elevo-card p-3 text-left flex items-center gap-2 active:scale-[0.98] transition"
                  >
                    <div
                      className="size-12 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden relative"
                      style={{ backgroundColor: "var(--card-elevated)" }}
                    >
                      {ex.imagem ? (
                        <img
                          src={ex.imagem}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <span>{ex.emoji}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold leading-tight truncate">{ex.nome}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {ex.series}×{ex.reps}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
