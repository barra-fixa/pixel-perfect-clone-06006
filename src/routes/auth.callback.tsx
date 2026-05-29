import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 5000;

function lerParametrosDoCallback() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    code: searchParams.get("code"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
    erro:
      searchParams.get("error_description") ??
      hashParams.get("error_description") ??
      searchParams.get("error") ??
      hashParams.get("error"),
  };
}

async function aguardarSessaoPronta(timeoutMs = SESSION_TIMEOUT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (!userError && userData.user) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (sessionData.session) {
        return sessionData.session;
      }
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (sessionData.session) {
      const { data: hydratedUserData, error: hydratedUserError } = await supabase.auth.getUser();
      if (!hydratedUserError && hydratedUserData.user) {
        return sessionData.session;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>["data"]["subscription"] | null = null;

    async function processar() {
      try {
        const { code, accessToken, refreshToken, erro } = lerParametrosDoCallback();
        if (erro) throw new Error(erro);

        subscription = supabase.auth.onAuthStateChange((_event, session) => {
          if (!cancelado && session?.user) {
            window.location.replace("/home");
          }
        }).data.subscription;

        let sessao = await aguardarSessaoPronta(600);

        if (!sessao && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (!sessao && accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (!sessao && accessToken) {
          const { data: hashSessionData, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!hashSessionData.session) {
            throw new Error("Não foi possível concluir o login. Peça um novo link.");
          }
        }

        sessao = sessao ?? (await aguardarSessaoPronta());

        if (!sessao) {
          throw new Error("Não foi possível concluir o login. Peça um novo link.");
        }

        await new Promise((resolve) => setTimeout(resolve, 0));
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
      subscription?.unsubscribe();
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
