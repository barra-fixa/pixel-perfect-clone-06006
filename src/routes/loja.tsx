import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ExternalLink, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PRODUTOS_BARRA_FIXA } from "@/lib/produtos";

export const Route = createFileRoute("/loja")({
  component: LojaPage,
});

const parceiros = [
  { nome: "Growth Supplements", desc: "20% OFF em whey", emoji: "💊" },
  { nome: "Centauro", desc: "15% em roupas fitness", emoji: "👕" },
  { nome: "Liv Up", desc: "R$30 em refeições", emoji: "🥗" },
];

function copiarCupom() {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    void navigator.clipboard.writeText("PRO15");
    toast.success("Cupom copiado! 🎟️", { description: "Use PRO15 para 15% OFF" });
  }
}

function abrirEmBreve(nome: string) {
  toast.info(`${nome} 🛒`, { description: "Em breve você poderá comprar direto pelo app." });
}

function LojaPage() {
  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/perfil"
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Equipamentos & parceiros</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Tudo que recomendamos pra quem treina em casa.
          </p>
        </div>
      </div>

      {/* cupom Pro */}
      <button
        onClick={copiarCupom}
        className="rounded-2xl p-4 mt-2 flex items-center gap-3 w-full text-left transition hover:opacity-90"
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
            Cupom exclusivo Pro · toque para copiar
          </div>
          <div className="font-bold tracking-wider">PRO15 — 15% OFF</div>
        </div>
      </button>

      <h2 className="text-sm font-semibold mt-7 mb-3">Barras fixas de parede</h2>
      <div className="space-y-3">
        {PRODUTOS_BARRA_FIXA.map((p) => (
          <a
            key={p.id}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="elevo-card p-3 flex items-center gap-3 active:scale-[0.99] transition"
          >
            <div
              className="size-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: "var(--card-elevated)" }}
            >
              {p.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold leading-tight line-clamp-2">{p.nome}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {p.descricao}
              </div>
              <div className="text-sm font-bold mt-1">{p.preco}</div>
            </div>
            <ExternalLink size={16} style={{ color: "var(--subtle)" }} />
          </a>
        ))}
      </div>

      <h2 className="text-sm font-semibold mt-7 mb-3">Parceiros</h2>
      <div className="grid grid-cols-1 gap-3">
        {parceiros.map((p) => (
          <button
            key={p.nome}
            onClick={() => abrirEmBreve(p.nome)}
            className="elevo-card p-3 flex items-center gap-3 w-full text-left transition hover:opacity-90"
          >
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
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
