import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMpPublicKey = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const key = process.env.MERCADOPAGO_PUBLIC_KEY?.trim();
    if (!key) throw new Error("MERCADOPAGO_PUBLIC_KEY não configurada");
    return { publicKey: key };
  });


const PRECOS = {
  mensal: { amount: 17.9, frequency: 1, frequency_type: "months" as const, reason: "Elevo Pro Mensal" },
  anual: { amount: 119.0, frequency: 12, frequency_type: "months" as const, reason: "Elevo Pro Anual" },
};

const MP_API = "https://api.mercadopago.com";

function getOrigin(): string {
  const env = process.env.PUBLIC_APP_URL || process.env.VITE_PUBLIC_APP_URL;
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/$/, "");
  // Fallback seguro: nunca hardcode de outro projeto. Se PUBLIC_APP_URL não
  // estiver setado, usamos o domínio publicado atual como último recurso.
  // (Em preview isso será sobrescrito quando o secret for configurado.)
  return "https://pixel-perfect-clone-06006.lovable.app";
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
    const rawToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const token = rawToken?.trim();
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");

    console.log("[mp] token info", {
      length: token.length,
      prefix: token.slice(0, 12),
      suffix: token.slice(-4),
      env: token.startsWith("TEST-") ? "sandbox" : token.startsWith("APP_USR-") ? "live" : "unknown",
    });

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
    const rawBody = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(rawBody) as Record<string, unknown>; } catch { /* not json */ }
    if (!res.ok) {
      console.error("[mp] criar preapproval falhou", {
        status: res.status,
        statusText: res.statusText,
        body: rawBody,
      });
      throw new Error(
        `Mercado Pago retornou ${res.status}: ${(json as { message?: string }).message ?? rawBody.slice(0, 200)}`
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

/**
 * Checkout transparente: cria preapproval usando um card_token_id gerado
 * pelo Bricks/SDK v2 no próprio app. Assina sem redirecionar pro MP.
 */
export const criarAssinaturaMPComToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plano: z.enum(["mensal", "anual"]),
        card_token_id: z.string().min(8),
        email: z.string().email(),
        payment_method_id: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
    if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");

    const { userId } = context;
    const cfg = PRECOS[data.plano];
    const origin = getOrigin();

    const body = {
      reason: cfg.reason,
      external_reference: `${userId}:${data.plano}`,
      payer_email: data.email,
      card_token_id: data.card_token_id,
      back_url: `${origin}/perfil?assinatura=ok`,
      auto_recurring: {
        frequency: cfg.frequency,
        frequency_type: cfg.frequency_type,
        transaction_amount: cfg.amount,
        currency_id: "BRL",
        free_trial: { frequency: 14, frequency_type: "days" },
      },
      status: "authorized",
    };

    const res = await fetch(`${MP_API}/preapproval`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const rawBody = await res.text();
    let json: Record<string, unknown> = {};
    try { json = JSON.parse(rawBody) as Record<string, unknown>; } catch { /* not json */ }
    if (!res.ok) {
      console.error("[mp] preapproval c/ token falhou", {
        status: res.status, body: rawBody,
      });
      const msg = (json as { message?: string }).message ?? rawBody.slice(0, 200);
      throw new Error(`Mercado Pago retornou ${res.status}: ${msg}`);
    }

    const preapproval_id = json.id as string;
    const status = (json.status as string) || "authorized";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("profiles")
      .update({
        plano_ciclo: data.plano,
        mp_preapproval_id: preapproval_id,
        mp_status: status,
      })
      .eq("id", userId);

    return { preapproval_id, status };
  });


export const cancelarAssinaturaMP = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const rawToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const token = rawToken?.trim();
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
