import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser, type Caminho } from "@/lib/elevo-store";
import { Dumbbell, Home as HomeIcon } from "lucide-react";

export const Route = createFileRoute("/onboarding/caminho")({
  component: CaminhoPage,
});

function CaminhoPage() {
  const navigate = useNavigate();
  const [sel, setSel] = useState<Caminho | null>(null);

  return (
    <OnboardingShell
      step={2}
      title="Como você quer treinar?"
      subtitle="Escolha o caminho que mais combina com você"
      footer={
        <button
          className="btn-primary"
          disabled={!sel}
          onClick={() => {
            if (!sel) return;
            saveUser({ caminho: sel });
            navigate({ to: sel === "barra" ? "/onboarding/saco" : "/onboarding/equipamentos" });
          }}
        >
          Continuar
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3">
        <button
          data-active={sel === "barra"}
          className="selectable selectable-purple flex gap-4 items-start"
          onClick={() => setSel("barra")}
        >
          <div
            className="size-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)", color: "var(--secondary)" }}
          >
            <Dumbbell size={22} />
          </div>
          <div>
            <div className="font-semibold">Tenho barra instalada</div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Calistenia e progressão na barra
            </div>
          </div>
        </button>

        <button
          data-active={sel === "casa"}
          className="selectable flex gap-4 items-start"
          onClick={() => setSel("casa")}
        >
          <div
            className="size-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in oklab, var(--primary) 25%, transparent)", color: "var(--primary)" }}
          >
            <HomeIcon size={22} />
          </div>
          <div>
            <div className="font-semibold">Treino em casa</div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Com o que tenho disponível
            </div>
          </div>
        </button>
      </div>
    </OnboardingShell>
  );
}
