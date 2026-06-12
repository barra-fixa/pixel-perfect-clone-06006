import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CheckCircle2, Sparkles, Lock } from "lucide-react";
import { loadUser, useElevoUser } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";
import { tituloPlanoPorObjetivo } from "@/lib/objetivo-labels";


export const Route = createFileRoute("/onboarding/previa")({
  component: PreviaPage,
});

// Ordinal "6a" para sexta — evita tradução automática "Sex" → "Sexo".
const DIAS_CURTOS = ["2a", "3a", "4a", "5a", "6a", "Sáb", "Dom"];

function PreviaPage() {
  const navigate = useNavigate();
  const user = useElevoUser();

  const plano = useMemo(() => {
    try {
      return getPlanoSemanal(loadUser());
    } catch {
      return [];
    }
  }, []);

  const titulo = tituloPlanoPorObjetivo(user.objetivo);
  const totalEx = plano.reduce((s, t) => s + t.exercicios.length, 0);
  const freq = user.frequencia ?? plano.length;

  return (
    <div className="elevo-shell px-5 pt-8 pb-32 min-h-dvh">
      <div className="text-center fade-up">
        <span className="badge-pro">
          <Sparkles size={11} className="inline mr-1" /> Plano IA pronto
        </span>
        <h1 className="mt-3 text-2xl font-bold leading-tight">{titulo}</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {freq}x por semana · {totalEx} exercícios selecionados pra você
        </p>
      </div>

      {/* Preview real */}
      <div className="mt-5 elevo-card overflow-hidden">
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span className="font-semibold text-sm">Sua primeira semana</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
            ● Pronto
          </span>
        </div>
        <ul>
          {plano.slice(0, Math.min(4, plano.length)).map((t, i) => (
            <li
              key={t.id}
              className="px-4 py-3 flex items-center gap-3"
              style={{ borderTop: i === 0 ? undefined : "1px solid var(--border)" }}
            >
              <span
                translate="no"
                className="notranslate size-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: "var(--card-elevated)" }}
              >
                {DIAS_CURTOS[i] ?? `D${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{t.nome}</div>
                <div className="text-[11px]" style={{ color: "var(--subtle)" }}>
                  {t.exercicios.length} exercícios · ~{t.duracaoMin} min
                </div>
              </div>
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} />
            </li>
          ))}
        </ul>
      </div>

      {/* Bloqueado — semana 2+ */}
      <div className="mt-3 elevo-card p-4 relative">
        <div className="opacity-50 blur-[2px]">
          <div className="font-semibold text-sm">Semanas 2 a 12</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Progressão completa + sua dieta personalizada por IA
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-1.5">
          <Lock size={14} style={{ color: "var(--subtle)" }} />
          <span className="text-[11px] font-medium" style={{ color: "var(--subtle)" }}>
            Confirme seu cadastro pra desbloquear
          </span>
        </div>
      </div>

      <div
        className="mt-6 rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: "color-mix(in oklab, var(--primary) 12%, var(--card))",
          border: "1px solid color-mix(in oklab, var(--primary) 30%, var(--border))",
        }}
      >
        <div
          className="size-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--primary) 22%, transparent)" }}
        >
          📨
        </div>
        <div className="text-xs leading-snug">
          <div style={{ color: "var(--muted-foreground)" }}>
            Agora só preciso saber seu nome e seus dados pra liberar seu treino — já com o plano alimentar incluso.
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <button
          className="btn-primary"
          onClick={() => navigate({ to: "/onboarding/email" })}
        >
          Quero meu plano completo
        </button>
        <p className="text-center text-[11px]" style={{ color: "var(--subtle)" }}>
          Grátis · sem cartão · 100% personalizado
        </p>
      </div>
    </div>
  );
}
