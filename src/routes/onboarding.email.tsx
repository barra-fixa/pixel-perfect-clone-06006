import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { OnboardingShell } from "@/components/OnboardingShell";
import { saveUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding/email")({
  component: ContatoPage,
});

/** Aceita formatos BR: (11) 91234-5678, 11912345678, +55 11 91234-5678 etc. */
function digits(v: string) {
  return v.replace(/\D/g, "");
}
function formatBR(v: string) {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function whatsappValido(v: string) {
  const d = digits(v);
  return d.length === 10 || d.length === 11;
}

function ContatoPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [consentimento, setConsentimento] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<"form" | "codigo">("form");
  const [codigo, setCodigo] = useState("");
  const [reenviando, setReenviando] = useState(false);
  const [reenviadoMsg, setReenviadoMsg] = useState<string | null>(null);

  const emailOk = /\S+@\S+\.\S+/.test(email);
  const nomeOk = nome.trim().length >= 2;
  const whatsOpcionalOk = whatsapp.trim() === "" || whatsappValido(whatsapp);
  const valido = nomeOk && emailOk && whatsOpcionalOk && consentimento;
  const codigoOk = /^\d{6}$/.test(codigo);

  const destinoPosLogin = () => {
    try {
      const urlAtual = new URL(window.location.href);
      const nextParam = urlAtual.searchParams.get("next");
      if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
        return nextParam;
      }
    } catch {
      /* ignora */
    }
    return "/onboarding/preview";
  };

  const enviarCodigo = async () => {
    setErro(null);
    setReenviadoMsg(null);
    setLoading(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const nomeLimpo = nome.trim();
      const whatsLimpo = whatsapp.trim() ? `+55${digits(whatsapp)}` : "";

      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: {
          shouldCreateUser: true,
          data: { nome: nomeLimpo, whatsapp: whatsLimpo || null },
        },
      });
      if (error) throw error;
      saveUser({
        nome: nomeLimpo,
        email: emailLimpo,
        whatsapp: whatsLimpo || undefined,
      });
      setEtapa("codigo");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível enviar o código");
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    setErro(null);
    setLoading(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const { error } = await supabase.auth.verifyOtp({
        email: emailLimpo,
        token: codigo.trim(),
        type: "email",
      });
      if (error) throw error;
      navigate({ to: destinoPosLogin() });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Código inválido ou expirado");
    } finally {
      setLoading(false);
    }
  };

  const reenviarCodigo = async () => {
    setErro(null);
    setReenviadoMsg(null);
    setReenviando(true);
    try {
      const emailLimpo = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: emailLimpo,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setReenviadoMsg("Código reenviado. Verifique seu e-mail.");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível reenviar o código");
    } finally {
      setReenviando(false);
    }
  };

  if (etapa === "codigo") {
    return (
      <OnboardingShell
        title="Digite o código"
        subtitle={`Enviamos um código de 6 dígitos para ${email}`}
        footer={
          <>
            <button className="btn-primary" disabled={!codigoOk || loading} onClick={verificarCodigo}>
              {loading ? "Verificando..." : "Confirmar e continuar"}
            </button>
            <button
              type="button"
              className="btn-ghost w-full mt-2"
              disabled={reenviando}
              onClick={reenviarCodigo}
            >
              {reenviando ? "Reenviando..." : "Reenviar código"}
            </button>
            <button
              type="button"
              className="w-full mt-2 text-[11px] underline"
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
              <p className="text-center mt-2 text-xs" style={{ color: "var(--destructive)" }}>
                {erro}
              </p>
            )}
            {reenviadoMsg && (
              <p className="text-center mt-2 text-xs" style={{ color: "var(--primary)" }}>
                {reenviadoMsg}
              </p>
            )}
          </>
        }
      >
        <div className="flex flex-col items-center text-center py-4">
          <div
            className="size-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
          >
            <Mail size={28} style={{ color: "var(--primary)" }} />
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="input-field text-center text-2xl tracking-[0.5em] font-semibold"
            style={{ letterSpacing: "0.5em" }}
          />
          <p className="mt-3 text-[11px] max-w-[280px]" style={{ color: "var(--subtle)" }}>
            Não recebeu? Verifique a caixa de spam, lixeira ou promoções. O código vale por alguns minutos.
          </p>
        </div>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      title="Quase lá — onde te envio?"
      subtitle="Te mando o plano no e-mail e te lembro de treinar no WhatsApp."
      footer={
        <>
          <button className="btn-primary" disabled={!valido || loading} onClick={enviarCodigo}>
            {loading ? "Enviando código..." : "Receber meu código por e-mail"}
          </button>
          {erro && (
            <p className="text-center mt-2 text-xs" style={{ color: "var(--destructive)" }}>
              {erro}
            </p>
          )}
          <p className="text-center mt-3 text-[10px] leading-relaxed" style={{ color: "var(--subtle)" }}>
            Ao continuar você aceita receber comunicações do Elevo conforme a LGPD.
            Seus dados ficam só com a gente, nunca vendidos.
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
        <div>
          <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
            <MessageCircle size={12} /> WhatsApp
          </label>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            className="input-field"
            placeholder="(11) 91234-5678"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatBR(e.target.value))}
          />
          {whatsapp && !whatsOpcionalOk && (
            <p className="text-[10px] mt-1" style={{ color: "var(--destructive)" }}>
              Telefone inválido — use DDD + número (10 ou 11 dígitos).
            </p>
          )}
        </div>
        <label className="flex items-start gap-3 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consentimento}
            onChange={(e) => setConsentimento(e.target.checked)}
            className="mt-0.5 size-4 accent-[oklch(0.62_0.13_160)]"
          />
          <span className="text-[11px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
            Autorizo o Elevo a me enviar o plano, lembretes de treino e dicas por e-mail
            {whatsapp ? " e WhatsApp" : ""}. Posso cancelar quando quiser.
          </span>
        </label>
      </div>
    </OnboardingShell>
  );
}
