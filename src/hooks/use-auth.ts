import { useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { saveUser, hydrateFromSupabase, clearLocalCache } from "@/lib/elevo-store";
import { processarSessaoDaUrl } from "@/lib/auth-url-session";

async function carregarSessaoInicial() {
  await processarSessaoDaUrl();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData.session ?? null;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    return null;
  }

  return sessionData.session ?? null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrapConcluido = useRef(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const meta = s.user.user_metadata as { nome?: string; full_name?: string } | undefined;
        saveUser({
          email: s.user.email ?? undefined,
          nome: meta?.nome ?? meta?.full_name ?? undefined,
        });
        // defer to avoid running supabase calls inside the auth callback
        setTimeout(() => { void hydrateFromSupabase(); }, 0);
      } else if (event === "SIGNED_OUT") {
        clearLocalCache();
      }

      if (bootstrapConcluido.current) {
        setLoading(false);
      }
    });

    void carregarSessaoInicial()
      .then((sessao) => {
        bootstrapConcluido.current = true;
        setSession(sessao);
        setUser(sessao?.user ?? null);
        if (sessao) void hydrateFromSupabase();
      })
      .finally(() => {
        bootstrapConcluido.current = true;
        setLoading(false);
      });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading, isAuthenticated: !!session };
}
