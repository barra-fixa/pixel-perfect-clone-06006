// Busca GIFs do ExerciseDB pra cada exercício de barra fixa da tabela `exercicios`
// e persiste em `gif_url_local`. Idempotente: pula linhas que já têm GIF.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Mapeia exercisedb_id (chave manual/custom usada na nossa tabela) -> termo de busca no ExerciseDB.
const SEARCH_BY_EXDB_ID: Record<string, string> = {
  manual_pull_up: "pull up",
  manual_chin_up: "chin up",
  manual_wide_pull_up: "wide grip pull up",
  manual_archer_pull_up: "archer pull up",
  manual_negative_pull_up: "pull up",
  manual_scapular_pull_up: "scapula pull up",
  manual_pull_up_assistido_elastico: "band assisted pull up",
  manual_hanging_knee_raise: "hanging leg raise",
  manual_dead_hang: "dead hang",
  manual_active_hang: "scapula pull up",
  custom_explosive_pullup: "pull up",
  custom_tuck_hold: "hanging leg raise",
};

export const ensureBarraGifs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const apiKey = process.env.RAPIDAPI_KEY;
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
        if (!res.ok) continue;
        const arr = (await res.json()) as Array<{ gifUrl?: string }>;
        const gif = arr[0]?.gifUrl;
        if (!gif) continue;
        const { error } = await supabaseAdmin
          .from("exercicios")
          .update({ gif_url_local: gif })
          .eq("id", r.id);
        if (!error) updated++;
      } catch {
        // ignora erros individuais
      }
    }
    return { ok: true, updated };
  });
