import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding/email")({
  component: EmailPage,
});

function EmailPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [opt, setOpt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const valido =
    nome.trim().length >= 2 && /\S+@\S+\.\S+/.test(email) && senha.length >= 1;

  const handleSubmit = async () => {
    setErro(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding/preview`,
          data: { nome: nome.trim() },
        },
      });
      if (error) {
        // Se já existe, tenta logar com a senha informada
        if ((error as { code?: string }).code === "user_already_exists") {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: senha,
          });
          if (signInErr) {
            setErro("Esse e-mail já tem conta. Verifique a senha ou faça login.");
            return;
          }
        } else {
          throw error;
        }
      }
      saveUser({ nome: nome.trim(), email: email.trim() });
      navigate({ to: "/onboarding/preview" });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível criar a conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingShell
      title="Para onde enviamos seu plano?"
      subtitle="Crie sua conta grátis para salvar seu plano"
      footer={
        <>
          <button className="btn-primary" disabled={!valido || loading} onClick={handleSubmit}>
            {loading ? "Criando..." : "Receber meu plano grátis"}
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
            className="input-field"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            Senha
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
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
