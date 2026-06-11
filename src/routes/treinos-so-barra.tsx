import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { PRODUTOS_BARRA_FIXA } from "@/lib/produtos";
import { BottomNav } from "@/components/BottomNav";
import { ensureBarraGifs } from "@/lib/barra-gifs.functions";

export const Route = createFileRoute("/treinos-so-barra")({
  component: TreinosSoBarraPage,
});

type ExercicioBarra = {
  id: string;
  nome_pt: string;
  nome_en: string;
  target: string | null;
  categoria: string | null;
  dificuldade: string | null;
  instrucoes_pt: string[] | null;
  gif_url_local: string | null;
};

const ORDEM_CATEGORIA: Record<string, number> = {
  preparatorio: 0,
  principal: 1,
  finalizador: 2,
};

const LABEL_CATEGORIA: Record<string, string> = {
  preparatorio: "Preparatório",
  principal: "Principal",
  finalizador: "Finalizador",
};

const LABEL_DIFICULDADE: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

function TreinosSoBarraPage() {
  const [itens, setItens] = useState<ExercicioBarra[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const enrich = useServerFn(ensureBarraGifs);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const { data, error } = await supabase
        .from("exercicios")
        .select("id, nome_pt, nome_en, target, categoria, dificuldade, instrucoes_pt, gif_url_local")
        .eq("equipment", "barra_fixa_parede")
        .eq("ativo", true)
        .order("nome_pt");
      if (!ativo) return null;
      if (error) {
        setErro(error.message);
        setItens([]);
        return null;
      }
      const ordenados = [...(data ?? [])].sort((a, b) => {
        const ca = ORDEM_CATEGORIA[a.categoria ?? ""] ?? 99;
        const cb = ORDEM_CATEGORIA[b.categoria ?? ""] ?? 99;
        if (ca !== cb) return ca - cb;
        return (a.nome_pt ?? "").localeCompare(b.nome_pt ?? "");
      });
      setItens(ordenados as ExercicioBarra[]);
      return ordenados as ExercicioBarra[];
    }

    void (async () => {
      const lista = await carregar();
      if (!ativo || !lista) return;
      const faltamGifs = lista.some((e) => !e.gif_url_local);
      if (!faltamGifs) return;
      try {
        const r = await enrich();
        if (!ativo) return;
        if (r?.updated && r.updated > 0) {
          await carregar();
        }
      } catch {
        // ignora — segue com placeholders
      }
    })();

    return () => {
      ativo = false;
    };
  }, [enrich]);

  return (
    <div className="elevo-shell px-5 pt-8 pb-32 min-h-dvh">
      <div className="flex items-center justify-between mb-5 mt-2">
        <Link
          to="/home"
          className="size-11 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-bold">Só Barra Fixa</h1>
        <div className="size-11" />
      </div>

      <div className="mb-5">
        <div
          className="text-[10px] uppercase tracking-wider font-semibold"
          style={{ color: "var(--secondary)" }}
        >
          🏋️ Catálogo
        </div>
        <h2 className="text-2xl font-bold leading-tight">Exercícios na Barra Fixa</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Todos os movimentos e pegadas possíveis na sua barra de parede.
        </p>
      </div>

      {itens === null && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={22} style={{ color: "var(--muted-foreground)" }} />
        </div>
      )}

      {erro && (
        <p className="text-xs mb-4" style={{ color: "var(--destructive)" }}>
          Não foi possível carregar o catálogo: {erro}
        </p>
      )}

      {itens && itens.length > 0 && (
        <div className="space-y-2 mb-8">
          {itens.map((e) => {
            const open = aberto === e.id;
            return (
              <div key={e.id} className="elevo-card overflow-hidden">
                <button
                  onClick={() => setAberto(open ? null : e.id)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  <span
                    className="size-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-xl"
                    style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
                  >
                    {e.gif_url_local ? (
                      <img src={e.gif_url_local} alt="" loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      "🏋️"
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight">{e.nome_pt}</div>
                    <div className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
                      {[e.categoria ? LABEL_CATEGORIA[e.categoria] ?? e.categoria : null,
                        e.dificuldade ? LABEL_DIFICULDADE[e.dificuldade] ?? e.dificuldade : null,
                        e.target,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    style={{
                      color: "var(--subtle)",
                      transform: open ? "rotate(90deg)" : undefined,
                      transition: "transform .2s",
                    }}
                  />
                </button>

                {open && (
                  <div className="px-3 pb-4 fade-up space-y-3">
                    {e.gif_url_local && (
                      <div
                        className="aspect-video rounded-xl overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: "color-mix(in oklab, var(--primary) 8%, var(--card-elevated))" }}
                      >
                        <img
                          src={e.gif_url_local}
                          alt={`Demonstração: ${e.nome_pt}`}
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    {e.instrucoes_pt && e.instrucoes_pt.length > 0 ? (
                      <ol
                        className="space-y-1.5 text-xs list-decimal pl-5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {e.instrucoes_pt.map((linha, i) => (
                          <li key={i}>{linha}</li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--subtle)" }}>
                        Sem instruções cadastradas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {itens && itens.length === 0 && !erro && (
        <p className="text-sm py-8 text-center" style={{ color: "var(--muted-foreground)" }}>
          Nenhum exercício de barra fixa cadastrado.
        </p>
      )}

      <section>
        <div
          className="text-[10px] uppercase tracking-wider font-semibold mb-2"
          style={{ color: "var(--secondary)" }}
        >
          Compre sua barra fixa
        </div>
        <h3 className="text-base font-bold mb-3">Modelos recomendados</h3>
        <div className="space-y-2">
          {PRODUTOS_BARRA_FIXA.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="elevo-card p-3 flex items-center gap-3 active:scale-[0.99] transition"
            >
              <div
                className="size-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 22%, transparent)" }}
              >
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight line-clamp-1">{p.nome}</div>
                <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                  {p.descricao} · {p.preco}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: "var(--subtle)" }} />
            </a>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
