import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,
});

const features = [
  ["Treino inicial (7 dias)", true, true],
  ["Vídeos de execução", true, true],
  ["Contador de séries/reps", true, true],
  ["Plano IA personalizado", false, true],
  ["Progressão 12-24 semanas", false, true],
  ["Nutrição completa + receitas", false, true],
  ["Desafios ilimitados", false, true],
  ["Meta: treina = não paga", false, true],
  ["Cupons exclusivos", false, true],
] as const;

function UpgradePage() {
  const navigate = useNavigate();
  return (
    <div className="elevo-shell px-5 pt-5 pb-10 min-h-dvh">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate({ to: "/home" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <h1 className="text-3xl font-black leading-tight">
        Desbloqueie seu
        <br />
        <span style={{ color: "var(--secondary)" }}>potencial completo</span>
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Tudo que você precisa para evoluir de verdade.
      </p>

      {/* tabela */}
      <div className="elevo-card mt-6 overflow-hidden">
        <div
          className="grid grid-cols-[1fr_70px_70px] px-4 py-3 text-xs font-semibold"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span>Recurso</span>
          <span className="text-center" style={{ color: "var(--muted-foreground)" }}>Free</span>
          <span className="text-center" style={{ color: "var(--secondary)" }}>Pro</span>
        </div>
        <ul>
          {features.map(([label, free, pro]) => (
            <li
              key={label}
              className="grid grid-cols-[1fr_70px_70px] px-4 py-2.5 items-center text-sm"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span>{label}</span>
              <span className="flex justify-center">
                {free ? (
                  <Check size={16} style={{ color: "var(--primary)" }} />
                ) : (
                  <X size={16} style={{ color: "var(--subtle)" }} />
                )}
              </span>
              <span className="flex justify-center">
                {pro ? (
                  <Check size={16} style={{ color: "var(--secondary)" }} strokeWidth={3} />
                ) : (
                  <X size={16} style={{ color: "var(--subtle)" }} />
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* card pro */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 25%, var(--card)), var(--card))",
          border: "1.5px solid var(--secondary)",
        }}
      >
        <span className="badge-pro">✦ Recomendado</span>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-black">R$17,90</span>
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            /mês
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          Se bater a meta de treino, o mês é grátis.
        </p>
        <button
          className="btn-primary mt-4"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
          }}
          onClick={() =>
            toast.info("Pagamento em breve 🚀", {
              description: "A ativação do plano Pro estará disponível em breve. Te avisamos por e-mail!",
            })
          }
        >
          Ativar Pro agora
        </button>
      </div>

      {/* anual */}
      <button
        className="mt-3 elevo-card p-4 w-full text-left transition hover:opacity-90"
        onClick={() =>
          toast.info("Pagamento em breve 🚀", {
            description: "O plano anual estará disponível em breve.",
          })
        }
      >
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">Pro Anual</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "color-mix(in oklab, var(--primary) 20%, transparent)",
              color: "var(--primary)",
            }}
          >
            -45%
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold">R$9,90</span>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            /mês · R$119/ano
          </span>
        </div>
      </button>

      <p className="text-center mt-5 text-[10px]" style={{ color: "var(--subtle)" }}>
        Cancele quando quiser. Sem fidelidade.
      </p>
    </div>
  );
}
