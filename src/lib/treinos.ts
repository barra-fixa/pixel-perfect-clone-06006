// Gerador de planos de treino reais, baseado em objetivo / caminho / nível / frequência.
// Substitui o mock estático. Determinístico por dia da semana.
import type { Caminho, ElevoUser, Nivel, Objetivo } from "./elevo-store";

export type Exercicio = {
  id: string;
  nome: string;
  musculo: string;
  series: number;
  reps: string;
  dificuldade: "Iniciante" | "Intermediário" | "Avançado";
  emoji: string;
  descansoSeg: number;
  pesoSugerido?: number; // kg, 0 = peso corporal
  instrucoes: string[];
};

export type Treino = {
  id: string;
  nome: string;
  foco: string;
  duracaoMin: number;
  exercicios: Exercicio[];
};

// ---------- Banco de exercícios ----------

const EX = {
  // Peito / Tríceps
  flexao: (n: Nivel): Exercicio => ({
    id: "flexao",
    nome: "Flexão de braço",
    musculo: "Peito",
    series: n === "iniciante" ? 3 : 4,
    reps: n === "iniciante" ? "8-10" : "12-15",
    dificuldade: n === "iniciante" ? "Iniciante" : "Intermediário",
    emoji: "🤜",
    descansoSeg: 60,
    instrucoes: [
      "Apoie as mãos no chão na largura dos ombros, corpo reto.",
      "Desça o peito até quase tocar o chão, cotovelos a 45°.",
      "Empurre o chão e suba com força.",
    ],
  }),
  supino: (n: Nivel): Exercicio => ({
    id: "supino",
    nome: "Supino reto com halteres",
    musculo: "Peito",
    series: 4,
    reps: n === "avancado" ? "6-8" : "8-12",
    dificuldade: "Intermediário",
    emoji: "🏋️",
    descansoSeg: 90,
    pesoSugerido: n === "iniciante" ? 10 : n === "intermediario" ? 16 : 24,
    instrucoes: [
      "Deite no banco com os halteres na altura do peito.",
      "Empurre verticalmente até quase estender os cotovelos.",
      "Desça com controle por 2 segundos.",
    ],
  }),
  triceps: (n: Nivel): Exercicio => ({
    id: "triceps",
    nome: "Tríceps no banco",
    musculo: "Tríceps",
    series: 3,
    reps: "10-12",
    dificuldade: "Iniciante",
    emoji: "💪",
    descansoSeg: 45,
    instrucoes: [
      "Apoie as mãos em um banco/cadeira atrás de você.",
      "Desça flexionando os cotovelos até 90°.",
      "Empurre de volta usando o tríceps.",
    ],
  }),

  // Costas / Bíceps
  barraFixa: (n: Nivel): Exercicio => ({
    id: "barraFixa",
    nome: "Barra fixa pegada pronada",
    musculo: "Costas",
    series: n === "iniciante" ? 3 : 4,
    reps: n === "iniciante" ? "Máx" : "6-10",
    dificuldade: n === "iniciante" ? "Intermediário" : "Avançado",
    emoji: "🤸",
    descansoSeg: 75,
    instrucoes: [
      "Pegada pronada um pouco mais aberta que os ombros.",
      "Puxe levando o peito em direção à barra.",
      "Desça com controle até estender os braços.",
    ],
  }),
  remadaAustraliana: (): Exercicio => ({
    id: "remadaAustraliana",
    nome: "Remada australiana",
    musculo: "Costas",
    series: 3,
    reps: "10-12",
    dificuldade: "Iniciante",
    emoji: "🚣",
    descansoSeg: 60,
    instrucoes: [
      "Posicione-se sob a barra, corpo reto e calcanhares no chão.",
      "Puxe o peito em direção à barra mantendo o tronco alinhado.",
      "Desça lentamente até estender os braços.",
    ],
  }),
  remadaCurvada: (n: Nivel): Exercicio => ({
    id: "remadaCurvada",
    nome: "Remada curvada com halteres",
    musculo: "Costas",
    series: 4,
    reps: "8-10",
    dificuldade: "Intermediário",
    emoji: "🏋️",
    descansoSeg: 75,
    pesoSugerido: n === "iniciante" ? 8 : n === "intermediario" ? 14 : 20,
    instrucoes: [
      "Tronco inclinado a 45°, halteres ao lado das pernas.",
      "Puxe os halteres em direção à cintura.",
      "Desça lentamente sem balançar o tronco.",
    ],
  }),
  rosca: (n: Nivel): Exercicio => ({
    id: "rosca",
    nome: "Rosca direta",
    musculo: "Bíceps",
    series: 3,
    reps: "10-12",
    dificuldade: "Iniciante",
    emoji: "💪",
    descansoSeg: 45,
    pesoSugerido: n === "iniciante" ? 6 : n === "intermediario" ? 10 : 14,
    instrucoes: [
      "Em pé, halteres com pegada supinada.",
      "Flexione os cotovelos sem balançar o tronco.",
      "Segure 1 segundo no topo e desça lentamente.",
    ],
  }),

  // Pernas
  agachamento: (n: Nivel): Exercicio => ({
    id: "agachamento",
    nome: "Agachamento livre",
    musculo: "Pernas",
    series: n === "iniciante" ? 3 : 4,
    reps: n === "iniciante" ? "12" : "8-10",
    dificuldade: "Intermediário",
    emoji: "🦵",
    descansoSeg: 90,
    pesoSugerido: n === "iniciante" ? 0 : n === "intermediario" ? 20 : 40,
    instrucoes: [
      "Pés na largura dos ombros, joelhos alinhados aos pés.",
      "Desça empurrando o quadril para trás até as coxas paralelas ao chão.",
      "Suba empurrando o chão com os calcanhares.",
    ],
  }),
  afundo: (): Exercicio => ({
    id: "afundo",
    nome: "Afundo alternado",
    musculo: "Pernas",
    series: 3,
    reps: "10 cada",
    dificuldade: "Iniciante",
    emoji: "🚶",
    descansoSeg: 60,
    instrucoes: [
      "Dê um passo à frente e desça flexionando os dois joelhos a 90°.",
      "O joelho de trás quase encosta no chão.",
      "Volte à posição inicial e alterne a perna.",
    ],
  }),
  panturrilha: (): Exercicio => ({
    id: "panturrilha",
    nome: "Elevação de panturrilha",
    musculo: "Pernas",
    series: 4,
    reps: "15-20",
    dificuldade: "Iniciante",
    emoji: "🦶",
    descansoSeg: 30,
    instrucoes: [
      "Em pé, pontas dos pés em uma elevação.",
      "Suba o máximo na ponta dos pés.",
      "Desça lentamente até alongar a panturrilha.",
    ],
  }),

  // Ombro
  desenvolvimento: (n: Nivel): Exercicio => ({
    id: "desenvolvimento",
    nome: "Desenvolvimento com halteres",
    musculo: "Ombro",
    series: 3,
    reps: "8-10",
    dificuldade: "Intermediário",
    emoji: "🏋️",
    descansoSeg: 75,
    pesoSugerido: n === "iniciante" ? 6 : n === "intermediario" ? 10 : 16,
    instrucoes: [
      "Sentado, halteres na altura dos ombros.",
      "Empurre verticalmente até quase estender os braços.",
      "Desça com controle.",
    ],
  }),
  elevacaoLateral: (n: Nivel): Exercicio => ({
    id: "elevacaoLateral",
    nome: "Elevação lateral",
    musculo: "Ombro",
    series: 3,
    reps: "12-15",
    dificuldade: "Iniciante",
    emoji: "🤲",
    descansoSeg: 45,
    pesoSugerido: n === "iniciante" ? 3 : n === "intermediario" ? 6 : 10,
    instrucoes: [
      "Em pé, halteres ao lado do corpo.",
      "Eleve os braços lateralmente até a altura dos ombros.",
      "Desça lentamente sem balançar.",
    ],
  }),

  // Core / Cardio
  prancha: (): Exercicio => ({
    id: "prancha",
    nome: "Prancha frontal",
    musculo: "Core",
    series: 3,
    reps: "30-45s",
    dificuldade: "Iniciante",
    emoji: "🧘",
    descansoSeg: 45,
    instrucoes: [
      "Apoie antebraços e pontas dos pés no chão.",
      "Mantenha o corpo em linha reta, sem deixar o quadril cair.",
      "Respire profundamente durante toda a série.",
    ],
  }),
  abdominal: (): Exercicio => ({
    id: "abdominal",
    nome: "Abdominal supra",
    musculo: "Core",
    series: 3,
    reps: "20",
    dificuldade: "Iniciante",
    emoji: "🔥",
    descansoSeg: 30,
    instrucoes: [
      "Deitado, joelhos flexionados, mãos atrás da cabeça.",
      "Suba contraindo o abdômen até as escápulas saírem do chão.",
      "Desça com controle.",
    ],
  }),
  burpee: (): Exercicio => ({
    id: "burpee",
    nome: "Burpee",
    musculo: "Cardio",
    series: 4,
    reps: "10",
    dificuldade: "Avançado",
    emoji: "💥",
    descansoSeg: 45,
    instrucoes: [
      "Agache, apoie as mãos no chão e jogue os pés para trás (prancha).",
      "Faça uma flexão (opcional), volte os pés e salte com os braços para cima.",
      "Aterrisse suavemente e repita.",
    ],
  }),
  corrida: (): Exercicio => ({
    id: "corrida",
    nome: "Corrida intervalada",
    musculo: "Cardio",
    series: 6,
    reps: "1 min forte / 1 min leve",
    dificuldade: "Intermediário",
    emoji: "🏃",
    descansoSeg: 0,
    instrucoes: [
      "Aqueça por 5 minutos em ritmo leve.",
      "Alterne 1 minuto em ritmo forte e 1 minuto leve.",
      "Finalize com 5 minutos de desaquecimento.",
    ],
  }),
};

