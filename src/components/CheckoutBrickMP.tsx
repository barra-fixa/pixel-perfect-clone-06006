import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { criarAssinaturaMPComToken } from "@/lib/mercadopago.functions";

async function fetchMpPublicKey(): Promise<string> {
  const r = await fetch("/api/public/mp-public-key", { method: "GET" });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Falha ao carregar chave pública (${r.status}) ${t.slice(0, 120)}`);
  }
  const j = (await r.json()) as { publicKey?: string; error?: string };
  if (!j.publicKey) throw new Error(j.error || "Chave pública ausente");
  return j.publicKey;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global { interface Window { MercadoPago?: any } }

const SDK_URL = "https://sdk.mercadopago.com/js/v2";
const PRECOS = { mensal: 17.9, anual: 119.0 } as const;

function loadMpSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.MercadoPago) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
  if (existing) {
    return new Promise((res, rej) => {
      existing.addEventListener("load", () => res());
      existing.addEventListener("error", () => rej(new Error("SDK MP falhou")));
    });
  }
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = SDK_URL; s.async = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error("SDK MP falhou"));
    document.head.appendChild(s);
  });
}

type Props = {
  plano: "mensal" | "anual";
  email: string;
  onClose: () => void;
  onSuccess: (preapprovalId: string) => void;
};

export function CheckoutBrickMP({ plano, email, onClose, onSuccess }: Props) {
  const criar = useServerFn(criarAssinaturaMPComToken);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const brickRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "processing" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const retry = () => {
    setError(null);
    setStatus("loading");
    setAttempt((n) => n + 1);
  };


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMpSdk();
        const publicKey = await fetchMpPublicKey();
        if (cancelled) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mp = new (window as any).MercadoPago(publicKey, { locale: "pt-BR" });
        const bricks = mp.bricks();
        brickRef.current = await bricks.create("cardPayment", "elevo-mp-brick", {
          initialization: {
            amount: PRECOS[plano],
            payer: { email },
          },
          customization: {
            paymentMethods: { maxInstallments: 1 },
            visual: {
              style: { theme: "dark" },
              texts: { formSubmit: "Ativar assinatura — 14 dias grátis" },
              hidePaymentButton: false,
            },
          },
          callbacks: {
            onReady: () => setStatus("ready"),
            onError: (err: unknown) => {
              console.error("[brick] error", err);
              setError("Erro ao carregar o formulário de cartão.");
              setStatus("error");
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSubmit: async ({ formData }: { formData: any }) => {
              setStatus("processing");
              try {
                const cardToken = formData?.token as string;
                const paymentMethodId = formData?.payment_method_id as string | undefined;
                if (!cardToken) throw new Error("Token do cartão não gerado");
                const r = await criar({
                  data: {
                    plano,
                    card_token_id: cardToken,
                    email,
                    payment_method_id: paymentMethodId,
                  },
                });
                toast.success("Assinatura ativada!", {
                  description: "Você tem 14 dias grátis. Cobrança só depois disso.",
                });
                onSuccess(r.preapproval_id);
              } catch (e) {
                const msg = e instanceof Error ? e.message : "Falha ao processar pagamento";
                setError(msg);
                setStatus("ready");
                toast.error("Não foi possível ativar", { description: msg });
                throw e; // brick precisa da rejection
              }
            },
          },
        });
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setError(e instanceof Error ? e.message : "Falha ao carregar checkout");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      try { brickRef.current?.unmount?.(); } catch { /* noop */ }
    };
  }, [plano, email, criar, onSuccess, attempt]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-5 max-h-[92dvh] overflow-y-auto"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black">Ativar Pro {plano === "anual" ? "Anual" : "Mensal"}</h2>
            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              <ShieldCheck size={11} className="inline mr-1" />
              Cartão processado com segurança pelo Mercado Pago
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={status === "processing"}
            className="size-9 rounded-full flex items-center justify-center elevo-card disabled:opacity-50"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center py-16 gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 size={16} className="animate-spin" /> Carregando checkout seguro…
          </div>
        )}
        {status === "error" && (
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="text-sm" style={{ color: "var(--destructive)" }}>
              Não conseguimos abrir o checkout seguro.
            </div>
            <div className="text-[11px] max-w-xs break-words" style={{ color: "var(--muted-foreground)" }}>
              {error ?? "Erro inesperado."}
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={retry}
                className="px-4 py-2 rounded-full text-xs font-bold elevo-card"
              >
                Tentar de novo
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <div id="elevo-mp-brick" ref={containerRef} style={{ display: status === "loading" || status === "error" ? "none" : "block" }} />

        {status === "processing" && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Loader2 size={14} className="animate-spin" /> Confirmando assinatura…
          </div>
        )}

        <p className="mt-4 text-center text-[10px]" style={{ color: "var(--subtle)" }}>
          Você não é cobrado hoje. A primeira cobrança de R${PRECOS[plano].toFixed(2).replace(".", ",")} acontece depois dos 14 dias. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
