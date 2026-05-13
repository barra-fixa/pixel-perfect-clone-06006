// Persistência local do log de séries.
//
// Mantemos 2 coisas:
//  1. Treino em andamento (sessão atual): apaga ao terminar/desistir.
//  2. Histórico por exercício (entre sessões): usado pela progressão automática.
//
// A progressão automática funciona assim: se o usuário bateu a meta de reps
// 2 sessões seguidas no mesmo exercício, sugerimos subir (+2 reps).

export type SerieLog = { reps: number; peso: number };

// ---------- Exercícios concluídos por dia ----------
// Estrutura: { "YYYY-MM-DD": { [treinoId]: string[] (exIds concluídos) } }

const FEITOS_KEY = "elevo:exs-feitos-dia";

function hojeKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type FeitosMap = Record<string, Record<string, string[]>>;

function loadFeitosMap(): FeitosMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FEITOS_KEY);
    return raw ? (JSON.parse(raw) as FeitosMap) : {};
  } catch {
    return {};
  }
}

function saveFeitosMap(m: FeitosMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FEITOS_KEY, JSON.stringify(m));
}

/** Marca um exercício como feito hoje para um treino. */
export function marcarExercicioFeito(treinoId: string, exId: string, date = new Date()) {
  const key = hojeKey(date);
  const m = loadFeitosMap();
  const dia = m[key] ?? {};
  const feitos = new Set(dia[treinoId] ?? []);
  feitos.add(exId);
  dia[treinoId] = Array.from(feitos);
  m[key] = dia;
  saveFeitosMap(m);
}

/** Lista exercícios já concluídos hoje pra um treino. */
export function exerciciosFeitosHoje(treinoId: string, date = new Date()): string[] {
  const m = loadFeitosMap();
  return m[hojeKey(date)]?.[treinoId] ?? [];
}

// ---------- Sessão atual ----------

export type ProgressoTreino = {
  treinoId: string;
  iniciadoEm: number;
  series: Record<string, SerieLog[]>; // exercicioId -> séries concluídas
};

const SESSAO_KEY = "elevo:treino-em-andamento";
const HISTORICO_KEY = "elevo:historico-exercicios";

export function loadProgresso(): ProgressoTreino | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSAO_KEY);
    return raw ? (JSON.parse(raw) as ProgressoTreino) : null;
  } catch {
    return null;
  }
}

export function saveProgresso(p: ProgressoTreino) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSAO_KEY, JSON.stringify(p));
}

export function clearProgresso() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSAO_KEY);
}

export function startProgresso(treinoId: string): ProgressoTreino {
  const p: ProgressoTreino = { treinoId, iniciadoEm: Date.now(), series: {} };
  saveProgresso(p);
  return p;
}

export function logSerie(exId: string, log: SerieLog) {
  const cur = loadProgresso();
  if (!cur) return;
  const prev = cur.series[exId] ?? [];
  cur.series[exId] = [...prev, log];
  saveProgresso(cur);

  // Também registra no histórico de longo prazo
  registrarHistorico(exId, log);
}

// ---------- Histórico entre sessões ----------

export type SessaoHist = {
  data: number; // timestamp
  series: SerieLog[]; // todas as séries daquela sessão
  bateuMeta: boolean; // true se o usuário bateu a meta de reps em TODAS as séries
};

export type HistoricoExercicio = {
  // exercicioId -> últimas N sessões (mais recente primeiro)
  [exId: string]: SessaoHist[];
};

const MAX_SESSOES = 10; // guardamos as 10 últimas sessões por exercício

export function loadHistorico(): HistoricoExercicio {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HISTORICO_KEY);
    return raw ? (JSON.parse(raw) as HistoricoExercicio) : {};
  } catch {
    return {};
  }
}

function saveHistorico(h: HistoricoExercicio) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(h));
}

// Adiciona uma série ao histórico do exercício.
// Agrupa séries por sessão usando a sessão atual (loadProgresso).
function registrarHistorico(exId: string, log: SerieLog) {
  const cur = loadProgresso();
  if (!cur) return;

  const hist = loadHistorico();
  const exHist = hist[exId] ?? [];

  // Se a última entrada do histórico é dessa mesma sessão, atualiza ela.
  // Caso contrário, cria uma nova entrada.
  const ultima = exHist[0];
  const mesmaSessao = ultima && ultima.data === cur.iniciadoEm;

  if (mesmaSessao) {
    ultima.series = [...ultima.series, log];
  } else {
    exHist.unshift({
      data: cur.iniciadoEm,
      series: [log],
      bateuMeta: false, // recalcula depois
    });
    // Limita o histórico
    if (exHist.length > MAX_SESSOES) exHist.length = MAX_SESSOES;
  }

  hist[exId] = exHist;
  saveHistorico(hist);
}

/**
 * Marca a sessão atual como "bateu a meta" para um exercício.
 * Deve ser chamado quando todas as séries forem concluídas com reps >= meta.
 *
 * O frontend (treino.ativo.tsx) chama isso ao terminar o último set do exercício.
 */
export function marcarBateuMeta(exId: string, bateu: boolean) {
  const hist = loadHistorico();
  const exHist = hist[exId];
  if (!exHist || exHist.length === 0) return;
  exHist[0].bateuMeta = bateu;
  saveHistorico(hist);
}

/**
 * Verifica se o usuário deve "subir" no próximo treino desse exercício.
 *
 * Critério: bateu a meta nas 2 últimas sessões consecutivas.
 *
 * Retorna `null` se não houver dados suficientes ou se não bateu a meta,
 * ou um objeto sugerindo +2 reps (ou +1 kg se o peso > 0) caso contrário.
 */
export type Sugestao = {
  motivo: string;
  novasReps?: number;
  novoPeso?: number;
};

export function sugerirProgresso(
  exId: string,
  repsAtual: number,
  pesoAtual: number
): Sugestao | null {
  const hist = loadHistorico();
  const exHist = hist[exId];
  if (!exHist || exHist.length < 2) return null;

  const ultimas2 = exHist.slice(0, 2);
  const bateuDuas = ultimas2.every((s) => s.bateuMeta);
  if (!bateuDuas) return null;

  // Se já tem peso, sugere subir peso. Senão sugere subir reps.
  if (pesoAtual > 0) {
    return {
      motivo: "Você bateu a meta 2 treinos seguidos. Tenta subir o peso 💪",
      novoPeso: pesoAtual + 1,
      novasReps: repsAtual,
    };
  }
  return {
    motivo: "Você bateu a meta 2 treinos seguidos. Tenta subir as reps 🔥",
    novasReps: repsAtual + 2,
  };
}
