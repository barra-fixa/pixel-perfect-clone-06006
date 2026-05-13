import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play, CheckCircle2, Settings, X } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { saveUser, useElevoUser } from "@/lib/elevo-store";
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

  // Frequência do usuário define quais abas aparecem por padrão.
  const diasPlanejados = useMemo(() => getDiasTreino(user.frequencia ?? 3), [user.frequencia]);
  // Sempre inclui o dia atualmente selecionado (caso "treinar em outro dia").
  const diasVisiveisPadrao = useMemo(() => {
    const set = new Set([...diasPlanejados, diaSelecionado]);
    return Array.from(set).sort((a, b) => a - b);
  }, [diasPlanejados, diaSelecionado]);

  const [mostrarTodos, setMostrarTodos] = useState(false);
  const diasVisiveis = mostrarTodos ? [0, 1, 2, 3, 4, 5, 6] : diasVisiveisPadrao;
  const foraDoPlano = !diasPlanejados.includes(diaSelecionado);

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

      {/* Abas de dias (dinâmicas conforme frequência) */}
      <div className="flex gap-1.5 mb-2 overflow-x-auto -mx-5 px-5 pb-1">
        {diasVisiveis.map((i) => {
          const label = DIAS_CURTOS[i];
          const ativo = i === diaSelecionado;
          const eHoje = i === hojeIdx;
          const ePlanejado = diasPlanejados.includes(i);
          return (
            <button
              key={i}
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
                      color: ePlanejado ? "var(--foreground)" : "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                      opacity: ePlanejado ? 1 : 0.7,
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
        {!mostrarTodos && (
          <button
            onClick={() => setMostrarTodos(true)}
            className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--primary)",
              border: "1px dashed color-mix(in oklab, var(--primary) 40%, var(--border))",
            }}
          >
            <Plus size={12} /> Outro dia
          </button>
        )}
      </div>
      {foraDoPlano && (
        <p className="text-[11px] mb-4" style={{ color: "var(--muted-foreground)" }}>
          ⚡ Treino bônus — este dia está fora da sua frequência habitual ({user.frequencia ?? 3}x/semana).
        </p>
      )}
      {!foraDoPlano && <div className="mb-3" />}

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

      {/* Rodapé educativo: barras fixas recomendadas */}
      {user.caminho !== "barra" && (
        <section className="mt-8">
          <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--secondary)" }}>
            Quer destravar mais exercícios?
          </div>
          <h3 className="text-sm font-bold mb-3">Comece com uma barra fixa</h3>
          <div className="space-y-2">
            {PRODUTOS_BARRA_FIXA.slice(0, 2).map((p) => (
              <a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="elevo-card p-3 flex items-center gap-3 active:scale-[0.99] transition"
              >
                <div
                  className="size-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 22%, transparent)" }}
                >
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-tight line-clamp-1">{p.nome}</div>
                  <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                    {p.preco}
                  </div>
                </div>
                <ChevronLeft size={14} className="rotate-180" style={{ color: "var(--subtle)" }} />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
