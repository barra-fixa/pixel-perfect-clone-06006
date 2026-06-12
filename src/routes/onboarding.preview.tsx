import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Sparkles, UtensilsCrossed } from "lucide-react";
import { saveUser, useElevoUser } from "@/lib/elevo-store";
import { pitchProPorObjetivo } from "@/lib/objetivo-labels";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/onboarding/preview")({
  component: PreviewPage,
});

const beneficios = [
  "14 dias grátis — só cobramos depois desse período",
  "Plano completo de 12 a 24 semanas",
  "Dieta personalizada por IA + receitas",
  "Cancele em 1 toque, quando quiser",
];

function PreviewPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const nome = user.nome ?? "atleta";
  const pitch = pitchProPorObjetivo(user.objetivo);

  const irParaPro = () => {
    if (isAuthenticated) {
      navigate({ to: "/upgrade" });
    } else {
      navigate({ to: "/onboarding/email", search: { next: "/upgrade" } as never });
    }
  };

  const irParaFree = () => {
    saveUser({ plano: "free", diasJornada: 1, treinosFeitos: 0, streak: 0 });
    if (isAuthenticated) {
      navigate({ to: "/home" });
    } else {
      navigate({ to: "/onboarding/email", search: { next: "/home" } as never });
    }
  };

  return (
    <div className="elevo-shell px-5 pt-6 pb-8 min-h-dvh">
      <div className="text-center fade-up">
        <span className="badge-pro">
          <Sparkles size={11} className="inline mr-1" /> Pronto, {nome}
        </span>
        <h1 className="mt-3 text-2xl font-bold leading-tight">
          Destrave seu plano completo
          <br />
          <span style={{ color: "var(--secondary)" }}>+ dieta gerada por IA</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {pitch}
        </p>
      </div>

      {/* Card principal — 14 dias */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, var(--card)), var(--card))",
          border: "1px solid color-mix(in oklab, var(--primary) 40%, var(--border))",
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black" style={{ color: "var(--primary)" }}>
            14 dias
          </span>
          <span className="text-base font-bold">grátis</span>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Mesmo com cartão cadastrado, só é cobrado depois dos 14 dias.
        </p>
        <ul className="mt-4 space-y-2">
          {beneficios.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm">
              <Check size={16} style={{ color: "var(--primary)" }} strokeWidth={3} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Gancho extra: dieta IA */}
      <div
        className="mt-3 rounded-2xl p-4 flex items-start gap-3"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 22%, var(--card)), var(--card))",
          border: "1px solid color-mix(in oklab, var(--secondary) 35%, var(--border))",
        }}
      >
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 28%, transparent)" }}
        >
          <UtensilsCrossed size={20} style={{ color: "var(--secondary)" }} />
        </div>
        <div className="text-xs leading-snug">
          <div className="font-bold text-sm">Sua dieta personalizada por IA</div>
          <div className="mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Plano alimentar de 7 dias gerado pra você, com receitas práticas e ajustado
            ao seu objetivo. Já incluída no seu plano Pro.
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          className="btn-primary"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
          }}
          onClick={irParaPro}
        >
          Começar meus 14 dias grátis
        </button>
        <p className="text-center text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Sem cobrança hoje · avisamos por e-mail antes de qualquer cobrança. Cancele quando quiser, em 1 toque, sem burocracia. Mesmo se cancelar, você continua com acesso ao app — apenas os treinos com barra fixa ficam liberados.
        </p>
      </div>
    </div>
  );
}
