// Persistência local do log de séries da sessão atual.
export type SerieLog = { reps: number; peso: number };
export type ProgressoTreino = {
  treinoId: string;
  iniciadoEm: number;
  series: Record<string, SerieLog[]>; // exercicioId -> séries concluídas
};

const KEY = "elevo:treino-em-andamento";

export function loadProgresso(): ProgressoTreino | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressoTreino) : null;
  } catch {
    return null;
  }
}

export function saveProgresso(p: ProgressoTreino) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function clearProgresso() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
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
}
