import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { processarSessaoDaUrl } from "@/lib/auth-url-session";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function processar() {
      try {
        const sessao = await processarSessaoDaUrl();

        if (!sessao) {
          throw new Error("Não foi possível concluir o login. Peça um novo link.");
        }

        if (!cancelado) {
          window.location.replace("/home");
        }
      } catch (err) {
        if (!cancelado) {
          setErro(err instanceof Error ? err.message : "Erro ao validar link");
        }
      }
    }

    void processar();
    return () => {
      cancelado = true;
    };
  }, [navigate]);

  return (
    <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col items-center justify-center text-center">
      {erro ? (
        <>
          <h1 className="text-xl font-bold">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {erro}
          </p>
          <button
            onClick={() => navigate({ to: "/auth", replace: true })}
            className="btn-primary mt-6 max-w-xs"
          >
            Pedir novo link
          </button>
        </>
      ) : (
        <>
          <div
            className="size-12 rounded-full animate-pulse mb-4"
            style={{ background: "color-mix(in oklab, var(--primary) 30%, transparent)" }}
          />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Validando seu acesso...
          </p>
        </>
      )}
    </div>
  );
}
