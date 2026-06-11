// Busca GIFs do ExerciseDB pra cada exercício de barra fixa da tabela `exercicios`
// e persiste em `gif_url_local`. Idempotente: pula linhas que já têm GIF.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Mapeia exercisedb_id (chave manual/custom usada na nossa tabela) -> termo de busca no ExerciseDB.
// Termos que dão match no endpoint /exercises/name/{term} do ExerciseDB.
// "dead hang" não existe no catálogo — fica sem GIF.
const SEARCH_BY_EXDB_ID: Record<string, string> = {
  manual_pull_up: "pull up",
  manual_chin_up: "chin-up",
  manual_wide_pull_up: "wide grip pull-up",
  manual_archer_pull_up: "archer pull up",
  manual_negative_pull_up: "pull up",
  manual_scapular_pull_up: "scapular pull-up",
  manual_pull_up_assistido_elastico: "assisted pull-up",
  manual_hanging_knee_raise: "hanging leg raise",
  manual_active_hang: "scapular pull-up",
  custom_explosive_pullup: "pull up",
  custom_tuck_hold: "hanging leg raise",
};
const PROXY_BASE = "/api/public/exercise-gif";

export const ensureBarraGifs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Runtime: Cloudflare Worker (TanStack Start serverFn) → process.env é o correto.
    // Nome real do segredo no projeto: RAPIDAPI_KEY (mantemos RAPID_KEY como fallback).
    const apiKey = process.env.RAPIDAPI_KEY ?? process.env.RAPID_KEY;
    console.log("[barra-gifs] apiKey?", apiKey ? `present(len=${apiKey.length})` : "MISSING");
    const { data: rows } = await context.supabase
      .from("exercicios")
      .select("id, exercisedb_id, gif_url_local")
      .eq("equipment", "barra_fixa_parede")
      .eq("ativo", true);

    const pendentes = (rows ?? []).filter((r) => !r.gif_url_local && r.exercisedb_id);
    if (pendentes.length === 0) return { ok: true, updated: 0 };
    if (!apiKey) return { ok: false, updated: 0, error: "no_api_key" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let updated = 0;

    for (const r of pendentes) {
      const term = SEARCH_BY_EXDB_ID[r.exercisedb_id as string];
      if (!term) continue;
      try {
        const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(term)}?limit=1`;
        const res = await fetch(url, {
          headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": "exercisedb.p.rapidapi.com" },
        });
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          console.error(`[barra-gifs] ${r.exercisedb_id} "${term}" → HTTP ${res.status} ${body.slice(0, 200)}`);
          continue;
        }
        const arr = (await res.json()) as Array<{ gifUrl?: string }>;
        const gif = arr[0]?.gifUrl;
        if (!gif) {
          console.warn(`[barra-gifs] ${r.exercisedb_id} "${term}" → sem gifUrl`);
          continue;
        }
        const { error } = await supabaseAdmin
          .from("exercicios")
          .update({ gif_url_local: gif })
          .eq("id", r.id);
        if (error) console.error(`[barra-gifs] update falhou`, error);
        else updated++;
      } catch (e) {
        console.error(`[barra-gifs] fetch erro`, e);
      }
    }
    return { ok: true, updated };
  });
