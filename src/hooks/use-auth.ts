import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { saveUser, hydrateFromSupabase, clearLocalCache } from "@/lib/elevo-store";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
      if (data.session) void hydrateFromSupabase();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading, isAuthenticated: !!session };
}
