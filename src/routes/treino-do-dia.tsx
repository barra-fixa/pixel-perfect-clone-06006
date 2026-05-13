import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play, CheckCircle2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal, getDiasTreino } from "@/lib/treinos";
import { exerciciosFeitosHoje } from "@/lib/treino-progress";
import { PRODUTOS_BARRA_FIXA } from "@/lib/produtos";

const search = z.object({
  dia: z.coerce.number().optional(),
});

export const Route = createFileRoute("/treino-do-dia")({
  validateSearch: (s) => search.parse(s),
  component: TreinoDoDiaPage,
});

// Segunda = 0 ... Domingo = 6
const DIAS_CURTOS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const DIAS_LONGOS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

// Converte JS getDay() (dom=0..sab=6) -> índice "segunda=0".
function indiceSegunda(d: number) {
  return (d + 6) % 7;
}

function dataDoDia(diaSegundaIdx: number): Date {
  const hoje = new Date();
  const hojeIdx = indiceSegunda(hoje.getDay());
  const delta = diaSegundaIdx - hojeIdx;
  const d = new Date(hoje);
  d.setDate(hoje.getDate() + delta);
  return d;
}

function TreinoDoDiaPage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const { dia } = Route.useSearch();

  const plano = useMemo(() => getPlanoSemanal(user), [user]);
  const hojeIdx = indiceSegunda(new Date().getDay());
  const diaSelecionado = dia ?? hojeIdx;
  const treino = plano[diaSelecionado % plano.length];
  const dataSel = dataDoDia(diaSelecionado);

  const ehHoje = diaSelecionado === hojeIdx;
  const feitos = ehHoje ? exerciciosFeitosHoje(treino.id) : [];

  return (
    <div className="elevo-shell px-5 pt-5 pb-32 min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/home"
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold">Treino do dia</h1>
        <div className="size-10" />
      </div>

      {/* Abas de dias */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto -mx-5 px-5 pb-1">
        {DIAS_CURTOS.map((label, i) => {
          const ativo = i === diaSelecionado;
          const eHoje = i === hojeIdx;
          return (
            <button
              key={label}
              onClick={() => navigate({ to: "/treino-do-dia", search: { dia: i }, replace: true })}
              className="shrink-0 rounded-xl px-3 py-2 min-w-[44px] text-xs font-bold relative transition"
              style={
                ativo
                  ? {
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }
                  : {
                      backgroundColor: "var(--card)",
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    }
              }
            >
              {label}
              {eHoje && (
                <span
                  className="absolute -top-1 -right-1 size-2 rounded-full"
                  style={{ backgroundColor: ativo ? "var(--primary-foreground)" : "var(--secondary)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Título */}
      <div className="mb-5">
        <div
          className="text-[10px] uppercase tracking-wider font-semibold"
          style={{ color: "var(--primary)" }}
        >
          {ehHoje ? "Hoje" : "Treino"}
        </div>
        <h2 className="text-2xl font-bold leading-tight">{treino.nome}</h2>
        <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          {DIAS_LONGOS[diaSelecionado]}, {dataSel.getDate()} de{" "}
          {dataSel.toLocaleDateString("pt-BR", { month: "long" })} · ~{treino.duracaoMin} min
        </div>
      </div>

      {/* Grid 2x2 de exercícios */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {treino.exercicios.map((ex) => {
          const feito = feitos.includes(ex.id);
          return (
            <button
              key={ex.id}
              onClick={() =>
                navigate({
                  to: "/exercicio-detalhe",
                  search: { dia: diaSelecionado, exId: ex.id },
                })
              }
              className="elevo-card p-3 text-left active:scale-[0.98] transition relative overflow-hidden"
              style={feito ? { borderColor: "var(--primary)" } : undefined}
            >
              <div
                className="aspect-square rounded-xl overflow-hidden mb-2 relative"
                style={{ backgroundColor: "var(--card-elevated)" }}
              >
                {ex.imagem ? (
                  <img
                    src={ex.imagem}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // fallback pro emoji se a imagem falhar
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-5xl">
                    {ex.emoji}
                  </span>
                )}
                {feito && (
                  <span
                    className="absolute top-1.5 right-1.5 size-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <CheckCircle2 size={14} />
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold leading-tight line-clamp-2">{ex.nome}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {ex.series} × {ex.reps}
              </div>
            </button>
          );
        })}
      </div>

      {/* Botão grande de começar */}
      <button
        onClick={() =>
          navigate({
            to: "/treino/ativo",
            search: { dia: diaSelecionado },
          })
        }
        className="btn-primary w-full"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          height: 60,
          fontSize: 17,
          fontWeight: 700,
          borderRadius: 16,
        }}
      >
        <Play size={22} className="mr-2" />
        {ehHoje ? "COMEÇAR TREINO AGORA" : "TREINAR ESTE DIA"}
      </button>
      <p className="text-center text-xs mt-3" style={{ color: "var(--subtle)" }}>
        Toque em qualquer exercício acima pra ver detalhes antes.
      </p>
    </div>
  );
}
