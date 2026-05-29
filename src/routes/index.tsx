import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flame, Shield, Trophy } from "lucide-react";
import { processarSessaoDaUrl, temParametrosAuthNaUrl } from "@/lib/auth-url-session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elevo — Eleve seu treino, eleve sua vida" },
      {
        name: "description",
        content:
          "Treinos personalizados na barra fixa, preparação para TAF e comunidade ativa. Comece grátis.",
      },
      { property: "og:title", content: "Elevo — by Barra Fixa" },
      {
        property: "og:description",
        content: "Treinos personalizados, preparação TAF e comunidade.",
      },
    ],
  }),
  component: Splash,
});

const SOCIAL = [
  { value: "12k+", label: "Atletas" },
  { value: "4.9★", label: "Avaliação" },
  { value: "30 dias", label: "Garantia" },
];

const HIGHLIGHTS = [
  {
    icon: Flame,
    color: "var(--warning)",
    title: "Treinos diários",
    sub: "Personalizados para seu nível e equipamento",
  },
  {
    icon: Shield,
    color: "var(--primary)",
    title: "Preparação TAF",
    sub: "Simulado e metas oficiais por cargo",
  },
  {
    icon: Trophy,
    color: "var(--secondary)",
    title: "Comunidade",
    sub: "Desafios, ranking e atletas reais",
  },
];

function Splash() {
  useEffect(() => {
    if (!temParametrosAuthNaUrl()) return;
    void processarSessaoDaUrl().then((sessao) => {
      if (sessao?.user) {
        window.location.replace("/home");
      }
    });
  }, []);

  return (
    <div className="elevo-shell elevo-grid-bg flex flex-col px-6 pt-14 pb-8 min-h-dvh">
      {/* Logo */}
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-5 size-16 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
            boxShadow:
              "0 20px 60px -20px color-mix(in oklab, var(--primary) 70%, transparent)",
          }}
        >
          <span className="text-2xl font-black text-white">E</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight">Elevo</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--subtle)" }}>
          by Barra Fixa
        </p>
      </div>

      {/* Headline */}
      <div className="mt-10 text-center">
        <p className="text-2xl font-bold leading-tight">
          Eleve seu treino.
          <br />
          <span style={{ color: "var(--primary)" }}>Eleve sua vida.</span>
        </p>
        <p className="mt-3 text-sm max-w-[300px] mx-auto" style={{ color: "var(--muted-foreground)" }}>
          Da primeira repetição ao TAF — um plano feito sob medida pra você.
        </p>
      </div>

      {/* Social proof */}
      <div className="grid grid-cols-3 gap-3 mt-7">
        {SOCIAL.map((s) => (
          <div key={s.label} className="elevo-card p-3 text-center">
            <div className="text-base font-bold" style={{ color: "var(--primary)" }}>
              {s.value}
            </div>
            <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <ul className="mt-5 space-y-2">
        {HIGHLIGHTS.map((h) => (
          <li key={h.title} className="elevo-card p-3 flex items-center gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `color-mix(in oklab, ${h.color} 18%, transparent)` }}
            >
              <h.icon size={18} style={{ color: h.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{h.title}</div>
              <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                {h.sub}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="w-full mt-auto pt-6 space-y-2">
        <Link to="/auth" className="btn-primary">
          Começar agora — grátis
        </Link>
        <Link to="/auth" className="btn-ghost w-full block text-center">
          Já tenho conta
        </Link>

        <p className="text-center text-[11px] mt-1" style={{ color: "var(--subtle)" }}>
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </div>
  );
}
