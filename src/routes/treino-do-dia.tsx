import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Play, CheckCircle2, Settings, X, Dumbbell } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { saveUser, useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal, getDiasTreino } from "@/lib/treinos";
import { exerciciosFeitosHoje } from "@/lib/treino-progress";
import { PRODUTOS_BARRA_FIXA } from "@/lib/produtos";
import { useModoBarraFixa, useSemanaSoBarraAtiva, setSemanaSoBarraAtiva } from "@/lib/modo-barra-fixa";

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
  const [modoBarra, setModoBarra] = useModoBarraFixa();
  const semanaAtiva = useSemanaSoBarraAtiva();

  const plano = useMemo(() => getPlanoSemanal(user), [user, modoBarra, semanaAtiva]);
  const hojeIdx = indiceSegunda(new Date().getDay());
  const diaSelecionado = dia ?? hojeIdx;
  const treino = plano[diaSelecionado % plano.length];
  const dataSel = dataDoDia(diaSelecionado);

  const ehHoje = diaSelecionado === hojeIdx;
  const feitos = ehHoje ? exerciciosFeitosHoje(treino.id) : [];

  // Frequência alvo (quantos dias por semana). Usuário escolhe quais.
  const freq = Math.max(1, Math.min(7, user.frequencia ?? 3));
  // Dias escolhidos pelo usuário; fallback = sugestão automática.
  const diasPlanejados = useMemo(
    () => (user.diasTreino && user.diasTreino.length > 0 ? [...user.diasTreino].sort((a, b) => a - b) : getDiasTreino(freq)),
    [user.diasTreino, freq],
  );

  // Sempre inclui o dia atual selecionado (se cair fora dos planejados).
  const diasVisiveis = useMemo(() => {
    const set = new Set([...diasPlanejados, diaSelecionado]);
    return Array.from(set).sort((a, b) => a - b);
  }, [diasPlanejados, diaSelecionado]);
  const foraDoPlano = !diasPlanejados.includes(diaSelecionado);

  // Modal de edição
  const [editOpen, setEditOpen] = useState(false);
  const [editSel, setEditSel] = useState<number[]>(diasPlanejados);
  function abrirEdit() {
    setEditSel(diasPlanejados);
    setEditOpen(true);
  }
  function toggleDia(i: number) {
    setEditSel((cur) => {
      if (cur.includes(i)) return cur.filter((x) => x !== i);
      if (cur.length >= freq) return cur; // bloqueia mais que a frequência
      return [...cur, i];
    });
  }
  function salvarDias() {
    const ordenados = [...editSel].sort((a, b) => a - b);
    saveUser({ diasTreino: ordenados });
    setEditOpen(false);
    // Se o dia selecionado deixou de fazer parte, navega pro primeiro planejado.
    if (!ordenados.includes(diaSelecionado) && ordenados.length > 0) {
      navigate({ to: "/treino-do-dia", search: { dia: ordenados[0] }, replace: true });
    }
  }

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

      {/* Abas dos dias escolhidos + botão editar */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto -mx-5 px-5 pb-1">
        {diasVisiveis.map((i) => {
          const label = DIAS_CURTOS[i];
          const ativo = i === diaSelecionado;
          const eHoje = i === hojeIdx;
          const ePlanejado = diasPlanejados.includes(i);
          return (
            <button
              key={i}
              onClick={() => navigate({ to: "/treino-do-dia", search: { dia: i }, replace: true })}
              className="shrink-0 rounded-xl px-3 py-2 min-w-[48px] text-xs font-bold relative transition"
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
                      opacity: ePlanejado ? 1 : 0.6,
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
        <button
          onClick={abrirEdit}
          className="shrink-0 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-1.5"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--primary)",
            border: "1px dashed color-mix(in oklab, var(--primary) 45%, var(--border))",
          }}
          aria-label="Editar dias de treino"
        >
          <Settings size={13} /> Editar
        </button>
      </div>
      {foraDoPlano && (
        <p className="text-[11px] mb-4" style={{ color: "var(--muted-foreground)" }}>
          ⚡ Treino bônus — este dia não está nos seus {freq} dias habituais.
        </p>
      )}
      {!foraDoPlano && <div className="mb-3" />}

      {/* Banner: semana "Só Barra Fixa" ativa */}
      {semanaAtiva && (
        <div
          className="rounded-xl p-3 mb-3 flex items-center gap-3"
          style={{
            backgroundColor: "color-mix(in oklab, var(--secondary) 18%, var(--card))",
            border: "1px solid color-mix(in oklab, var(--secondary) 40%, var(--border))",
          }}
        >
          <div className="text-xl">🏋️</div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--secondary)" }}>
              Programa ativo
            </div>
            <div className="text-sm font-bold capitalize">Só Barra Fixa · {semanaAtiva}</div>
          </div>
          <button
            onClick={() => setSemanaSoBarraAtiva(null)}
            className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--card-elevated)", color: "var(--foreground)" }}
          >
            Sair
          </button>
        </div>
      )}

      {/* Toggle: Modo Só Barra Fixa (filtragem leve) */}
      {!semanaAtiva && (
        <button
          onClick={() => setModoBarra(!modoBarra)}
          className="w-full rounded-xl p-3 mb-3 flex items-center gap-3 text-left transition"
          style={{
            backgroundColor: modoBarra
              ? "color-mix(in oklab, var(--primary) 16%, var(--card))"
              : "var(--card)",
            border: modoBarra
              ? "1px solid var(--primary)"
              : "1px solid var(--border)",
          }}
          aria-pressed={modoBarra}
        >
          <div
            className="size-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: modoBarra
                ? "var(--primary)"
                : "color-mix(in oklab, var(--primary) 14%, transparent)",
              color: modoBarra ? "var(--primary-foreground)" : "var(--primary)",
            }}
          >
            <Dumbbell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold leading-tight">Treino Só Barra Fixa</div>
            <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {modoBarra ? "Ativo — só barra e peso corporal" : "Toque pra filtrar exercícios"}
            </div>
          </div>
          <span
            className="shrink-0 inline-flex items-center justify-center rounded-full text-[10px] font-bold px-2.5 py-1"
            style={{
              backgroundColor: modoBarra ? "var(--primary)" : "var(--card-elevated)",
              color: modoBarra ? "var(--primary-foreground)" : "var(--muted-foreground)",
            }}
          >
            {modoBarra ? "ON" : "OFF"}
          </span>
        </button>
      )}

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

      {/* Modal: editar dias da semana */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: "color-mix(in oklab, black 60%, transparent)" }}
          onClick={() => setEditOpen(false)}
        >
          <div
            className="elevo-card w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base">Escolha seus {freq} dias</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="size-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--card-elevated)" }}
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>
              Selecione exatamente {freq} {freq === 1 ? "dia" : "dias"} de treino.
            </p>

            <div className="space-y-1.5">
              {DIAS_LONGOS.map((longo, i) => {
                const sel = editSel.includes(i);
                const cheio = !sel && editSel.length >= freq;
                return (
                  <button
                    key={i}
                    onClick={() => toggleDia(i)}
                    disabled={cheio}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition text-left"
                    style={{
                      backgroundColor: sel
                        ? "color-mix(in oklab, var(--primary) 18%, var(--card))"
                        : "var(--card-elevated)",
                      border: sel
                        ? "1px solid var(--primary)"
                        : "1px solid var(--border)",
                      opacity: cheio ? 0.4 : 1,
                    }}
                  >
                    <span
                      className="size-5 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: sel ? "var(--primary)" : "transparent",
                        border: sel ? "1px solid var(--primary)" : "1px solid var(--border)",
                      }}
                    >
                      {sel && <CheckCircle2 size={12} style={{ color: "var(--primary-foreground)" }} />}
                    </span>
                    <span className="text-sm font-semibold flex-1">{longo}</span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--subtle)" }}>
                      {DIAS_CURTOS[i]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span style={{ color: "var(--muted-foreground)" }}>
                Selecionados: <span className="font-bold" style={{ color: editSel.length === freq ? "var(--primary)" : "var(--foreground)" }}>{editSel.length}/{freq}</span>
              </span>
              {editSel.length > freq && (
                <span style={{ color: "var(--warning)" }}>Máximo {freq} dias</span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl py-3 text-sm font-semibold"
                style={{ backgroundColor: "var(--card-elevated)", color: "var(--foreground)" }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarDias}
                disabled={editSel.length !== freq}
                className="rounded-xl py-3 text-sm font-bold transition"
                style={{
                  backgroundColor: editSel.length === freq ? "var(--primary)" : "var(--card-elevated)",
                  color: editSel.length === freq ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  opacity: editSel.length === freq ? 1 : 0.6,
                }}
              >
                Salvar Dias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
