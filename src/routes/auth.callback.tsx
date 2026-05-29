import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { processarSessaoDaUrl, temParametrosAuthNaUrl } from "@/lib/auth-url-session";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function irPara(destino: string) {
  if (typeof window !== "undefined") {
    window.location.replace(destino);
  }
}

function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    // Salvaguarda absoluta: nunca deixa o usuário travado mais que 8s.
    const timeoutFallback = window.setTimeout(() => {
      if (!cancelado) irPara("/auth");
    }, 8000);

    async function processar() {
      try {
        // 1) Se já existe sessão, redireciona imediatamente.
        const { data: existente } = await supabase.auth.getSession();
        if (existente.session) {
          irPara("/home");
          return;
        }

        // 2) Sem token nem sessão? Volta para /auth.
        if (!temParametrosAuthNaUrl()) {
          irPara("/auth");
          return;
        }

        // 3) Processa o token (hash ou code) e estabelece a sessão.
        const sessao = await processarSessaoDaUrl();

        if (cancelado) return;

        if (sessao) {
          irPara("/home");
          return;
        }

        // 4) Última tentativa: relê a sessão.
        const { data: novo } = await supabase.auth.getSession();
        if (novo.session) {
          irPara("/home");
          return;
        }

        throw new Error("Não foi possível concluir o login. Peça um novo link.");
      } catch (err) {
        if (!cancelado) {
          setErro(err instanceof Error ? err.message : "Erro ao validar link");
        }
      } finally {
        window.clearTimeout(timeoutFallback);
      }
    }

    void processar();
    return () => {
      cancelado = true;
      window.clearTimeout(timeoutFallback);
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
