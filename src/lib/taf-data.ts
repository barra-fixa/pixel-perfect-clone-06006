// Mock TAF (Teste de Aptidão Física) standards per cargo.
// Valores aproximados — ajuste conforme edital oficial.

export type ProvaTipo = "reps" | "tempo" | "distancia";

export type Prova = {
  id: string;
  nome: string;
  emoji: string;
  tipo: ProvaTipo;
  unidade: string; // "reps", "s", "m"
  duracaoSegundos?: number; // para provas com tempo limite
  meta: { masc: number; fem: number };
  descricao: string;
};

export type Cargo = {
  id: string;
  nome: string;
  sigla: string;
  emoji: string;
  cor: string; // oklch token
  provas: Prova[];
};

export const CARGOS: Cargo[] = [
  {
    id: "pm",
    nome: "Polícia Militar",
    sigla: "PM",
    emoji: "🚓",
    cor: "var(--primary)",
    provas: [
      {
        id: "flexao",
        nome: "Flexão de braço",
        emoji: "💪",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 60,
        meta: { masc: 30, fem: 18 },
        descricao: "Máximo de repetições em 1 minuto.",
      },
      {
        id: "abdominal",
        nome: "Abdominal",
        emoji: "🔥",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 60,
        meta: { masc: 35, fem: 25 },
        descricao: "Máximo de repetições em 1 minuto.",
      },
      {
        id: "corrida",
        nome: "Corrida 12 min",
        emoji: "🏃",
        tipo: "distancia",
        unidade: "m",
        duracaoSegundos: 720,
        meta: { masc: 2400, fem: 2000 },
        descricao: "Maior distância possível em 12 minutos.",
      },
    ],
  },
  {
    id: "bombeiro",
    nome: "Bombeiro Militar",
    sigla: "CBM",
    emoji: "🚒",
    cor: "var(--warning)",
    provas: [
      {
        id: "barra",
        nome: "Barra fixa",
        emoji: "🤸",
        tipo: "reps",
        unidade: "reps",
        meta: { masc: 6, fem: 1 },
        descricao: "Máximo de repetições estáticas.",
      },
      {
        id: "flexao",
        nome: "Flexão de braço",
        emoji: "💪",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 60,
        meta: { masc: 30, fem: 20 },
        descricao: "Máximo em 1 minuto.",
      },
      {
        id: "abdominal",
        nome: "Abdominal",
        emoji: "🔥",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 60,
        meta: { masc: 40, fem: 30 },
        descricao: "Máximo em 1 minuto.",
      },
      {
        id: "corrida",
        nome: "Corrida 12 min",
        emoji: "🏃",
        tipo: "distancia",
        unidade: "m",
        duracaoSegundos: 720,
        meta: { masc: 2600, fem: 2200 },
        descricao: "Maior distância em 12 minutos.",
      },
    ],
  },
  {
    id: "exercito",
    nome: "Exército Brasileiro",
    sigla: "EB",
    emoji: "🪖",
    cor: "var(--secondary)",
    provas: [
      {
        id: "flexao",
        nome: "Flexão de braço",
        emoji: "💪",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 120,
        meta: { masc: 33, fem: 17 },
        descricao: "Máximo em 2 minutos.",
      },
      {
        id: "abdominal",
        nome: "Abdominal",
        emoji: "🔥",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 120,
        meta: { masc: 42, fem: 32 },
        descricao: "Máximo em 2 minutos.",
      },
      {
        id: "corrida",
        nome: "Corrida 12 min",
        emoji: "🏃",
        tipo: "distancia",
        unidade: "m",
        duracaoSegundos: 720,
        meta: { masc: 2400, fem: 2000 },
        descricao: "Maior distância em 12 minutos.",
      },
    ],
  },
  {
    id: "prf",
    nome: "Polícia Rodoviária Federal",
    sigla: "PRF",
    emoji: "🛣️",
    cor: "var(--primary)",
    provas: [
      {
        id: "barra",
        nome: "Barra fixa",
        emoji: "🤸",
        tipo: "reps",
        unidade: "reps",
        meta: { masc: 5, fem: 15 }, // fem isometria s
        descricao: "Pronação, sem balanço.",
      },
      {
        id: "flexao",
        nome: "Flexão de braço",
        emoji: "💪",
        tipo: "reps",
        unidade: "reps",
        duracaoSegundos: 60,
        meta: { masc: 25, fem: 16 },
        descricao: "Máximo em 1 minuto.",
      },
      {
        id: "corrida",
        nome: "Corrida 12 min",
        emoji: "🏃",
        tipo: "distancia",
        unidade: "m",
        duracaoSegundos: 720,
        meta: { masc: 2400, fem: 2000 },
        descricao: "Maior distância em 12 minutos.",
      },
    ],
  },
];

export function getCargo(id?: string): Cargo | undefined {
  return CARGOS.find((c) => c.id === id);
}
