import type { Session } from "@supabase/supabase-js";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function digits(v: string) {
  return v.replace(/\D/g, "");
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"form" | "codigo">("form");
  const [codigo, setCodigo] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenviadoMsg, setReenviadoMsg] = useState<string | null>(null);
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

  const enviarCodigo = async (opts?: { silencioso?: boolean }) => {
    setErro(null);
    setReenviadoMsg(null);
    if (opts?.silencioso) setReenviando(true);
    else setLoading(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const { data, error } = await supabase.functions.invoke("send-otp-brevo", {
        body: { email: emailLimpo },
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data && (data as { error?: unknown }).error) {
        throw new Error(String((data as { error: unknown }).error));
      }
      saveUser({ email: emailLimpo });
      if (opts?.silencioso) setReenviadoMsg("Reenviamos. Verifique seu e-mail.");
      else setEtapa("codigo");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setLoading(false);
      setReenviando(false);
    }
  };

  const verificarCodigo = async () => {
    setErro(null);
    setReenviadoMsg(null);
    const token = digits(codigo);
    if (token.length !== 6) {
      setErro("Digite o código de 6 dígitos enviado por e-mail.");
      return;
    }
    setVerificando(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: emailLimpo,
        token,
        type: "email",
      });
      if (error) throw error;
      window.location.replace("/home");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Código inválido ou expirado.");
    } finally {
      setVerificando(false);
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

  if (etapa === "codigo") {
    return (
      <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col">
        <div className="flex-1 flex flex-col items-center text-center">
          <div
            className="size-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <Mail size={36} style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-2xl font-bold">Digite o código</h1>
          <p className="mt-2 text-sm max-w-[320px]" style={{ color: "var(--muted-foreground)" }}>
            Enviamos um código de 6 dígitos para
          </p>
          <p className="mt-1 text-sm font-semibold">{email}</p>

          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="input-field text-center text-2xl tracking-[0.5em] font-semibold max-w-[220px] mt-6"
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(digits(e.target.value).slice(0, 6))}
          />

          <button
            className="btn-primary mt-4 max-w-xs"
            disabled={verificando || digits(codigo).length !== 6}
            onClick={verificarCodigo}
          >
            {verificando ? "Verificando..." : "Entrar"}
          </button>

          <button
            type="button"
            className="mt-3 text-xs underline"
            disabled={reenviando}
            onClick={() => enviarCodigo({ silencioso: true })}
            style={{ color: "var(--muted-foreground)" }}
          >
            {reenviando ? "Reenviando..." : "Reenviar código"}
          </button>
          <button
            type="button"
            className="mt-1 text-[11px] underline"
            style={{ color: "var(--subtle)" }}
            onClick={() => {
              setEtapa("form");
              setCodigo("");
              setErro(null);
              setReenviadoMsg(null);
            }}
          >
            Usar outro e-mail
          </button>

          {erro && (
            <p className="text-center mt-3 text-xs" style={{ color: "var(--destructive)" }}>
              {erro}
            </p>
          )}
          {reenviadoMsg && (
            <p className="text-center mt-3 text-xs" style={{ color: "var(--primary)" }}>
              {reenviadoMsg}
            </p>
          )}

          <p className="mt-6 text-[11px] max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Não recebeu? Verifique spam, lixeira ou promoções.
          </p>
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
          Digite seu e-mail e enviamos um código de 6 dígitos. Sem senha.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviarCodigo();
        }}
        className="mt-8 space-y-4"
      >
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
          {loading ? "Enviando código..." : "Enviar código"}
        </button>

        <p className="text-center text-[11px]" style={{ color: "var(--subtle)" }}>
          Ao continuar, você concorda com nossos termos. Sem cartão de crédito.
        </p>
      </form>
    </div>
  );
}
