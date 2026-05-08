import { toast } from "sonner";
import type { ElevoUser } from "@/lib/elevo-store";
import { META_POR_NIVEL } from "@/lib/elevo-store";

export type Badge = {
  id: string;
  titulo: string;
  descricao: string;
  emoji: string;
  unlocked: boolean;
};

export function listBadges(user: ElevoUser): Badge[] {
  const treinos = user.treinosFeitos ?? 0;
  const streak = user.streak ?? 0;
  return [
    { id: "primeiro", titulo: "Primeiro treino", descricao: "Conclua seu primeiro treino", emoji: "🎯", unlocked: treinos >= 1 },
    { id: "cinco", titulo: "Aquecido", descricao: "5 treinos completos", emoji: "🔥", unlocked: treinos >= 5 },
    { id: "dez", titulo: "Consistente", descricao: "10 treinos no histórico", emoji: "💪", unlocked: treinos >= 10 },
    { id: "vinte_cinco", titulo: "Atleta", descricao: "25 treinos", emoji: "🏋️", unlocked: treinos >= 25 },
    { id: "cem", titulo: "Centenário", descricao: "100 treinos", emoji: "🏆", unlocked: treinos >= 100 },
    { id: "streak3", titulo: "Sequência 3 dias", descricao: "3 dias seguidos", emoji: "⚡", unlocked: streak >= 3 },
    { id: "streak7", titulo: "Sequência 7 dias", descricao: "1 semana sem parar", emoji: "🌟", unlocked: streak >= 7 },
    { id: "streak30", titulo: "Sequência 30 dias", descricao: "1 mês completo", emoji: "👑", unlocked: streak >= 30 },
  ];
}

export function checkUnlocks(prev: ElevoUser, next: ElevoUser) {
  const before = new Set(listBadges(prev).filter((b) => b.unlocked).map((b) => b.id));
  for (const b of listBadges(next)) {
    if (b.unlocked && !before.has(b.id)) {
      toast.success(`Badge desbloqueada: ${b.titulo} ${b.emoji}`, {
        description: b.descricao,
        duration: 5000,
      });
    }
  }
}

export function checkMetaSemanal(user: ElevoUser) {
  const freq = user.frequencia ?? META_POR_NIVEL[user.nivel ?? "iniciante"] / 2;
  const sete = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const treinos = (user.historicoTreinos ?? []).filter((t) => t.data >= sete).length;
  if (treinos === Math.ceil(freq)) {
    toast.success("Meta semanal batida! 🎯", {
      description: "Você bateu sua meta de treinos da semana. Mês grátis garantido!",
      duration: 6000,
    });
  }
}
