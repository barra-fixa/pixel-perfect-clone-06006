import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronLeft, X, Sparkles, Loader2, CreditCard, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useElevoUser } from "@/lib/elevo-store";
import { pitchProPorObjetivo } from "@/lib/objetivo-labels";
import { criarAssinaturaMP } from "@/lib/mercadopago.functions";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,
});


type Linha = readonly [string, boolean, boolean, string?];
const features: readonly Linha[] = [
  ["Treino inicial (7 dias)", true, true],
  ["Contador de séries/reps", true, true],
  ["Treinos Só Barra Fixa", true, true],
  ["Vídeos de execução", false, false, "em breve"],
  ["Plano IA personalizado", false, true],
  ["Progressão 12-24 semanas", false, true],
  ["Dieta com IA + receitas", false, true],
  ["Desafios ilimitados", false, true],
  ["Meta: treina = mês grátis", false, true],
  ["Cupons exclusivos", false, true],
] as const;

function UpgradePage() {
  const navigate = useNavigate();
  const user = useElevoUser();
  const pitch = pitchProPorObjetivo(user.objetivo);
  const criar = useServerFn(criarAssinaturaMP);
  const [loading, setLoading] = useState<null | "mensal" | "anual">(null);
  const [emailPagamento, setEmailPagamento] = useState(user.email ?? "");
  const [editandoEmail, setEditandoEmail] = useState(false);
  const emailPagamentoOk = /\S+@\S+\.\S+/.test(emailPagamento.trim());

  async function ativar(plano: "mensal" | "anual") {
    const emailLimpo = emailPagamento.trim().toLowerCase();
    if (!emailPagamentoOk) {
      toast.error("E-mail de pagamento inválido", { description: "Confira o e-mail antes de continuar." });
      return;
    }
    setLoading(plano);
    try {
      const r = await criar({ data: { plano, email: emailLimpo, nome: user.nome } });
      window.location.href = r.init_point;
    } catch (e) {
      toast.error("Não foi possível iniciar a assinatura", {
        description: e instanceof Error ? e.message : "Tente novamente em instantes.",
      });
      setLoading(null);
    }
  }

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
        Destrave seu plano completo
        <br />
        <span style={{ color: "var(--secondary)" }}>+ dieta gerada por IA</span>
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        {pitch}
      </p>

      {/* Mecânica clara — 14 dias grátis */}
      <div
        className="mt-5 rounded-2xl p-4"
        style={{
          background: "color-mix(in oklab, var(--primary) 16%, var(--card))",
          border: "1px solid color-mix(in oklab, var(--primary) 40%, var(--border))",
        }}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-black" style={{ color: "var(--primary)" }}>
            14 dias
          </span>
          <span className="text-sm font-bold">grátis</span>
        </div>
        <ul className="space-y-1.5 text-xs mt-2">
          <li className="flex gap-2"><Check size={14} style={{ color: "var(--primary)" }} /> Você só é cobrado depois dos 14 dias.</li>
          <li className="flex gap-2"><Check size={14} style={{ color: "var(--primary)" }} /> Se bater sua meta de treino no mês, o mês é grátis.</li>
          <li className="flex gap-2"><Check size={14} style={{ color: "var(--primary)" }} /> Cancela em 1 toque, sem ligação.</li>
        </ul>
      </div>

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
          {features.map(([label, free, pro, badge]) => (
            <li
              key={label}
              className="grid grid-cols-[1fr_70px_70px] px-4 py-2.5 items-center text-sm"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <span>
                {label}
                {badge && (
                  <span
                    className="ml-1.5 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "var(--card-elevated)", color: "var(--muted-foreground)" }}
                  >
                    {badge}
                  </span>
                )}
              </span>
              <span className="flex justify-center">
                {free ? <Check size={16} style={{ color: "var(--primary)" }} /> : <X size={16} style={{ color: "var(--subtle)" }} />}
              </span>
              <span className="flex justify-center">
                {pro ? <Check size={16} style={{ color: "var(--secondary)" }} strokeWidth={3} /> : <X size={16} style={{ color: "var(--subtle)" }} />}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* E-mail de pagamento — escondido por padrão, usa e-mail de login automaticamente */}
      <div className="mt-6">
        {!editandoEmail ? (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setEditandoEmail(true)}
              className="text-xs underline"
              style={{ color: "var(--muted-foreground)" }}
            >
              Pagar com outro e-mail
            </button>
          </div>
        ) : (
          <div className="elevo-card p-4">
            <label
              htmlFor="email-pagamento"
              className="text-xs font-semibold block"
              style={{ color: "var(--muted-foreground)" }}
            >
              E-mail de pagamento
            </label>
            <input
              id="email-pagamento"
              type="email"
              inputMode="email"
              autoComplete="email"
              className="input-field mt-1.5"
              placeholder="seu@email.com"
              value={emailPagamento}
              onChange={(e) => setEmailPagamento(e.target.value)}
            />
            <p className="mt-1.5 text-[10px] leading-relaxed" style={{ color: "var(--subtle)" }}>
              Use o e-mail da sua conta Mercado Pago, se preferir.
            </p>
            {emailPagamento && !emailPagamentoOk && (
              <p className="mt-1 text-[10px]" style={{ color: "var(--destructive)" }}>
                E-mail inválido.
              </p>
            )}
          </div>
        )}
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
        <span className="badge-pro"><Sparkles size={11} className="inline mr-1" /> Recomendado</span>
        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-black">R$17,90</span>
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            /mês — só depois dos 14 dias
          </span>
        </div>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          Treina = mês grátis. Cancela quando quiser.
        </p>
        <button
          className="btn-primary mt-4 disabled:opacity-60"
          style={{
            background:
              "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
          }}
          disabled={loading !== null}
          onClick={() => ativar("mensal")}
        >
          {loading === "mensal" ? (
            <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Abrindo checkout…</span>
          ) : (
            "Ativar Pro — 14 dias grátis"
          )}
        </button>
        <div className="mt-2 flex items-center justify-center gap-3 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          <span className="inline-flex items-center gap-1"><CreditCard size={11}/> Cartão</span>
          <span className="inline-flex items-center gap-1" style={{ color: "var(--secondary)" }}>
            <QrCode size={11}/> <strong>Pix automático</strong>
          </span>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: "var(--subtle)" }}>
          Sem cobrança hoje · só é cobrado depois dos 14 dias · treina = mês grátis
        </p>
      </div>

      {/* anual */}
      <button
        className="mt-3 elevo-card p-4 w-full text-left transition hover:opacity-90 disabled:opacity-60"
        disabled={loading !== null}
        onClick={() => ativar("anual")}
      >
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">
            Pro Anual {loading === "anual" && <Loader2 size={12} className="inline animate-spin ml-1" />}
          </span>
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
            /mês · R$119/ano · 14 dias grátis
          </span>
        </div>
      </button>


      <p className="text-center mt-5 text-[10px]" style={{ color: "var(--subtle)" }}>
        Cancele quando quiser. Sem fidelidade.
      </p>
    </div>
  );
}