// ---------- Templates por foco ----------

type Foco = "Peito + Tríceps" | "Costas + Bíceps" | "Pernas" | "Ombro + Core" | "Full body" | "Cardio + Core";

function montar(foco: Foco, n: Nivel, c: Caminho): Exercicio[] {
  const temBarra = c === "barra";
  switch (foco) {
    case "Peito + Tríceps":
      return [EX.flexao(n), ...(temBarra ? [EX.supino(n)] : []), EX.triceps(n), EX.prancha()];
    case "Costas + Bíceps":
      return [
        ...(temBarra ? [EX.barraFixa(n)] : []),
        temBarra ? EX.remadaAustraliana() : EX.remadaCurvada(n),
        EX.rosca(n),
        EX.prancha(),
      ];
    case "Pernas":
      return [EX.agachamento(n), EX.afundo(), EX.panturrilha(), EX.abdominal()];
    case "Ombro + Core":
      return [EX.desenvolvimento(n), EX.elevacaoLateral(n), EX.prancha(), EX.abdominal()];
    case "Full body":
      return [
        EX.agachamento(n),
        EX.flexao(n),
        temBarra ? EX.remadaAustraliana() : EX.remadaCurvada(n),
        EX.prancha(),
      ];
    case "Cardio + Core":
      return [EX.corrida(), EX.burpee(), EX.abdominal(), EX.prancha()];
  }
}

