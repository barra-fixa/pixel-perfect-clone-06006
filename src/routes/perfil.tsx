import { createFileRoute, Link, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LogOut, ShoppingBag, Target } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { META_POR_NIVEL, useElevoUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";
import { listBadges } from "@/lib/badges";

export const Route = createFileRoute("/perfil")({
  component: PerfilLayout,
});

const sections: { label: string; sub?: string; to?: string }[] = [
  { label: "Meus dados", sub: "Objetivo, nível e frequência", to: "/perfil/dados" },
  { label: "Histórico de treinos", sub: "Veja tudo que você já fez", to: "/perfil/historico" },
  { label: "Notificações", sub: "Lembretes de treino e água", to: "/perfil/notificacoes" },
  { label: "Suporte" },
];

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

  // Meta semanal explícita
  const freq = user.frequencia ?? Math.max(1, Math.round(META_POR_NIVEL[user.nivel ?? "iniciante"] / 2));
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const treinosDaSemana = (user.historicoTreinos ?? []).filter((t) => t.data >= seteDiasAtras).length;
  const meta = freq;
  const pct = Math.min(100, Math.round((treinosDaSemana / meta) * 100));
  const faltam = Math.max(0, meta - treinosDaSemana);
  const bateu = treinosDaSemana >= meta;

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-4">
        <div
          className="size-16 rounded-full flex items-center justify-center text-2xl font-bold"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
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

      {/* Card "Meu plano" — claro e com progresso */}
      <Link
        to="/upgrade"
        className="block mt-6 rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 18%, var(--card)), var(--card))",
          border: "1px solid color-mix(in oklab, var(--secondary) 35%, var(--border))",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="size-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)" }}
          >
            <Target size={18} style={{ color: "var(--secondary)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--secondary)" }}>
              Meu plano · {user.plano === "pro" ? "Pro" : "Free"}
            </div>
            <div className="font-bold text-sm mt-0.5">
              {bateu
                ? "🎉 Meta da semana batida — mês grátis garantido!"
                : `Treine ${treinosDaSemana} de ${meta} vezes essa semana pra garantir seu mês grátis`}
            </div>
            <div className="mt-2 progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[11px] mt-1.5" style={{ color: "var(--muted-foreground)" }}>
              {bateu
                ? "Continue assim — sua próxima cobrança fica zerada."
                : `Faltam ${faltam} treino${faltam === 1 ? "" : "s"} · meta = ${meta}x por semana`}
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--subtle)" }} />
        </div>
      </Link>

      <ul className="mt-4 elevo-card divide-y" style={{ borderColor: "var(--border)" }}>
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

      {/* Equipamentos & parceiros (antiga Loja) */}
      <Link
        to="/loja"
        className="mt-4 elevo-card p-3 flex items-center gap-3 active:scale-[0.99] transition"
      >
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--primary) 14%, transparent)" }}
        >
          <ShoppingBag size={18} style={{ color: "var(--primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold leading-tight">Equipamentos & parceiros</div>
          <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Barras fixas de parede, cupom PRO15, parceiros
          </div>
        </div>
        <ChevronRight size={16} style={{ color: "var(--subtle)" }} />
      </Link>

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
