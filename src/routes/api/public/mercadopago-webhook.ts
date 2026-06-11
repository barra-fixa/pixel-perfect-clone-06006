import { createFileRoute } from "@tanstack/react-router";

const MP_API = "https://api.mercadopago.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-signature, x-request-id",
};

async function fetchPreapproval(id: string, token: string) {
  const r = await fetch(`${MP_API}/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return (await r.json()) as Record<string, unknown>;
}

async function fetchPayment(id: string, token: string) {
  const r = await fetch(`${MP_API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  return (await r.json()) as Record<string, unknown>;
}

function parseExternalRef(ref: unknown): { userId: string; ciclo: string } | null {
  if (typeof ref !== "string") return null;
  const [userId, ciclo] = ref.split(":");
  if (!userId) return null;
  return { userId, ciclo: ciclo || "mensal" };
}

async function handle(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return new Response("server config", { status: 500, headers: CORS });

  const url = new URL(request.url);
  let body: Record<string, unknown> = {};
  try {
    const raw = await request.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  // MP envia tipo via querystring ou no body
  const type =
    (body.type as string) ||
    (body.topic as string) ||
    url.searchParams.get("type") ||
    url.searchParams.get("topic") ||
    "";
  const dataId =
    ((body.data as { id?: string } | undefined)?.id ?? "") ||
    url.searchParams.get("id") ||
    url.searchParams.get("data.id") ||
    "";
  const eventoId =
    request.headers.get("x-request-id") || `${type}:${dataId}:${Date.now()}`;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Idempotência
  const { data: existente } = await supabaseAdmin
    .from("mp_eventos")
    .select("id")
    .eq("evento_id", eventoId)
    .maybeSingle();
  if (existente) return new Response("ok (dup)", { status: 200, headers: CORS });

  let userId: string | null = null;
  let ciclo = "mensal";
  let novoStatus: string | null = null;
  let plano: "free" | "pro" | null = null;
  let planoInicio: string | null = null;
  let planoFim: string | null = null;
  let payerId: string | null = null;

  if (!dataId) {
    await supabaseAdmin.from("mp_eventos").insert({
      evento_id: eventoId,
      tipo: type,
      resource_id: null,
      payload: body as never,
    });
    return new Response("ok (no id)", { status: 200, headers: CORS });
  }

  if (type.includes("preapproval") || type === "subscription_preapproval") {
    const pre = await fetchPreapproval(dataId, token);
    if (pre) {
      const ref = parseExternalRef(pre.external_reference);
      if (ref) {
        userId = ref.userId;
        ciclo = ref.ciclo;
      }
      novoStatus = (pre.status as string) ?? null;
      payerId = (pre.payer_id as string) ?? null;
      if (novoStatus === "authorized") {
        plano = "pro";
        planoInicio = new Date().toISOString();
        // fim = +30 dias (mensal) ou +365 (anual) a partir do trial; aqui marcamos próxima cobrança a partir de hoje
        const dias = ciclo === "anual" ? 365 + 14 : 30 + 14;
        planoFim = new Date(Date.now() + dias * 86400000).toISOString();
      } else if (
        novoStatus === "cancelled" ||
        novoStatus === "paused"
      ) {
        plano = "free";
        planoFim = new Date().toISOString();
      }
    }
  } else if (type === "payment" || type.includes("payment")) {
    const pay = await fetchPayment(dataId, token);
    if (pay) {
      const ref = parseExternalRef(pay.external_reference);
      if (ref) {
        userId = ref.userId;
        ciclo = ref.ciclo;
      }
      const status = pay.status as string;
      novoStatus = `payment:${status}`;
      if (status === "approved") {
        plano = "pro";
        planoInicio = new Date().toISOString();
        const dias = ciclo === "anual" ? 365 : 30;
        planoFim = new Date(Date.now() + dias * 86400000).toISOString();
      } else if (status === "rejected" || status === "cancelled") {
        // não rebaixa automaticamente em uma única falha — aguardar evento da preapproval
      }
    }
  }

  if (userId) {
    const update: Record<string, unknown> = {};
    if (plano) update.plano = plano;
    if (novoStatus) update.mp_status = novoStatus;
    if (planoInicio) update.plano_inicio = planoInicio;
    if (planoFim) update.plano_fim = planoFim;
    if (payerId) update.mp_payer_id = payerId;
    if (ciclo) update.plano_ciclo = ciclo;
    if (Object.keys(update).length > 0) {
      await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    }
  }

  await supabaseAdmin.from("mp_eventos").insert({
    evento_id: eventoId,
    tipo: type,
    resource_id: dataId,
    user_id: userId,
    payload: body,
  });

  return new Response("ok", { status: 200, headers: CORS });
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => handle(request),
      GET: async ({ request }) => handle(request),
    },
  },
});
