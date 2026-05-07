import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding/processando")({
  component: ProcessandoPage,
});

const passos = [
  "Analisando seu objetivo...",
  "Selecionando os melhores exercícios...",
  "Montando seu plano personalizado...",
  "Seu plano está pronto!",
];

function ProcessandoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, passos.length - 1));
    }, 850);
    const timeout = setTimeout(() => navigate({ to: "/onboarding/email" }), 3600);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="elevo-shell elevo-grid-bg flex flex-col items-center justify-center px-6 min-h-dvh">
      <div className="relative size-44 flex items-center justify-center mb-12">
        <div
          className="absolute inset-0 rounded-full pulse-ring"
          style={{
            background:
              "conic-gradient(from 0deg, var(--primary), var(--secondary), var(--primary))",
            filter: "blur(12px)",
            opacity: 0.5,
          }}
        />
        <div
          className="relative size-32 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
          }}
        >
          <span className="text-4xl">{step === passos.length - 1 ? "✓" : "🤖"}</span>
        </div>
      </div>

      <div className="space-y-3 w-full max-w-xs">
        {passos.map((p, i) => (
          <div
            key={p}
            className="flex items-center gap-3 transition-all duration-300"
            style={{ opacity: i <= step ? 1 : 0.3 }}
          >
            <div
              className="size-6 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor:
                  i < step
                    ? "var(--primary)"
                    : i === step
                      ? "color-mix(in oklab, var(--primary) 30%, transparent)"
                      : "var(--card)",
              }}
            >
              {i < step ? (
                <Check size={14} strokeWidth={3} />
              ) : i === step ? (
                <div className="size-2 rounded-full bg-white animate-pulse" />
              ) : null}
            </div>
            <span className="text-sm font-medium">{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
