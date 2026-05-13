import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { SEMANAS_SO_BARRA, type SemanaBarra } from "@/lib/treinos-so-barra";
import { setModoBarraFixa, setSemanaSoBarraAtiva } from "@/lib/modo-barra-fixa";
import { PRODUTOS_BARRA_FIXA } from "@/lib/produtos";

export const Route = createFileRoute("/treinos-so-barra")({
  component: TreinosSoBarraPage,
});

const DIAS_LABEL: Record<number, string> = { 0: "SEG", 2: "QUA", 4: "SEX" };

function TreinosSoBarraPage() {
  const navigate = useNavigate();
  const [aberta, setAberta] = useState<number | null>(1);

  function comecarAgora(s: SemanaBarra) {
    setModoBarraFixa(true);
    setSemanaSoBarraAtiva(s.slug);
    navigate({ to: "/treino-do-dia" });
  }

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
        <h1 className="font-bold">Só Barra Fixa</h1>
        <div className="size-10" />
      </div>

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--secondary)" }}>
          🏋️ Exclusivo
        </div>
        <h2 className="text-2xl font-bold leading-tight">Treinos Só com Barra Fixa</h2>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Sequências completas para começar — só barra e peso corporal.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {SEMANAS_SO_BARRA.map((s) => {
          const open = aberta === s.id;
          return (
            <div
              key={s.id}
              className="elevo-card overflow-hidden"
              style={open ? { borderColor: "color-mix(in oklab, var(--primary) 40%, var(--border))" } : undefined}
            >
              <button
                onClick={() => setAberta(open ? null : s.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div
                  className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
                >
                  {s.icone}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--primary)" }}>
                    Nível {s.id} · {s.dificuldade}
                  </div>
                  <div className="font-bold text-base leading-tight">{s.nome}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {s.descricao}
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  style={{ color: "var(--subtle)", transform: open ? "rotate(90deg)" : undefined, transition: "transform .2s" }}
                />
              </button>

              {open && (
                <div className="px-4 pb-4 fade-up">
                  <p className="text-xs mb-3" style={{ color: "var(--subtle)" }}>
                    {s.resumo}
                  </p>
                  <div className="space-y-3">
                    {s.dias.map((d) => (
                      <div key={d.chave} className="rounded-xl p-3" style={{ backgroundColor: "var(--card-elevated)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                          >
                            {DIAS_LABEL[d.diaIdx]}
                          </span>
                          <span className="text-sm font-semibold">{d.nomeTreino}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {d.exercicios.map((e, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              <span className="size-7 rounded-md overflow-hidden shrink-0" style={{ backgroundColor: "var(--card)" }}>
                                {e.imagem ? (
                                  <img src={e.imagem} alt="" loading="lazy" className="w-full h-full object-cover" />
                                ) : null}
                              </span>
                              <span className="flex-1 truncate">{e.nome}</span>
                              <span style={{ color: "var(--muted-foreground)" }}>
                                {e.series} × {e.reps}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => comecarAgora(s)}
                    className="btn-primary w-full mt-4"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                      height: 52,
                      fontWeight: 700,
                      borderRadius: 14,
                    }}
                  >
                    <Play size={18} className="mr-2" />
                    Começar agora
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section>
        <div className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "var(--secondary)" }}>
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
    </div>
  );
}
