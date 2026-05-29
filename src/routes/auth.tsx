import type { Session } from "@supabase/supabase-js";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let ativo = true;

    const redirecionarSeAutenticado = (session: Session | null) => {
      if (!ativo || !session?.user) return false;
      navigate({ to: "/home", replace: true });
      return true;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (redirecionarSeAutenticado(session)) return;
      if (ativo) setCheckingSession(false);
    });

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (redirecionarSeAutenticado(data.session)) return;
        if (ativo) setCheckingSession(false);
      })
      .catch(() => {
        if (ativo) setCheckingSession(false);
      });

    return () => {
      ativo = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      saveUser({ email: emailLimpo });
      setEnviado(true);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col items-center justify-center text-center">
        <div
          className="size-12 rounded-full animate-pulse mb-4"
          style={{ background: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
        />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Carregando...
        </p>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div
            className="size-20 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background:
                "color-mix(in oklab, var(--primary) 18%, transparent)",
            }}
          >
            <Mail size={36} style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-2xl font-bold">Verifique seu email</h1>
          <p className="mt-3 text-sm max-w-[300px]" style={{ color: "var(--muted-foreground)" }}>
            Enviamos um link de acesso para
          </p>
          <p className="mt-1 text-sm font-semibold">{email}</p>
          <p className="mt-6 text-xs max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Abra o email e toque no link para entrar. Pode demorar até 1 minuto pra chegar.
          </p>
          <p className="mt-3 text-xs max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Não recebeu? Verifique a caixa de spam, lixeira ou promoções.
          </p>

          <button
            onClick={() => {
              setEnviado(false);
              setErro(null);
            }}
            className="mt-8 text-sm"
            style={{ color: "var(--primary)" }}
          >
            Usar outro email
          </button>
        </div>

        <Link to="/" className="mt-4 text-center text-xs" style={{ color: "var(--subtle)" }}>
          ← Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col">
      <Link to="/" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="mt-10 text-center">
        <h1 className="text-3xl font-black">Entrar no Elevo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Digite seu email e enviamos um link de acesso. Sem senha.
        </p>
      </div>

      <form onSubmit={handleEnviar} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            E-mail
          </label>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        {erro && (
          <p className="text-xs" style={{ color: "var(--destructive)" }}>
            {erro}
          </p>
        )}

        <button className="btn-primary" disabled={loading || !email}>
          {loading ? "Enviando link..." : "Entrar"}
        </button>

        <p className="text-center text-[11px]" style={{ color: "var(--subtle)" }}>
          Ao continuar, você concorda com nossos termos. Sem cartão de crédito.
        </p>
      </form>
    </div>
  );
}
