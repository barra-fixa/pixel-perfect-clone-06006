import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/equipamentos")({
  component: EquipPage,
});

// Apenas equipamentos que têm exercícios cadastrados em public.exercicios.
// peso_corporal = "nenhum" (sempre disponível como base do treino).
const opcoes = [
  { id: "nenhum", emoji: "🏃", titulo: "Nenhum — só meu corpo" },
  { id: "elastico", emoji: "🟢", titulo: "Banda elástica" },
  { id: "saco", emoji: "🥊", titulo: "Saco de pancada" },
];

function EquipPage() {
  const navigate = useNavigate();
  const [sel, setSel] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSel((prev) => {
      if (id === "nenhum") return prev.includes("nenhum") ? [] : ["nenhum"];
      const without = prev.filter((p) => p !== "nenhum");
      return without.includes(id) ? without.filter((p) => p !== id) : [...without, id];
    });
  };

  return (
    <OnboardingShell
      step={3}
      total={4}
      title="O que você tem em casa?"
      subtitle="Selecione tudo que tiver disponível"
      footer={
        <button
          className="btn-primary"
          disabled={sel.length === 0}
          onClick={() => {
            saveUser({ equipamentos: sel });
            navigate({ to: "/onboarding/nivel" });
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
            data-active={sel.includes(o.id)}
            className="selectable flex flex-col items-start gap-2 min-h-[110px]"
            onClick={() => toggle(o.id)}
          >
            <span className="text-2xl">{o.emoji}</span>
            <span className="text-sm font-semibold leading-tight">{o.titulo}</span>
          </button>
        ))}
      </div>

      <button
        className="mt-4 w-full rounded-2xl p-4 text-left border transition"
        style={{
          backgroundColor: "color-mix(in oklab, var(--warning) 12%, var(--card))",
          borderColor: "color-mix(in oklab, var(--warning) 40%, var(--border))",
        }}
        onClick={() => {
          saveUser({ equipamentos: [...sel, "quero-barra"] });
          navigate({ to: "/onboarding/nivel" });
        }}
      >
        <div className="font-semibold" style={{ color: "var(--warning)" }}>
          ✨ Não tenho barra — quero conhecer
        </div>
        <div className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Veja por que a barra multiplica seus resultados
        </div>
      </button>
    </OnboardingShell>
  );
}
