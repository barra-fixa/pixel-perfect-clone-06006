import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PRECOS = {
  mensal: { amount: 17.9, frequency: 1, frequency_type: "months" as const, reason: "Elevo Pro Mensal" },
  anual: { amount: 119.0, frequency: 12, frequency_type: "months" as const, reason: "Elevo Pro Anual" },
};

const MP_API = "https://api.mercadopago.com";

function getOrigin(): string {
  return (
    process.env.PUBLIC_APP_URL ||
    process.env.VITE_PUBLIC_APP_URL ||
    "https://pixel-perfect-clone-06006.lovable.app"
  );
}

export const criarAssinaturaMP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plano: z.enum(["mensal", "anual"]),
        email: z.string().email().optional(),
        nome: z.string().max(120).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");

    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, nome")
      .eq("id", userId)
      .maybeSingle();

    const payerEmail = data.email || profile?.email;
    if (!payerEmail) throw new Error("Email do usuário não disponível");

    const cfg = PRECOS[data.plano];
    const origin = getOrigin();

    const body = {
      reason: cfg.reason,
      external_reference: `${userId}:${data.plano}`,
      payer_email: payerEmail,
      back_url: `${origin}/perfil?assinatura=ok`,
      auto_recurring: {
        frequency: cfg.frequency,
        frequency_type: cfg.frequency_type,
        transaction_amount: cfg.amount,
        currency_id: "BRL",
        free_trial: { frequency: 14, frequency_type: "days" },
      },
      status: "pending",
    };

    const res = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      console.error("[mp] criar preapproval falhou", res.status, json);
      throw new Error(
        `Mercado Pago retornou ${res.status}: ${(json as { message?: string }).message ?? "erro"}`
      );
    }

    const init_point = (json.init_point as string) || (json.sandbox_init_point as string);
    const preapproval_id = json.id as string;

    // Pré-grava intent (status pending)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({
        plano_ciclo: data.plano,
        mp_preapproval_id: preapproval_id,
        mp_status: "pending",
      })
      .eq("id", userId);

    return { init_point, preapproval_id };
  });

export const cancelarAssinaturaMP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("mp_preapproval_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.mp_preapproval_id) throw new Error("Nenhuma assinatura ativa");

    const res = await fetch(`${MP_API}/preapproval/${profile.mp_preapproval_id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Cancelamento falhou (${res.status}): ${t}`);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({ mp_status: "cancelled", plano: "free", plano_fim: new Date().toISOString() })
      .eq("id", userId);
    return { ok: true };
  });
