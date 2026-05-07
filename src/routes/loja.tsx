import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Tag } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/loja")({
  component: LojaPage,
});

const produtos = [
  { nome: "Barra fixa de porta", preco: "R$ 189", emoji: "🏋️", tag: "Mais vendido" },
  { nome: "Suporte saco de pancada", preco: "R$ 249", emoji: "🥊" },
  { nome: "Suporte de bicicleta", preco: "R$ 159", emoji: "🚴" },
];

const parceiros = [
  { nome: "Growth Supplements", desc: "20% OFF em whey", emoji: "💊" },
  { nome: "Centauro", desc: "15% em roupas fitness", emoji: "👕" },
  { nome: "Liv Up", desc: "R$30 em refeições", emoji: "🥗" },
];

function LojaPage() {
  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <h1 className="text-2xl font-bold">Loja Barra Fixa</h1>
      <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
        Equipamentos e benefícios para quem treina.
      </p>

      {/* cupom Pro */}
      <div
        className="rounded-2xl p-4 mt-5 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 30%, var(--card)), var(--card))",
          border: "1px solid color-mix(in oklab, var(--secondary) 40%, var(--border))",
        }}
      >
        <div
          className="size-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 30%, transparent)" }}
        >
          <Tag size={20} style={{ color: "var(--secondary)" }} />
        </div>
        <div className="flex-1">
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Cupom exclusivo Pro
          </div>
          <div className="font-bold tracking-wider">PRO15 — 15% OFF</div>
        </div>
      </div>

      <h2 className="text-sm font-semibold mt-7 mb-3">Produtos Barra Fixa</h2>
      <div className="space-y-3">
        {produtos.map((p) => (
          <div key={p.nome} className="elevo-card p-3 flex items-center gap-3">
            <div
              className="size-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {p.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{p.nome}</div>
              {p.tag && (
                <span
                  className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "color-mix(in oklab, var(--primary) 20%, transparent)",
                    color: "var(--primary)",
                  }}
                >
                  {p.tag}
                </span>
              )}
              <div className="text-base font-bold mt-1">{p.preco}</div>
            </div>
            <button
              className="size-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--card-elevated)" }}
              aria-label="Ver na loja"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold mt-7 mb-3">Parceiros</h2>
      <div className="grid grid-cols-1 gap-3">
        {parceiros.map((p) => (
          <div key={p.nome} className="elevo-card p-3 flex items-center gap-3">
            <div
              className="size-11 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {p.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{p.nome}</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {p.desc}
              </div>
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
              Ver
            </span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
