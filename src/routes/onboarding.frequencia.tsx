import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/frequencia")({
  component: FreqPage,
});

const opcoes = [2, 3, 4, 5, 7];

function FreqPage() {
  const navigate = useNavigate();
  const [sel, setSel] = useState<number | null>(null);

  return (
    <OnboardingShell
      step={4}
      total={4}
      title="Quantos dias por semana?"
      subtitle="Escolha uma frequência realista — você pode mudar depois"
      footer={
        <button
          className="btn-primary"
          disabled={!sel}
          onClick={() => {
            if (!sel) return;
            saveUser({ frequencia: sel });
            navigate({ to: "/onboarding/processando" });
          }}
        >
          Continuar
        </button>
      }
    >
      <div className="flex flex-wrap gap-2">
        {opcoes.map((n) => (
          <button
            key={n}
            data-active={sel === n}
            className="chip flex-1 min-w-[60px]"
            onClick={() => setSel(n)}
          >
            {n === 7 ? "Todos" : `${n}x`}
          </button>
        ))}
      </div>

      <div className="elevo-card mt-6 p-4">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          💡 Iniciantes evoluem mais com <span className="text-foreground font-semibold">3x por semana</span>{" "}
          + dias de descanso para recuperação muscular.
        </p>
      </div>
    </OnboardingShell>
  );
}
