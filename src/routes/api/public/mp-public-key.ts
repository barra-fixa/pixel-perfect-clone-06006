import { createFileRoute } from "@tanstack/react-router";

// Public key do Mercado Pago é PÚBLICA por definição (vai pro browser
// no checkout). Expor via server route evita o problema de serverFn com
// hash dessincronizado entre client e server no build publicado.
export const Route = createFileRoute("/api/public/mp-public-key")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env.MERCADOPAGO_PUBLIC_KEY?.trim();
        if (!key) {
          return Response.json(
            { error: "MERCADOPAGO_PUBLIC_KEY não configurada" },
            { status: 500 },
          );
        }
        const env = key.startsWith("TEST-")
          ? "sandbox"
          : key.startsWith("APP_USR-")
          ? "live"
          : "unknown";
        return Response.json(
          { publicKey: key, env },
          { headers: { "cache-control": "public, max-age=300" } },
        );
      },
    },
  },
});
