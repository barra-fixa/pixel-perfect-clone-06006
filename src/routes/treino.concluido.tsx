import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useElevoUser } from "@/lib/elevo-store";
import { TREINO_DO_DIA } from "@/lib/mock-treino";

export const Route = createFileRoute("/treino/concluido")({
  component: ConcluidoPage,
});

function ConcluidoPage() {
  const user = useElevoUser();
  return (
    <div className="elevo-shell px-5 pt-12 pb-8 min-h-dvh flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60"
          style={{ backgroundColor: "var(--primary)" }}
        />
        <div
          className="relative size-28 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-glow))",
          }}
        >
          <Check size={56} strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-3xl font-black">Treino concluído!</h1>
      <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Você acabou de subir mais um degrau 🚀
      </p>

      <div className="grid grid-cols-3 gap-3 mt-8 w-full">
        <Stat label="Duração" value="28 min" />
        <Stat label="Exercícios" value={`${TREINO_DO_DIA.exercicios.length}/${TREINO_DO_DIA.exercicios.length}`} />
        <Stat label="Calorias" value="~210" />
      </div>

      <div className="elevo-card p-4 mt-4 w-full text-left">
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Progresso na meta
        </div>
        <div className="text-lg font-bold mt-1">
          {user.treinosFeitos ?? 0} de 8 treinos este mês
        </div>
        <div className="progress-track mt-2">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, ((user.treinosFeitos ?? 0) / 8) * 100)}%` }}
          />
        </div>
      </div>

      <div className="w-full mt-auto pt-8 space-y-3">
        <button className="btn-outline">Compartilhar conquista</button>
        <Link to="/home" className="btn-primary">
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="elevo-card p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
    </div>
  );
}
