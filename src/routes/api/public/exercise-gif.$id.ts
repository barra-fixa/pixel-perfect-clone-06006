import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/exercise-gif/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = String(params.id ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
        if (!id) return new Response("bad id", { status: 400 });
        const apiKey = process.env.RAPIDAPI_KEY ?? process.env.RAPID_KEY;
        if (!apiKey) return new Response("no api key", { status: 500 });
        const url = `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(id)}&resolution=360`;
        const res = await fetch(url, {
          headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": "exercisedb.p.rapidapi.com" },
        });
        if (!res.ok) return new Response(`upstream ${res.status}`, { status: res.status });
        const buf = await res.arrayBuffer();
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
