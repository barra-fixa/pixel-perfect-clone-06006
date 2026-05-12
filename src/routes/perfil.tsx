import { createFileRoute, Link, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";
import { listBadges } from "@/lib/badges";

export const Route = createFileRoute("/perfil")({
  component: PerfilLayout,
});

const sections: { label: string; sub?: string; to?: string }[] = [
  { label: "Meu plano", sub: "Free — 13 dias para garantir o mês grátis", to: "/upgrade" },
  { label: "Meus dados", sub: "Objetivo, nível e frequência", to: "/perfil/dados" },
  { label: "Histórico de treinos", sub: "Veja tudo que você já fez", to: "/perfil/historico" },
  { label: "Notificações", sub: "Lembretes de treino e água", to: "/perfil/notificacoes" },
  { label: "Suporte" },
];

/**
 * Wrapper que decide o que renderizar:
 * - `/perfil` -> PerfilPage (lista de seções).
 * - `/perfil/dados`, `/perfil/historico`, `/perfil/notificacoes` -> <Outlet /> (rota filha).
 */
function PerfilLayout() {
  const filhas = useChildMatches();
  if (filhas.length > 0) {
    return <Outlet />;
  }
  return <PerfilPage />;
}

function PerfilPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const nome = user.nome ?? "Atleta Elevo";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const email = user.email ?? "—";
  const initial = nome.charAt(0).toUpperCase();

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-4">
        <div
          className="size-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--secondary))",
          }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold truncate">{nome}</div>
          <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
            {email}
          </div>
          <span className="badge-pro mt-1.5">
            {user.plano === "pro" ? "Pro" : "Free"}
          </span>
        </div>
      </header>

      <ul className="mt-7 elevo-card divide-y" style={{ borderColor: "var(--border)" }}>
        {sections.map((s) => {
          const inner = (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="flex-1">
                <div className="text-sm font-medium">{s.label}</div>
                {s.sub && (
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {s.sub}
                  </div>
                )}
              </div>
              <ChevronRight size={18} style={{ color: "var(--subtle)" }} />
            </div>
          );
          return (
            <li key={s.label} style={{ borderColor: "var(--border)" }}>
              {s.to ? <Link to={s.to}>{inner}</Link> : inner}
            </li>
          );
        })}
      </ul>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Badges</h2>
        <div className="grid grid-cols-4 gap-2">
          {listBadges(user).map((b) => (
            <div
              key={b.id}
              className="elevo-card p-2 text-center"
              title={`${b.titulo} — ${b.descricao}`}
              style={{ opacity: b.unlocked ? 1 : 0.35 }}
            >
              <div className="text-2xl">{b.emoji}</div>
              <div className="text-[10px] mt-1 leading-tight" style={{ color: "var(--muted-foreground)" }}>
                {b.titulo}
              </div>
            </div>
          ))}
        </div>
      </section>

      <button onClick={handleLogout} className="mt-6 w-full elevo-card p-4 flex items-center justify-center gap-2 text-sm font-medium" style={{ color: "var(--destructive)" }}>
        <LogOut size={16} /> Sair
      </button>

      <p className="text-center mt-6 text-xs" style={{ color: "var(--subtle)" }}>
        Elevo · by Barra Fixa
      </p>

      <BottomNav />
    </div>
  );
}
