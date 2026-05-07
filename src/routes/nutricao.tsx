import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, Apple, Droplets, Clock, Flame, ChefHat, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/nutricao")({
  head: () => ({
    meta: [
      { title: "Nutrição — Elevo" },
      { name: "description", content: "Guias pré e pós-treino, receitas rápidas e controle de hidratação." },
    ],
  }),
  component: NutricaoPage,
});

type Tab = "guias" | "receitas" | "hidratacao";

const GUIAS = [
  {
    momento: "Pré-treino",
    janela: "30–60 min antes",
    cor: "var(--primary)",
    icon: Clock,
    bullets: [
      "Banana + 1 col. de pasta de amendoim",
      "Aveia com mel e café preto",
      "Pão integral com ovo mexido",
    ],
    dica: "Foque em carboidrato de fácil digestão + um pouco de proteína.",
  },
  {
    momento: "Pós-treino",
    janela: "Até 45 min depois",
    cor: "var(--secondary)",
    icon: Flame,
    bullets: [
      "Whey + banana + leite/água",
      "Frango desfiado com arroz",
      "Iogurte natural + granola + frutas",
    ],
    dica: "Reposição: proteína (~0,3g/kg) + carbo para repor glicogênio.",
  },
];

const RECEITAS = [
  {
    nome: "Bowl proteico de frango",
    kcal: 480,
    tempo: 15,
    proteina: 42,
    tag: "Pós-treino",
    emoji: "🍗",
  },
  {
    nome: "Smoothie banana & whey",
    kcal: 320,
    tempo: 5,
    proteina: 28,
    tag: "Pré-treino",
    emoji: "🥤",
  },
  {
    nome: "Wrap de ovo & abacate",
    kcal: 410,
    tempo: 10,
    proteina: 22,
    tag: "Café",
    emoji: "🌯",
  },
  {
    nome: "Salada power de atum",
    kcal: 360,
    tempo: 8,
    proteina: 30,
    tag: "Almoço",
    emoji: "🥗",
  },
];

function NutricaoPage() {
  const [tab, setTab] = useState<Tab>("guias");
  const [copos, setCopos] = useState(0);
  const meta = 8;

  useEffect(() => {
    const raw = localStorage.getItem("elevo:hidratacao");
    if (raw) {
      try {
        const { date, copos: c } = JSON.parse(raw);
        if (date === new Date().toDateString()) setCopos(c);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "elevo:hidratacao",
      JSON.stringify({ date: new Date().toDateString(), copos }),
    );
  }, [copos]);

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-5">
        <Link to="/home" className="size-10 rounded-full flex items-center justify-center elevo-card" aria-label="Voltar">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Nutrição</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Energia que sustenta o treino
          </p>
        </div>
        <Apple size={22} style={{ color: "var(--primary)" }} />
      </header>

      {/* tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {([
          { id: "guias", label: "Guias" },
          { id: "receitas", label: "Receitas" },
          { id: "hidratacao", label: "Hidratação" },
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

      {tab === "guias" && (
        <div className="space-y-4 fade-up">
          {GUIAS.map((g) => {
            const Icon = g.icon;
            return (
              <section key={g.momento} className="elevo-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in oklab, ${g.cor} 18%, transparent)` }}
                  >
                    <Icon size={20} style={{ color: g.cor }} />
                  </div>
                  <div>
                    <div className="font-semibold">{g.momento}</div>
                    <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      {g.janela}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-3">
                  {g.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm">
                      <span style={{ color: g.cor }}>•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p
                  className="text-xs p-3 rounded-xl"
                  style={{
                    backgroundColor: "var(--card-elevated)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  💡 {g.dica}
                </p>
              </section>
            );
          })}
        </div>
      )}

      {tab === "receitas" && (
        <div className="grid grid-cols-2 gap-3 fade-up">
          {RECEITAS.map((r) => (
            <button key={r.nome} className="elevo-card p-4 text-left active:scale-[0.98] transition">
              <div className="text-3xl mb-2">{r.emoji}</div>
              <div className="font-semibold text-sm leading-tight">{r.nome}</div>
              <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                {r.kcal} kcal · {r.tempo} min
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: "var(--primary)" }}>
                  {r.proteina}g prot
                </span>
                <span className="badge-pro" style={{ fontSize: 10 }}>
                  {r.tag}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === "hidratacao" && (
        <div className="fade-up">
          <section className="elevo-card p-6 text-center mb-4">
            <Droplets size={36} className="mx-auto mb-2" style={{ color: "var(--primary)" }} />
            <div className="text-4xl font-bold">
              {copos}
              <span className="text-lg" style={{ color: "var(--muted-foreground)" }}>
                {" / "}{meta}
              </span>
            </div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              copos de água hoje
            </div>
            <div className="progress-track mt-4">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, (copos / meta) * 100)}%` }}
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button
                className="btn-outline"
                onClick={() => setCopos((c) => Math.max(0, c - 1))}
                disabled={copos === 0}
              >
                <Minus size={18} />
              </button>
              <button className="btn-primary" onClick={() => setCopos((c) => c + 1)}>
                <Plus size={18} className="mr-1" /> Bebi 1 copo
              </button>
            </div>
          </section>

          <section className="elevo-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat size={18} style={{ color: "var(--secondary)" }} />
              <span className="font-semibold text-sm">Por que hidratar?</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Cada 1% de desidratação reduz até 10% da sua performance. Mantenha
              um copo sempre por perto e capriche antes e depois do treino.
            </p>
          </section>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
