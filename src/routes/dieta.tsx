import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ProGate } from "@/components/ProGate";
import { useElevoUser } from "@/lib/elevo-store";
import { gerarPlanoDieta, type PlanoDieta } from "@/lib/dieta.functions";

export const Route = createFileRoute("/dieta")({
  component: DietaPage,
});

function DietaPage() {
  const user = useElevoUser();
  const fn = useServerFn(gerarPlanoDieta);

  const [objetivo, setObjetivo] = useState(
    user.objetivo === "emagrecer" ? "Emagrecimento" :
    user.objetivo === "forca" ? "Ganho de massa muscular" :
    "Manutenção e saúde"
  );
  const [restricoes, setRestricoes] = useState("");
  const [refeicoes, setRefeicoes] = useState(4);
  const [preferencias, setPreferencias] = useState("");
  const [plano, setPlano] = useState<PlanoDieta | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setErro(null);
    setLoading(true);
    try {
      const r = await fn({
        data: {
          objetivo,
          restricoes: restricoes.trim() || undefined,
          refeicoesPorDia: refeicoes,
          preferencias: preferencias.trim() || undefined,
          modoPreview: false,
        },
      });
      setPlano(r);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar dieta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="size-11 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
        >
          <UtensilsCrossed size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">Dieta com IA</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Monte seu plano alimentar em segundos.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <ProGate
          titulo="Dieta personalizada por IA"
          descricao="Plano alimentar de 7 dias com receitas, gerado pra você. Disponível no Pro."
        >
          <section className="elevo-card p-4 space-y-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Objetivo
              </label>
              <input className="input-field" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} maxLength={60} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Restrições / alergias <span className="opacity-60">(opcional)</span>
              </label>
              <input
                className="input-field"
                placeholder="Ex: lactose, glúten, vegetariano"
                value={restricoes}
                onChange={(e) => setRestricoes(e.target.value)}
                maxLength={400}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Refeições por dia
              </label>
              <div className="flex gap-2">
                {[3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRefeicoes(n)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition"
                    style={{
                      backgroundColor: refeicoes === n ? "var(--primary)" : "var(--card-elevated)",
                      color: refeicoes === n ? "var(--primary-foreground)" : "var(--foreground)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>
                Preferências / comidas favoritas <span className="opacity-60">(opcional)</span>
              </label>
              <input
                className="input-field"
                placeholder="Ex: arroz, feijão, frango, ovos"
                value={preferencias}
                onChange={(e) => setPreferencias(e.target.value)}
                maxLength={400}
              />
            </div>
            <button className="btn-primary w-full" onClick={gerar} disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Gerando...
                </span>
              ) : (
                "Gerar plano de 7 dias"
              )}
            </button>
            {erro && (
              <p className="text-[11px] text-center" style={{ color: "var(--destructive)" }}>
                {erro}
              </p>
            )}
          </section>

          {plano && (
            <section className="mt-5">
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-sm font-semibold">{plano.titulo}</h2>
                {plano.resumoCalorico && (
                  <span className="text-[11px]" style={{ color: "var(--primary)" }}>
                    {plano.resumoCalorico}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {plano.refeicoes.map((r, i) => (
                  <li key={i} className="elevo-card p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold">{r.nome}</span>
                      <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                        {r.horario}{r.calorias ? ` · ${r.calorias} kcal` : ""}
                      </span>
                    </div>
                    <ul className="mt-1.5 text-xs space-y-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {r.itens.map((it, j) => (
                        <li key={j}>• {it}</li>
                      ))}
                    </ul>
                    {r.receita && (
                      <div
                        className="mt-2 text-[11px] leading-snug p-2 rounded-lg"
                        style={{ background: "var(--card-elevated)" }}
                      >
                        <strong>Receita:</strong> {r.receita}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </ProGate>
      </div>

      <BottomNav />
    </div>
  );
}
