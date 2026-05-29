import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SESSION_TIMEOUT_MS = 5000;
const AUTH_HASH_KEYS = [
  "access_token",
  "refresh_token",
  "expires_at",
  "expires_in",
  "token_type",
  "type",
  "provider_token",
  "provider_refresh_token",
  "error",
  "error_code",
  "error_description",
];
const AUTH_SEARCH_KEYS = ["code", "error", "error_code", "error_description", "type"];

let processamentoEmCurso: Promise<Session | null> | null = null;

function lerParametrosAuthDaUrl() {
  if (typeof window === "undefined") {
    return {
      code: null,
      accessToken: null,
      refreshToken: null,
      erro: null,
    };
  }

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

export function temParametrosAuthNaUrl() {
  if (typeof window === "undefined") return false;
  const { code, accessToken, refreshToken, erro } = lerParametrosAuthDaUrl();
  return Boolean(code || accessToken || refreshToken || erro);
}

function limparParametrosAuthDaUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  AUTH_SEARCH_KEYS.forEach((key) => url.searchParams.delete(key));

  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  AUTH_HASH_KEYS.forEach((key) => hashParams.delete(key));
  const hashLimpo = hashParams.toString();

  const proximaUrl = `${url.pathname}${url.search}${hashLimpo ? `#${hashLimpo}` : ""}`;
  window.history.replaceState({}, document.title, proximaUrl);
}

export async function aguardarSessaoPronta(timeoutMs = SESSION_TIMEOUT_MS) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (sessionData.session) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!userError && userData.user) {
        return sessionData.session;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}

export async function processarSessaoDaUrl() {
  if (!temParametrosAuthNaUrl()) return null;
  if (processamentoEmCurso) return processamentoEmCurso;

  processamentoEmCurso = (async () => {
    try {
      const { code, accessToken, refreshToken, erro } = lerParametrosAuthDaUrl();
      if (erro) throw new Error(erro);

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
      } else if (!sessao) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        sessao = data.session;
      }

      sessao = sessao ?? (await aguardarSessaoPronta());

      if (sessao) {
        limparParametrosAuthDaUrl();
      }

      return sessao;
    } finally {
      processamentoEmCurso = null;
    }
  })();

  return processamentoEmCurso;
}