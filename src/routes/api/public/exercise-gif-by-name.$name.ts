// Proxy: resolve um exercício pelo NOME no ExerciseDB e devolve o GIF.
// Permite que o cliente referencie /api/public/exercise-gif-by-name/push-up
// sem precisar pré-popular o gif_url_local no banco.
//
// Cache em memória do worker: <nome normalizado> -> exerciseId | null (negativo).
import { createFileRoute } from "@tanstack/react-router";

const ID_CACHE = new Map<string, { id: string | null; exp: number }>();
const TTL_OK = 24 * 60 * 60 * 1000; // 24h
const TTL_MISS = 10 * 60 * 1000; // 10min

async function resolveId(name: string, apiKey: string): Promise<string | null> {
  const key = name.toLowerCase().trim();
  const hit = ID_CACHE.get(key);
  if (hit && hit.exp > Date.now()) return hit.id;
  try {
    const r = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(key)}?limit=1`,
      { headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": "exercisedb.p.rapidapi.com" } },
    );
    if (!r.ok) {
      ID_CACHE.set(key, { id: null, exp: Date.now() + TTL_MISS });
      return null;
    }
    const arr = (await r.json()) as Array<{ id?: string }>;
    const id = arr[0]?.id ?? null;
    ID_CACHE.set(key, { id, exp: Date.now() + (id ? TTL_OK : TTL_MISS) });
    return id;
  } catch {
    ID_CACHE.set(key, { id: null, exp: Date.now() + TTL_MISS });
    return null;
  }
}

export const Route = createFileRoute("/api/public/exercise-gif-by-name/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = decodeURIComponent(String(params.name ?? "")).slice(0, 80);
        if (!name) return new Response("bad name", { status: 400 });
        const apiKey = process.env.RAPIDAPI_KEY ?? process.env.RAPID_KEY;
        if (!apiKey) return new Response("no api key", { status: 500 });
        const id = await resolveId(name, apiKey);
        if (!id) return new Response("not found", { status: 404 });
        const r = await fetch(
          `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(id)}&resolution=360`,
          { headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": "exercisedb.p.rapidapi.com" } },
        );
        if (!r.ok) return new Response(`upstream ${r.status}`, { status: r.status });
        const buf = await r.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "Content-Type": "image/gif",
            "Cache-Control": "public, max-age=2592000, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
