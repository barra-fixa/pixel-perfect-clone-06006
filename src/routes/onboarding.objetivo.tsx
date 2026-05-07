import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser, type Objetivo } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/objetivo")({
  component: ObjetivoPage,
});

const opcoes: { id: Objetivo; emoji: string; titulo: string }[] = [
  { id: "forca", emoji: "💪", titulo: "Ganho de força" },
  { id: "emagrecer", emoji: "🔥", titulo: "Emagrecimento" },
  { id: "taf", emoji: "🛡️", titulo: "Preparação TAF" },
  { id: "saude", emoji: "❤️", titulo: "Saúde e condicionamento" },
  { id: "definicao", emoji: "✂️", titulo: "Definição muscular" },
  { id: "zero", emoji: "🌱", titulo: "Começar do zero" },
];

function ObjetivoPage() {
  const navigate = useNavigate();
  const [sel, setSel] = useState<Objetivo | null>(null);

  return (
    <OnboardingShell
      step={1}
      title="Qual é o seu principal objetivo?"
      subtitle="Vamos montar seu plano personalizado"
      footer={
        <button
          className="btn-primary"
          disabled={!sel}
          onClick={() => {
            if (!sel) return;
            saveUser({ objetivo: sel });
            navigate({ to: "/onboarding/caminho" });
          }}
        >
          Continuar
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        {opcoes.map((o) => (
          <button
            key={o.id}
            data-active={sel === o.id}
            className="selectable flex flex-col items-start gap-2 min-h-[110px]"
            onClick={() => setSel(o.id)}
          >
            <span className="text-2xl">{o.emoji}</span>
            <span className="text-sm font-semibold leading-tight">{o.titulo}</span>
          </button>
        ))}
      </div>
    </OnboardingShell>
  );
}
