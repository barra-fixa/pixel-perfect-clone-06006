import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { saveUser, useElevoUser } from "@/lib/elevo-store";

export const Route = createFileRoute("/onboarding/preview")({
  component: PreviewPage,
});

const beneficios = [
  "Plano personalizado pela IA",
  "Sistema de metas com recompensa",
  "Se bater a meta, não paga nada",
  "Cancele quando quiser",
];

const semana1 = [
  { dia: "Seg", treino: "Costas + Bíceps", ex: 8 },
  { dia: "Ter", treino: "Descanso ativo", ex: 0 },
  { dia: "Qua", treino: "Peito + Tríceps", ex: 7 },
  { dia: "Qui", treino: "Mobilidade", ex: 5 },
  { dia: "Sex", treino: "Pernas + Core", ex: 9 },
];

function PreviewPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const nome = user.nome ?? "atleta";

  return (
    <div className="elevo-shell px-5 pt-6 pb-8 min-h-dvh">
      <div className="text-center fade-up">
        <span className="badge-pro">✦ Plano IA pronto</span>
        <h1 className="mt-3 text-2xl font-bold leading-tight">
          Seu plano de 12 semanas está pronto, {nome}!
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Personalizado pela nossa IA com base nas suas respostas
        </p>
      </div>

      {/* preview semana 1 */}
      <div className="mt-6 elevo-card overflow-hidden">
        <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Semana 1</span>
            <span className="text-xs" style={{ color: "var(--primary)" }}>
              ● Desbloqueada
            </span>
          </div>
        </div>
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {semana1.map((d) => (
            <li key={d.dia} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="size-9 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "var(--card-elevated)" }}
                >
                  {d.dia}
                </span>
                <div>
                  <div className="text-sm font-medium">{d.treino}</div>
                  {d.ex > 0 && (
                    <div className="text-xs" style={{ color: "var(--subtle)" }}>
                      {d.ex} exercícios
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* semana 2 com lock */}
      <div className="mt-3 elevo-card p-4 relative overflow-hidden">
        <div className="filter blur-sm opacity-50">
          <div className="font-semibold">Semana 2</div>
          <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Progressão de força · 5 treinos
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <Lock size={16} style={{ color: "var(--subtle)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--subtle)" }}>
            Desbloqueie completando a semana 1
          </span>
        </div>
      </div>

      {/* card destaque */}
      <div
        className="mt-6 rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 22%, var(--card)), var(--card))",
          border: "1px solid color-mix(in oklab, var(--primary) 40%, var(--border))",
        }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black" style={{ color: "var(--primary)" }}>
            20 dias
          </span>
          <span className="text-sm font-medium">grátis</span>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Se treinar, continua sem pagar.
        </p>
        <ul className="mt-4 space-y-2">
          {beneficios.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm">
              <Check size={16} style={{ color: "var(--primary)" }} strokeWidth={3} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-3">
        <button
          className="btn-primary"
          onClick={() => {
            saveUser({ plano: "free", diasJornada: 1, treinosFeitos: 0, streak: 0 });
            navigate({ to: "/home" });
          }}
        >
          Começar meus 20 dias grátis
        </button>
        <button className="btn-outline" onClick={() => navigate({ to: "/upgrade" })}>
          Ver planos e preços
        </button>
        <p className="text-center text-[10px] leading-relaxed" style={{ color: "var(--subtle)" }}>
          Nenhum cartão necessário · Após 20 dias, R$17,90/mês somente se não atingir a meta
        </p>
      </div>
    </div>
  );
}
