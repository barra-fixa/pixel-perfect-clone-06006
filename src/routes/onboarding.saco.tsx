import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/saco")({
  component: SacoPage,
});

function SacoPage() {
  const navigate = useNavigate();
  const choose = (v: boolean) => {
    saveUser({ temSacoPancada: v });
    navigate({ to: "/onboarding/nivel" });
  };

  return (
    <OnboardingShell
      step={2}
      title="Você tem saco de pancada?"
      subtitle="Toda barra suporta saco de pancada — incluindo a sua"
    >
      <div className="grid grid-cols-1 gap-3">
        <button className="selectable flex items-center gap-3 py-5" onClick={() => choose(true)}>
          <span className="text-2xl">✅</span>
          <div>
            <div className="font-semibold">Sim, tenho saco de pancada</div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Vamos incluir treinos de boxe e condicionamento
            </div>
          </div>
        </button>
        <button className="selectable flex items-center gap-3 py-5" onClick={() => choose(false)}>
          <span className="text-2xl">❌</span>
          <div>
            <div className="font-semibold">Ainda não tenho</div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Tudo bem, plano focado na barra
            </div>
          </div>
        </button>
      </div>
    </OnboardingShell>
  );
}
