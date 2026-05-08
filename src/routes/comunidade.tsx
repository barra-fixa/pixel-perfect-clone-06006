import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Trophy, Users, Heart, MessageCircle, Flame, Medal, Crown, Send, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { useElevoUser } from "@/lib/elevo-store";
import { supabase } from "@/integrations/supabase/client";
import { createPost, deletePost, listPosts, toggleLike, type CommunityPost } from "@/lib/community";

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
  { id: "30dias-barra", titulo: "30 dias na barra", descricao: "Faça 1 série de barra todo dia por 30 dias.", participantes: 842, diasRestantes: 12, cor: "var(--primary)", emoji: "🏋️" },
  { id: "100-flexoes", titulo: "100 flexões/dia", descricao: "Complete 100 flexões diárias durante 14 dias.", participantes: 463, diasRestantes: 6, cor: "var(--secondary)", emoji: "💪" },
  { id: "taf-bombeiro", titulo: "Rumo ao TAF Bombeiros", descricao: "Treino estruturado para o teste físico.", participantes: 217, diasRestantes: 28, cor: "var(--warning)", emoji: "🚒" },
];

const RANKING = [
  { pos: 1, nome: "Lucas M.", pts: 2480, streak: 42 },
  { pos: 2, nome: "Carla R.", pts: 2310, streak: 38 },
  { pos: 3, nome: "Diego S.", pts: 2105, streak: 35 },
  { pos: 4, nome: "Júlia P.", pts: 1890, streak: 21 },
  { pos: 5, nome: "Marcos A.", pts: 1755, streak: 19 },
];

function tempoRel(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

function ComunidadePage() {
  const [tab, setTab] = useState<Tab>("feed");
  const [joined, setJoined] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [posting, setPosting] = useState(false);
  const [meId, setMeId] = useState<string | null>(null);
  const user = useElevoUser();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setMeId(data.session?.user.id ?? null));
    void refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setPosts(await listPosts());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao carregar feed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEnviar() {
    if (!texto.trim()) return;
    setPosting(true);
    try {
      const novo = await createPost({
        texto: texto.trim(),
        autor_nome: user.nome ?? "Atleta",
        treino_nome: null,
      });
      setPosts((p) => [novo, ...p]);
      setTexto("");
      toast.success("Post compartilhado! 🔥");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao postar");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(p: CommunityPost) {
    // optimistic
    setPosts((arr) =>
      arr.map((x) =>
        x.id === p.id
          ? { ...x, liked_by_me: !x.liked_by_me, likes: x.likes + (x.liked_by_me ? -1 : 1) }
          : x,
      ),
    );
    try {
      await toggleLike(p.id, p.liked_by_me);
    } catch {
      // revert
      setPosts((arr) =>
        arr.map((x) =>
          x.id === p.id
            ? { ...x, liked_by_me: p.liked_by_me, likes: p.likes }
            : x,
        ),
      );
      toast.error("Não foi possível registrar a curtida");
    }
  }

  async function handleDelete(id: string) {
    const prev = posts;
    setPosts((arr) => arr.filter((p) => p.id !== id));
    try {
      await deletePost(id);
      toast.success("Post removido");
    } catch {
      setPosts(prev);
      toast.error("Erro ao remover");
    }
  }

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-5">
        <Link to="/home" className="size-10 rounded-full flex items-center justify-center elevo-card" aria-label="Voltar">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Comunidade</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Você não treina sozinho</p>
        </div>
        <Users size={22} style={{ color: "var(--secondary)" }} />
      </header>

      <div className="flex gap-2 mb-5">
        {([
          { id: "feed", label: "Feed" },
          { id: "desafios", label: "Desafios" },
          { id: "ranking", label: "Ranking" },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button key={t.id} className="chip" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" && (
        <div className="space-y-3 fade-up">
          {/* Compositor */}
          <div className="elevo-card p-3">
            <textarea
              className="w-full bg-transparent text-sm outline-none resize-none"
              rows={2}
              placeholder="Compartilhe um progresso, dica ou conquista..."
              maxLength={500}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: "var(--subtle)" }}>{texto.length}/500</span>
              <button
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                disabled={!texto.trim() || posting}
                onClick={handleEnviar}
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Postar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10" style={{ color: "var(--subtle)" }}>
              <Loader2 size={20} className="animate-spin mx-auto" />
            </div>
          ) : posts.length === 0 ? (
            <div className="elevo-card p-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              Nenhum post ainda. Seja o primeiro! 💪
            </div>
          ) : (
            posts.map((p) => (
              <article key={p.id} className="elevo-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                  >
                    {p.autor_nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p.autor_nome}</div>
                    <div className="text-xs" style={{ color: "var(--subtle)" }}>
                      {tempoRel(p.created_at)}
                      {p.treino_nome ? ` · ${p.treino_nome}` : ""}
                    </div>
                  </div>
                  {meId === p.user_id && (
                    <button onClick={() => handleDelete(p.id)} aria-label="Remover" className="p-1.5">
                      <Trash2 size={14} style={{ color: "var(--subtle)" }} />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap">{p.texto}</p>
                <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <button
                    className="flex items-center gap-1.5 transition active:scale-95"
                    onClick={() => handleLike(p)}
                    style={{ color: p.liked_by_me ? "var(--destructive)" : undefined }}
                  >
                    <Heart size={16} fill={p.liked_by_me ? "currentColor" : "none"} />
                    {p.likes}
                  </button>
                  <span className="flex items-center gap-1.5 opacity-50">
                    <MessageCircle size={16} />
                    0
                  </span>
                </div>
              </article>
            ))
          )}
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
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{d.descricao}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mb-3" style={{ color: "var(--subtle)" }}>
                  <span className="flex items-center gap-1"><Users size={12} /> {d.participantes}</span>
                  <span className="flex items-center gap-1"><Flame size={12} /> {d.diasRestantes} dias restantes</span>
                </div>
                <button
                  className={isJoined ? "btn-outline" : "btn-primary"}
                  onClick={() => {
                    setJoined((s) => ({ ...s, [d.id]: !s[d.id] }));
                    if (!isJoined) toast.success(`Você entrou no desafio "${d.titulo}"!`);
                  }}
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
                  <li key={r.pos} className="flex items-center gap-3 py-2 px-2 rounded-xl" style={r.pos <= 3 ? { backgroundColor: "var(--card-elevated)" } : undefined}>
                    <div className="w-5 flex justify-center">{trophy}</div>
                    <div className="size-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
                      {r.nome.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.nome}</div>
                      <div className="text-xs" style={{ color: "var(--subtle)" }}>🔥 {r.streak} dias</div>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>{r.pts}</div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="elevo-card p-4 flex items-center gap-3" style={{ borderColor: "color-mix(in oklab, var(--primary) 40%, var(--border))" }}>
            <div className="size-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}>
              {(user.nome ?? "V").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Sua posição</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                #{Math.max(50, 200 - (user.treinosFeitos ?? 0) * 5)} · {(user.treinosFeitos ?? 0) * 50} pts — continue treinando!
              </div>
            </div>
          </section>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
