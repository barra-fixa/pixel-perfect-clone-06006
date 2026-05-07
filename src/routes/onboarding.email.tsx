import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/email")({
  component: EmailPage,
});

function EmailPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [opt, setOpt] = useState(true);

  const valido = nome.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  return (
    <OnboardingShell
      title="Para onde enviamos seu plano?"
      subtitle="Salve seu plano personalizado gratuitamente"
      footer={
        <>
          <button
            className="btn-primary"
            disabled={!valido}
            onClick={() => {
              saveUser({ nome: nome.trim(), email: email.trim() });
              navigate({ to: "/onboarding/preview" });
            }}
          >
            Receber meu plano grátis
          </button>
          <p className="text-center mt-3 text-xs" style={{ color: "var(--subtle)" }}>
            Sem spam. Cancele quando quiser.
          </p>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            Nome
          </label>
          <input
            className="input-field"
            placeholder="Como prefere ser chamado?"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            E-mail
          </label>
          <input
            type="email"
            inputMode="email"
            className="input-field"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <label className="flex items-start gap-3 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={opt}
            onChange={(e) => setOpt(e.target.checked)}
            className="mt-0.5 size-4 accent-[oklch(0.62_0.13_160)]"
          />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Quero receber dicas de treino e ofertas do Elevo
          </span>
        </label>
      </div>
    </OnboardingShell>
  );
}
