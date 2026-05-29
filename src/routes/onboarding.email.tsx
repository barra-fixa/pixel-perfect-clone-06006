import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding/email")({
  component: EmailPage,
});

function EmailPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [opt, setOpt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const valido = nome.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setErro(null);
    setLoading(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const nomeLimpo = nome.trim();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { nome: nomeLimpo },
        },
      });
      if (error) throw error;
      saveUser({ nome: nomeLimpo, email: emailLimpo });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar o link");
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <OnboardingShell
        title="Verifique seu email"
        subtitle={`Enviamos um link de acesso para ${email}`}
        footer={
          <button
            onClick={() => {
              setEnviado(false);
              setErro(null);
            }}
            className="btn-ghost w-full"
          >
            Usar outro email
          </button>
        }
      >
        <div className="flex flex-col items-center text-center py-6">
          <div
            className="size-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <Mail size={36} style={{ color: "var(--primary)" }} />
          </div>
          <p className="text-xs max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Abra o email e toque no link para entrar. Pode demorar até 1 minuto pra chegar.
          </p>
          <p className="mt-3 text-xs max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Não recebeu? Verifique a caixa de spam, lixeira ou promoções.
          </p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="Para onde enviamos seu plano?"
      subtitle="Sem senha. Enviamos um link de acesso pro seu email."
      footer={
        <>
          <button className="btn-primary" disabled={!valido || loading} onClick={handleSubmit}>
            {loading ? "Enviando link..." : "Receber meu plano grátis"}
          </button>
          {erro && (
            <p className="text-center mt-2 text-xs" style={{ color: "var(--destructive)" }}>
              {erro}
            </p>
          )}
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
            autoComplete="email"
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
