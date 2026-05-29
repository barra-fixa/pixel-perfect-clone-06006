import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        // supabase-js processa o hash do magic link automaticamente
        // (detectSessionInUrl está ligado por padrão). Damos um tick e checamos.
        await new Promise((r) => setTimeout(r, 50));

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session) {
          if (!cancelado) navigate({ to: "/home", replace: true });
          return;
        }

        // Aguarda o evento de auth caso o processamento do hash demore
        const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
          if (sess && !cancelado) {
            sub.subscription.unsubscribe();
            navigate({ to: "/home", replace: true });
          }
        });

        // Timeout de segurança
        setTimeout(() => {
          if (cancelado) return;
          supabase.auth.getSession().then(({ data: d }) => {
            if (cancelado) return;
            if (d.session) navigate({ to: "/home", replace: true });
            else setErro("Não foi possível validar o link. Tente novamente.");
          });
        }, 4000);
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
