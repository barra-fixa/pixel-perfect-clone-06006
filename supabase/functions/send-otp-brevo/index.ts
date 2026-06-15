// Edge function: gera OTP de 6 dígitos via Supabase Admin e envia pelo Brevo.
// Chamada pelo frontend em /auth e /onboarding/email.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;

const SENDER = { name: "Elevo", email: "welder@barrafixa.com" };

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function htmlTemplate(codigo: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
    <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;padding:32px 28px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
      <tr><td>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800">Seu código de acesso</h1>
        <p style="margin:0 0 24px;color:#525866;font-size:14px;line-height:1.5">
          Use o código abaixo para entrar no Elevo. Ele expira em alguns minutos.
        </p>
        <div style="text-align:center;background:#f3f4f6;border-radius:12px;padding:20px;margin:0 0 24px">
          <div style="font-size:36px;font-weight:800;letter-spacing:.5em;color:#111;font-family:'SF Mono',Menlo,Consolas,monospace">${codigo}</div>
        </div>
        <p style="margin:0;color:#7a818c;font-size:12px;line-height:1.5">
          Se você não pediu este código, ignore esta mensagem.
        </p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;color:#9aa0aa;font-size:11px">Elevo · Treine como atleta tático</p>
  </td></tr></table>
</body></html>`;
}

async function enviarBrevo(destinatario: string, codigo: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: destinatario }],
      subject: "Seu código de acesso Elevo",
      htmlContent: htmlTemplate(codigo),
      textContent: `Seu código de acesso Elevo: ${codigo}\n\nSe você não pediu, ignore esta mensagem.`,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Brevo ${res.status}: ${txt}`);
  }
}

async function gerarOtp(email: string, metadata: Record<string, unknown> | null) {
  // Tenta magiclink (usuário existente)
  const link = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (!link.error && link.data?.properties?.email_otp) {
    return link.data.properties.email_otp as string;
  }

  // Se não existir, cria + gera signup OTP
  const msg = link.error?.message?.toLowerCase() ?? "";
  const naoExiste =
    msg.includes("not found") ||
    msg.includes("user not found") ||
    msg.includes("no user");

  if (naoExiste || !link.data?.properties?.email_otp) {
    // Cria via signup link (também gera OTP). Precisa de senha aleatória.
    const senhaAleatoria = crypto.randomUUID() + crypto.randomUUID();
    const signup = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: senhaAleatoria,
      options: {
        data: metadata ?? undefined,
      },
    });
    if (signup.error || !signup.data?.properties?.email_otp) {
      throw new Error(signup.error?.message ?? "Não foi possível gerar código");
    }
    return signup.data.properties.email_otp as string;
  }

  throw new Error(link.error?.message ?? "Falha ao gerar código");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const metadata = (body?.metadata && typeof body.metadata === "object")
      ? (body.metadata as Record<string, unknown>)
      : null;

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: "E-mail inválido" }), {
        status: 400,
        headers: { ...CORS, "content-type": "application/json" },
      });
    }

    const codigo = await gerarOtp(email, metadata);
    await enviarBrevo(email, codigo);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, "content-type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("send-otp-brevo error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...CORS, "content-type": "application/json" },
    });
  }
});