function duracao(exs: Exercicio[]): number {
  // Aproxima: cada série ~ 60s + descanso
  return Math.round(
    exs.reduce((acc, e) => acc + e.series * (60 + e.descansoSeg), 0) / 60,
  );
}

// ---------- Seleção do split semanal ----------

function splitSemanal(obj: Objetivo, freq: number): Foco[] {
  const f = Math.max(2, Math.min(6, freq));
  if (obj === "emagrecer" || obj === "taf") {
    const base: Foco[] = ["Cardio + Core", "Full body", "Cardio + Core", "Full body", "Cardio + Core", "Full body"];
    return base.slice(0, f);
  }
  if (obj === "saude" || obj === "zero") {
    const base: Foco[] = ["Full body", "Full body", "Full body", "Cardio + Core", "Full body", "Cardio + Core"];
    return base.slice(0, f);
  }
  // forca / definicao
  if (f <= 3) {
    const base: Foco[] = ["Peito + Tríceps", "Costas + Bíceps", "Pernas"];
    return base.slice(0, f);
  }
  if (f === 4) {
    return ["Peito + Tríceps", "Costas + Bíceps", "Pernas", "Ombro + Core"];
  }
  const six: Foco[] = ["Peito + Tríceps", "Costas + Bíceps", "Pernas", "Ombro + Core", "Full body", "Cardio + Core"];
  return six.slice(0, f);
}

// ---------- API pública ----------

export function getPlanoSemanal(user: ElevoUser): Treino[] {
  const nivel: Nivel = user.nivel ?? "iniciante";
  const caminho: Caminho = user.caminho ?? "casa";
  const obj: Objetivo = user.objetivo ?? "saude";
  const freq = user.frequencia ?? 3;

  const focos = splitSemanal(obj, freq);
  return focos.map((foco, i) => {
    const exs = montar(foco, nivel, caminho);
    return {
      id: `t${i}`,
      nome: foco,
      foco,
      duracaoMin: duracao(exs),
      exercicios: exs,
    };
  });
}

export function getTreinoDoDia(user: ElevoUser, date = new Date()): Treino {
  const plano = getPlanoSemanal(user);
  // Mapeia dia da semana para um índice rotativo
  const idx = date.getDay() % plano.length;
  return plano[idx];
}
