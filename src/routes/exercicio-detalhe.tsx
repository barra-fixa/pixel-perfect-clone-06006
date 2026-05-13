import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";
import { useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";
import { exerciciosFeitosHoje } from "@/lib/treino-progress";

const search = z.object({
  dia: z.coerce.number().optional(),
  exId: z.string(),
});

export const Route = createFileRoute("/exercicio-detalhe")({
  validateSearch: (s) => search.parse(s),
  component: ExercicioDetalhePage,
});

function ExercicioDetalhePage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const { dia, exId } = Route.useSearch();
  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const diaIdx = (dia ?? new Date().getDay()) % plano.length;
  const treino = plano[diaIdx];
  const ex = treino.exercicios.find((e) => e.id === exId) ?? treino.exercicios[0];

  const feito = exerciciosFeitosHoje(treino.id).includes(ex.id);

  return (
    <div className="elevo-shell px-5 pt-5 pb-32 min-h-dvh">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {treino.nome}
        </div>
        <div className="size-10" />
      </div>

      {/* Imagem */}
      <div
        className="aspect-square rounded-3xl overflow-hidden mb-5 relative"
        style={{
          background:
            "linear-gradient(135deg, var(--card-elevated), color-mix(in oklab, var(--primary) 12%, var(--card)))",
        }}
      >
        {ex.imagem ? (
          <img
            src={ex.imagem}
            alt={ex.nome}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[120px]">{ex.emoji}</span>
        )}
        <span
          className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: "color-mix(in oklab, var(--primary) 20%, var(--card))", color: "var(--primary)" }}
        >
          {ex.musculo}
        </span>
        {feito && (
          <span
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <CheckCircle2 size={12} /> Feito hoje
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold leading-tight">{ex.nome}</h1>
      <div className="text-base mt-1" style={{ color: "var(--muted-foreground)" }}>
        {ex.series} séries × {ex.reps} repetições
        {ex.pesoSugerido ? ` · ${ex.pesoSugerido}kg` : ""}
      </div>

      <section className="mt-5 elevo-card p-4">
        <h2 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--primary)" }}>
          Como executar
        </h2>
        <ol className="text-sm space-y-1.5 list-decimal pl-4">
          {ex.instrucoes.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
      </section>

      {ex.errosComuns && ex.errosComuns.length > 0 && (
        <section className="mt-3 elevo-card p-4">
          <h2 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--warning)" }}>
            Erros comuns
          </h2>
          <ul className="text-sm space-y-1.5 list-disc pl-4" style={{ color: "var(--muted-foreground)" }}>
            {ex.errosComuns.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {ex.dicas && ex.dicas.length > 0 && (
        <section className="mt-3 elevo-card p-4">
          <h2 className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--secondary)" }}>
            Dicas
          </h2>
          <ul className="text-sm space-y-1.5 list-disc pl-4" style={{ color: "var(--muted-foreground)" }}>
            {ex.dicas.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-5">
        <button
          className="btn-primary"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
            height: 56,
            fontSize: 16,
          }}
          onClick={() => navigate({ to: "/treino/ativo", search: { dia: diaIdx, ex: ex.id } })}
        >
          <Play size={20} className="mr-2" />
          {feito ? "Refazer este exercício" : "Começar treino"}
        </button>
      </div>
    </div>
  );
}
