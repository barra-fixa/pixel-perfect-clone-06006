import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Trophy, Users, Heart, MessageCircle, Flame, Medal, Crown } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade — Elevo" },
      { name: "description", content: "Desafios, ranking e o feed dos atletas Elevo." },
    ],
  }),
  component: ComunidadePage,
});

type Tab = "feed" | "desafios" | "ranking";

const DESAFIOS = [
  {
    id: "30dias-barra",
    titulo: "30 dias na barra",
    descricao: "Faça 1 série de barra todo dia por 30 dias.",
    participantes: 842,
    diasRestantes: 12,
    cor: "var(--primary)",
    emoji: "🏋️",
  },
  {
    id: "100-flexoes",
    titulo: "100 flexões/dia",
    descricao: "Complete 100 flexões diárias durante 14 dias.",
    participantes: 463,
    diasRestantes: 6,
    cor: "var(--secondary)",
    emoji: "💪",
  },
  {
    id: "taf-bombeiro",
    titulo: "Rumo ao TAF Bombeiros",
    descricao: "Treino estruturado para o teste físico.",
    participantes: 217,
    diasRestantes: 28,
    cor: "var(--warning)",
    emoji: "🚒",
  },
];

const RANKING = [
  { pos: 1, nome: "Lucas M.", pts: 2480, streak: 42 },
  { pos: 2, nome: "Carla R.", pts: 2310, streak: 38 },
  { pos: 3, nome: "Diego S.", pts: 2105, streak: 35 },
  { pos: 4, nome: "Júlia P.", pts: 1890, streak: 21 },
  { pos: 5, nome: "Marcos A.", pts: 1755, streak: 19 },
  { pos: 6, nome: "Bea L.", pts: 1620, streak: 17 },
  { pos: 7, nome: "Rafa T.", pts: 1480, streak: 15 },
];

const FEED = [
  {
    id: 1,
    autor: "Carla R.",
    inicial: "C",
    quando: "há 12 min",
    texto: "Fechei a 5ª barra completa hoje! 6 meses atrás não fazia nem 1. 🔥",
    treino: "Costas & bíceps",
    likes: 42,
    coments: 8,
    cor: "var(--primary)",
  },
  {
    id: 2,
    autor: "Lucas M.",
    inicial: "L",
    quando: "há 1 h",
    texto: "Streak de 42 dias travado. Quem topa o desafio comigo essa semana?",
    treino: "Full body — casa",
    likes: 31,
    coments: 14,
    cor: "var(--secondary)",
  },
  {
    id: 3,
    autor: "Diego S.",
    inicial: "D",
    quando: "há 3 h",
    texto: "Primeiro mês grátis garantido 🎯 a meta funciona, vão fundo.",
    treino: "Treino TAF",
    likes: 58,
    coments: 11,
    cor: "var(--warning)",
  },
];

function ComunidadePage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const user = useElevoUser();

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-5">
        <Link to="/home" className="size-10 rounded-full flex items-center justify-center elevo-card" aria-label="Voltar">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Comunidade</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Você não treina sozinho
          </p>
        </div>
        <Users size={22} style={{ color: "var(--secondary)" }} />
      </header>

      <div className="flex gap-2 mb-5">
        {([
          { id: "feed", label: "Feed" },
          { id: "desafios", label: "Desafios" },
          { id: "ranking", label: "Ranking" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className="chip"
            data-active={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className="space-y-3 fade-up">
          {FEED.map((p) => {
            const isLiked = liked[p.id];
            const likes = p.likes + (isLiked ? 1 : 0);
            return (
              <article key={p.id} className="elevo-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${p.cor}, var(--card-elevated))` }}
                  >
                    {p.inicial}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{p.autor}</div>
                    <div className="text-xs" style={{ color: "var(--subtle)" }}>
                      {p.quando} · {p.treino}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-3">{p.texto}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <button
                    className="flex items-center gap-1.5 transition active:scale-95"
                    onClick={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}
                    style={{ color: isLiked ? "var(--destructive)" : undefined }}
                  >
                    <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    {likes}
                  </button>
                  <button className="flex items-center gap-1.5">
                    <MessageCircle size={16} />
                    {p.coments}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "desafios" && (
        <div className="space-y-3 fade-up">
          {DESAFIOS.map((d) => {
            const isJoined = joined[d.id];
            return (
              <section key={d.id} className="elevo-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="size-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `color-mix(in oklab, ${d.cor} 18%, transparent)` }}
                  >
                    {d.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{d.titulo}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                      {d.descricao}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-3" style={{ color: "var(--subtle)" }}>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {d.participantes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={12} /> {d.diasRestantes} dias restantes
                  </span>
                </div>
                <button
                  className={isJoined ? "btn-outline" : "btn-primary"}
                  onClick={() => setJoined((s) => ({ ...s, [d.id]: !s[d.id] }))}
                  style={{ paddingTop: 12, paddingBottom: 12 }}
                >
                  {isJoined ? "Participando ✓" : "Participar"}
                </button>
              </section>
            );
          })}
        </div>
      )}

      {tab === "ranking" && (
        <div className="fade-up">
          <section className="elevo-card p-4 mb-3">
            <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--muted-foreground)" }}>
              Top atletas — semana
            </div>
            <ul className="space-y-2">
              {RANKING.map((r) => {
                const trophy =
                  r.pos === 1 ? <Crown size={16} style={{ color: "var(--warning)" }} />
                  : r.pos === 2 ? <Medal size={16} style={{ color: "var(--muted-foreground)" }} />
                  : r.pos === 3 ? <Trophy size={16} style={{ color: "var(--warning)" }} />
                  : <span className="text-xs font-semibold w-4 text-center" style={{ color: "var(--subtle)" }}>{r.pos}</span>;
                return (
                  <li
                    key={r.pos}
                    className="flex items-center gap-3 py-2 px-2 rounded-xl"
                    style={r.pos <= 3 ? { backgroundColor: "var(--card-elevated)" } : undefined}
                  >
                    <div className="w-5 flex justify-center">{trophy}</div>
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                    >
                      {r.nome.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.nome}</div>
                      <div className="text-xs" style={{ color: "var(--subtle)" }}>
                        🔥 {r.streak} dias
                      </div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                      {r.pts}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            className="elevo-card p-4 flex items-center gap-3"
            style={{ borderColor: "color-mix(in oklab, var(--primary) 40%, var(--border))" }}
          >
            <div
              className="size-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
            >
              {(user.nome ?? "V").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Sua posição</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                #128 · 320 pts — continue treinando!
              </div>
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
