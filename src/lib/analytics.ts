// Cálculo de insights semanais para o card "Como você tá".
//
// Como o histórico de reps por exercício mora em localStorage (treino-progress),
// e o histórico de sessões mora tanto em local quanto no Supabase
// (treinos_historico — só nome/duracao/exercicios), fazemos o seguinte:
//
//  - Para "maior progresso de reps": olhamos o histórico local em
//    `loadHistorico()` e comparamos primeira vs última sessão por exercício.
//
//  - Para "milestone de sessões": olhamos `historicoTreinos` do ElevoUser
//    e contamos sessões nos últimos 7 dias vs 8-14 dias atrás.
//
// Dedupe: usamos a tabela `insights_mostrados` no Supabase para não mostrar
// o mesmo card duas vezes na mesma semana.
import { supabase } from "@/integrations/supabase/client";
import { loadHistorico } from "./treino-progress";
import { EXERCICIOS_BASE, type ExercicioId } from "./exercicios-db";
import type { ElevoUser } from "./elevo-store";

export type InsightSemanal = {
  titulo: string;
  descricao: string;
  tipo: "progresso" | "milestone" | "consistencia";
  icon: string;
  exercicio?: string;
  repsAntes?: number;
  repsAgora?: number;
  percentual?: number;
};

const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

/** Olha histórico local de reps e devolve o exercício com maior progresso. */
function insightDeReps(): InsightSemanal | null {
  const hist = loadHistorico();
  let melhor: InsightSemanal | null = null;
  let maiorPct = 0;

  for (const [exId, sessoes] of Object.entries(hist)) {
    if (!sessoes || sessoes.length < 2) continue;

    // Pega max reps da sessão mais antiga vs mais recente
    const maisAntiga = sessoes[sessoes.length - 1];
    const maisRecente = sessoes[0];
    const repsAntes = Math.max(0, ...maisAntiga.series.map((s) => s.reps));
    const repsAgora = Math.max(0, ...maisRecente.series.map((s) => s.reps));
    if (repsAgora <= repsAntes || repsAntes === 0) continue;

    const pct = Math.round(((repsAgora - repsAntes) / repsAntes) * 100);
    if (pct > maiorPct) {
      maiorPct = pct;
      const base = EXERCICIOS_BASE[exId as ExercicioId];
      const nome = base?.nome ?? exId;
      melhor = {
        titulo: "Você tá evoluindo 🔥",
        descricao: `Subiu de ${repsAntes} pra ${repsAgora} reps em ${nome}.`,
        tipo: "progresso",
        icon: "📈",
        exercicio: nome,
        repsAntes,
        repsAgora,
        percentual: pct,
      };
    }
  }
  return melhor;
}

/** Compara sessões dos últimos 7d com as 7d anteriores. */
function insightDeConsistencia(user: ElevoUser): InsightSemanal | null {
  const sessoes = user.historicoTreinos ?? [];
  if (sessoes.length === 0) return null;
  const agora = Date.now();
  const semana = sessoes.filter((s) => agora - s.data <= SEMANA_MS).length;
  const semanaAnterior = sessoes.filter(
    (s) => agora - s.data > SEMANA_MS && agora - s.data <= 2 * SEMANA_MS
  ).length;

  if (semana >= 3 && semana >= semanaAnterior) {
    return {
      titulo: "Consistência impecável 🏆",
      descricao: `${semana} treinos nos últimos 7 dias. Continua assim.`,
      tipo: "consistencia",
      icon: "🔥",
    };
  }
  if (semana >= 1 && (user.streak ?? 0) >= 7) {
    return {
      titulo: `${user.streak} dias de sequência 💪`,
      descricao: "Você não parou. Isso vira hábito.",
      tipo: "milestone",
      icon: "🏆",
    };
  }
  return null;
}

/**
 * Calcula o melhor insight pra mostrar ao usuário agora.
 * Prioriza progresso de reps > consistência. Retorna null se nada relevante.
 */
export function calcularInsightSemanal(user: ElevoUser): InsightSemanal | null {
  return insightDeReps() ?? insightDeConsistencia(user);
}

/** Verifica se o card já foi mostrado nos últimos 6 dias (evita spam). */
export async function jaMostradoEstaSemana(): Promise<boolean> {
  const { data: sess } = await supabase.auth.getSession();
  if (!sess.session) return false;
  const seisDiasAtras = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("insights_mostrados")
    .select("id")
    .gte("data_criada", seisDiasAtras)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/** Marca que um insight foi exibido agora. */
export async function marcarInsightMostrado(): Promise<void> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) return;
  await supabase.from("insights_mostrados").insert({ user_id: uid });
}
