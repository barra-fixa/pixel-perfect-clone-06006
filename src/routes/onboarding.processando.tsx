import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { loadUser } from "@/lib/elevo-store";
import { getPlanoSemanal } from "@/lib/treinos";

export const Route = createFileRoute("/onboarding/processando")({
  component: ProcessandoPage,
});

const OBJETIVO_LABEL: Record<string, string> = {
  forca: "Ganhar força",
  emagrecer: "Emagrecer",
  taf: "Passar no TAF",
  saude: "Saúde",
  definicao: "Definição",
  zero: "Começar do zero",
};

/**
 * Tela de "processando" entre o onboarding e a captura de email.
 *
 * Filosofia: mensagens 100% honestas que descrevem o que o app está REALMENTE
 * fazendo, e que referenciam as escolhas do usuário pra reforçar o sunk cost
 * antes de pedir o email. Sem promessas vagas ou estatísticas inventadas.
 *
 * Variação aplicada (mista):
 *  - passo 1: "Analisando seu perfil..."
 *  - passo 2: resumo das escolhas em uma linha (objetivo · caminho · frequência)
 *  - passo 3: "Selecionando N exercícios pra você..." (N real, vem de getPlanoSemanal)
 *  - passo 4: "Seu plano está pronto. Onde te envio?" (prepara o pedido de email)
 */
function ProcessandoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Lê o user e calcula os passos dinamicamente uma única vez no mount.
  const passos = useMemo(() => {
    const u = loadUser();

    const objetivoTxt = u.objetivo ? OBJETIVO_LABEL[u.objetivo] : "seu objetivo";
    const caminhoTxt =
      u.caminho === "barra" ? "Barra Fixa" : u.caminho === "casa" ? "Em casa" : "seu caminho";
    const freqTxt = u.frequencia ? `${u.frequencia}x/semana` : "rotina escolhida";

    // Conta exercícios reais que serão gerados pra esse usuário.
    let totalExercicios = 0;
    try {
      const plano = getPlanoSemanal(u);
      totalExercicios = plano.reduce((sum, t) => sum + t.exercicios.length, 0);
    } catch {
      // fallback: sem dados ainda, usa estimativa
      totalExercicios = (u.frequencia ?? 3) * 4;
    }

    return [
      "Analisando seu perfil...",
      `✓ ${objetivoTxt} · ${caminhoTxt} · ${freqTxt}`,
      `Selecionando ${totalExercicios} exercícios pra você...`,
      "Seu plano está pronto. Onde te envio?",
    ];
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, passos.length - 1));
    }, 850);
    const timeout = setTimeout(() => navigate({ to: "/onboarding/email" }), 3600);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate, passos.length]);

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
            key={i}
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
