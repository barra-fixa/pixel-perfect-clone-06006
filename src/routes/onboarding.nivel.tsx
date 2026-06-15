import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser, type Nivel } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/nivel")({
  component: NivelPage,
});

const niveis: { id: Nivel; emoji: string; titulo: string; sub: string }[] = [
  { id: "iniciante", emoji: "🌱", titulo: "Iniciante", sub: "Nunca treinei ou comecei agora" },
  { id: "intermediario", emoji: "💪", titulo: "Intermediário", sub: "Treino às vezes, tenho alguma base" },
  { id: "avancado", emoji: "🔥", titulo: "Avançado", sub: "Treino há mais de 6 meses" },
];

function NivelPage() {
  const navigate = useNavigate();
  const [sel, setSel] = useState<Nivel | null>(null);

  return (
    <OnboardingShell
      step={3}
      total={4}
      title="Qual é o seu nível?"
      footer={
        <button
          className="btn-primary"
          disabled={!sel}
          onClick={() => {
            if (!sel) return;
            saveUser({ nivel: sel });
            navigate({ to: "/onboarding/frequencia" });
          }}
        >
          Continuar
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        {niveis.map((n) => (
          <button
            key={n.id}
            data-active={sel === n.id}
            className="selectable flex items-center gap-4 py-5"
            onClick={() => setSel(n.id)}
          >
            <span className="text-3xl">{n.emoji}</span>
            <div>
              <div className="font-semibold">{n.titulo}</div>
              <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {n.sub}
              </div>
            </div>
          </button>
        ))}
      </div>
    </OnboardingShell>
  );
}
