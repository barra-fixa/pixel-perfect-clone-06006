import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import webpush from "web-push";

function setupVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:noreply@elevo.app";
  if (!pub || !priv) throw new Error("VAPID keys missing");
  webpush.setVapidDetails(subject, pub, priv);
}

export const Route = createFileRoute("/api/public/hooks/send-reminders")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          setupVapid();

          const url = new URL(request.url);
          const now = new Date();
          // Convert UTC hour to Brasília (UTC-3). Users save horario in BR local time.
          const hourParam = url.searchParams.get("hour");
          const brHour = (now.getUTCHours() - 3 + 24) % 24;
          const hh = (hourParam ?? String(brHour).padStart(2, "0")).padStart(2, "0");

          // Find profiles opted-in for treino reminders at this hour
          const { data: profiles, error: profErr } = await supabaseAdmin
            .from("profiles")
            .select("id, nome, notificacoes")
            .filter("notificacoes->>treino", "eq", "true")
            .filter("notificacoes->>horario", "like", `${hh}:%`);

          if (profErr) {
            return Response.json({ error: profErr.message }, { status: 500 });
          }

          const userIds = (profiles ?? []).map((p) => p.id);
          if (userIds.length === 0) {
            return Response.json({ ok: true, matched: 0, sent: 0 });
          }

          const { data: subs, error: subErr } = await supabaseAdmin
            .from("push_subscriptions")
            .select("id, user_id, endpoint, p256dh, auth")
            .in("user_id", userIds);

          if (subErr) {
            return Response.json({ error: subErr.message }, { status: 500 });
          }

          const payload = JSON.stringify({
            title: "Hora do treino 💪",
            body: "Bora elevar mais um dia. Seu treino está pronto!",
            url: "/home",
            tag: "treino-diario",
          });

          const stale: string[] = [];
          const results = await Promise.allSettled(
            (subs ?? []).map((s) =>
              webpush.sendNotification(
                { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
                payload
              )
            )
          );
          results.forEach((r, i) => {
            if (r.status === "rejected") {
              const code = (r.reason as { statusCode?: number })?.statusCode;
              if (code === 404 || code === 410) stale.push(subs![i].id);
            }
          });
          if (stale.length) {
            await supabaseAdmin.from("push_subscriptions").delete().in("id", stale);
          }
          const sent = results.filter((r) => r.status === "fulfilled").length;

          return Response.json({
            ok: true,
            hour: hh,
            matched: userIds.length,
            sent,
            removed: stale.length,
          });
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
