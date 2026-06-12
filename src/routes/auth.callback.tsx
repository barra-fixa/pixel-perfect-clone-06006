import type { Session } from "@supabase/supabase-js";
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

/**
 * Apos magic link: prioriza o parametro ?next= da URL (funciona mesmo quando
 * o link abre em outro browser/dispositivo). Fallback: flag de localStorage
 * (mesmo browser). Default: /home.
 */
function destinoPosLogin(): string {
  if (typeof window === "undefined") return "/home";
  try {
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      // consome fallbacks locais
      try {
        localStorage.removeItem("elevo:pending-pro-offer");
        localStorage.removeItem("elevo:post-login-next");
      } catch {
        // ignora
      }
      return next;
    }
    const nextLocal = localStorage.getItem("elevo:post-login-next");
    if (nextLocal && nextLocal.startsWith("/") && !nextLocal.startsWith("//")) {
      localStorage.removeItem("elevo:post-login-next");
      localStorage.removeItem("elevo:pending-pro-offer");
      return nextLocal;
    }
    const pendente = localStorage.getItem("elevo:pending-pro-offer");
    if (pendente === "1") {
      localStorage.removeItem("elevo:pending-pro-offer");
      return "/onboarding/preview";
    }
  } catch {
    // ignora storage indisponivel
  }
  return "/home";
}

function temTokenDeSessaoNoHash() {
  if (typeof window === "undefined") return false;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return Boolean(
    hashParams.get("access_token") ||
      hashParams.get("refresh_token") ||
      hashParams.get("error") ||
      hashParams.get("error_description"),
  );
}

async function aguardarSessaoNoCallback(timeoutMs: number): Promise<Session | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      return data.session;
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  return null;
}

function AuthCallback() {
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    let timeoutFallback: number | null = null;

    function limparFallback() {
      if (timeoutFallback !== null) {
        window.clearTimeout(timeoutFallback);
        timeoutFallback = null;
      }
    }

    function redirecionar(destino: string) {
      if (cancelado) return;
      cancelado = true;
      limparFallback();
      irPara(destino);
    }

    function agendarFallbackParaAuth() {
      limparFallback();
      timeoutFallback = window.setTimeout(async () => {
        if (cancelado) return;

        const sessao = await aguardarSessaoNoCallback(400);
        if (sessao?.user) {
          redirecionar(destinoPosLogin());
          return;
        }

        if (!temTokenDeSessaoNoHash()) {
          redirecionar("/auth");
        }
      }, 8000);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sessao) => {
      if (sessao?.user) {
        redirecionar(destinoPosLogin());
      }
    });

    async function processar() {
      try {
        const sessaoExistente = await aguardarSessaoNoCallback(400);
        if (sessaoExistente?.user) {
          redirecionar(destinoPosLogin());
          return;
        }

        const haviaTokenNoHash = temTokenDeSessaoNoHash();
        const haCredencialNaUrl = haviaTokenNoHash || temParametrosAuthNaUrl();

        if (!haCredencialNaUrl) {
          agendarFallbackParaAuth();
          return;
        }

        const sessaoProcessada = await processarSessaoDaUrl();
        if (cancelado) return;

        if (sessaoProcessada?.user) {
          redirecionar(destinoPosLogin());
          return;
        }

        const sessao = await aguardarSessaoNoCallback(5000);
        if (sessao?.user) {
          redirecionar(destinoPosLogin());
          return;
        }

        if (!temTokenDeSessaoNoHash()) {
          agendarFallbackParaAuth();
          return;
        }

        setErro("Ainda não foi possível concluir o login. Tente pedir um novo link.");
      } catch (err) {
        if (!cancelado) {
          setErro(err instanceof Error ? err.message : "Erro ao validar link");
          if (!temTokenDeSessaoNoHash()) {
            agendarFallbackParaAuth();
          }
        }
      }
    }

    void processar();
    return () => {
      cancelado = true;
      limparFallback();
      authListener.subscription.unsubscribe();
    };
  }, []);

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
            Entrando...
          </p>
        </>
      )}
    </div>
  );
}
