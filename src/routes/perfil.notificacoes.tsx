import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, ChevronLeft, Droplet, Dumbbell, Users } from "lucide-react";
import { loadUser, saveUser, type Notificacoes } from "@/lib/elevo-store";

export const Route = createFileRoute("/perfil/notificacoes")({
  component: NotificacoesPage,
});

const DEFAULT: Notificacoes = {
  treino: true,
  agua: true,
  comunidade: false,
  horario: "07:00",
};

function NotificacoesPage() {
  const navigate = useNavigate();
  const [n, setN] = useState<Notificacoes>(DEFAULT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const u = loadUser();
    setN({ ...DEFAULT, ...(u.notificacoes ?? {}) });
  }, []);

  const update = (patch: Partial<Notificacoes>) => {
    const next = { ...n, ...patch };
    setN(next);
    saveUser({ notificacoes: next });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/perfil" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Notificações</h1>
      </header>

      <div
        className="rounded-2xl p-4 mb-5 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 20%, var(--card)) 0%, var(--card) 80%)",
          border: "1px solid color-mix(in oklab, var(--primary) 30%, var(--border))",
        }}
      >
        <Bell size={20} style={{ color: "var(--primary)" }} />
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Configure os lembretes para manter sua sequência ativa.
        </p>
      </div>

      <ul className="elevo-card divide-y" style={{ borderColor: "var(--border)" }}>
        <Toggle
          icon={<Dumbbell size={18} style={{ color: "var(--primary)" }} />}
          label="Lembrete de treino"
          sub="Te avisamos no horário escolhido"
          on={n.treino}
          onChange={(v) => update({ treino: v })}
        />
        <Toggle
          icon={<Droplet size={18} style={{ color: "var(--secondary)" }} />}
          label="Lembrete de água"
          sub="A cada 2 horas durante o dia"
          on={n.agua}
          onChange={(v) => update({ agua: v })}
        />
        <Toggle
          icon={<Users size={18} style={{ color: "var(--warning)" }} />}
          label="Comunidade"
          sub="Novos desafios e ranking semanal"
          on={n.comunidade}
          onChange={(v) => update({ comunidade: v })}
        />
      </ul>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Horário do lembrete de treino</h2>
        <div className="elevo-card p-4 flex items-center justify-between">
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Toda manhã às
          </span>
          <input
            type="time"
            value={n.horario}
            onChange={(e) => update({ horario: e.target.value })}
            className="bg-transparent text-lg font-bold outline-none"
            style={{ color: "var(--primary)", colorScheme: "dark" }}
          />
        </div>
      </section>

      <p className="text-center text-xs mt-6" style={{ color: "var(--subtle)" }}>
        {saved ? "Salvo automaticamente ✓" : "Suas preferências são salvas no aparelho"}
      </p>
    </div>
  );
}

function Toggle({
  icon,
  label,
  sub,
  on,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li className="p-4 flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
      <div
        className="size-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "var(--muted)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {sub}
        </div>
      </div>
      <button
        onClick={() => onChange(!on)}
        aria-pressed={on}
        className="relative w-11 h-6 rounded-full transition shrink-0"
        style={{
          backgroundColor: on ? "var(--primary)" : "var(--border)",
        }}
      >
        <span
          className="absolute top-0.5 size-5 rounded-full bg-white transition-transform"
          style={{ transform: on ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </li>
  );
}
