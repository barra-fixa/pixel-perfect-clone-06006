// Treinos pré-montados que usam SOMENTE barra fixa + peso corporal.
// 3 níveis: Fundação, Clássico, Avançado — cada um com 3 dias (seg/qua/sex).

import { imagemDe, type ExercicioId } from "./exercicios-db";

export type ExercicioBarra = {
  id: ExercicioId | string;
  nome: string;
  series: number;
  reps: string;
  imagem?: string | null;
};

export type DiaBarra = {
  chave: "segunda" | "quarta" | "sexta";
  diaIdx: 0 | 2 | 4;
  nomeTreino: string;
  exercicios: ExercicioBarra[];
};

export type SemanaBarra = {
  id: 1 | 2 | 3;
  slug: "fundacao" | "classico" | "avancado";
  nome: string;
  icone: string;
  dificuldade: "Iniciante" | "Intermediário" | "Avançado";
  descricao: string;
  resumo: string;
  dias: DiaBarra[];
};

function ex(id: ExercicioId, nome: string, series: number, reps: string): ExercicioBarra {
  return { id, nome, series, reps, imagem: imagemDe(id) };
}

export const SEMANAS_SO_BARRA: SemanaBarra[] = [
  {
    id: 1,
    slug: "fundacao",
    nome: "Fundação",
    icone: "🔶",
    dificuldade: "Iniciante",
    descricao: "Dominando o próprio peso",
    resumo: "Construa força base com australiana, negativas e flexões.",
    dias: [
      {
        chave: "segunda",
        diaIdx: 0,
        nomeTreino: "Costas + Bíceps (Fundação)",
        exercicios: [
          ex("remadaAustraliana", "Barra australiana", 3, "8-12"),
          ex("barraFixa", "Barra negativa", 3, "5-8"),
          ex("flexao", "Flexão no chão", 3, "10-15"),
          ex("prancha", "Prancha frontal", 3, "20-30s"),
        ],
      },
      {
        chave: "quarta",
        diaIdx: 2,
        nomeTreino: "Peito + Tríceps (Fundação)",
        exercicios: [
          ex("remadaAustraliana", "Barra australiana inversa", 3, "8-12"),
          ex("triceps", "Fundos em cadeira", 3, "10-15"),
          ex("flexao", "Flexão no chão", 3, "12-15"),
          ex("prancha", "Prancha frontal", 3, "20-30s"),
        ],
      },
      {
        chave: "sexta",
        diaIdx: 4,
        nomeTreino: "Perna + Core (Fundação)",
        exercicios: [
          ex("agachamento", "Agachamento livre", 3, "12-15"),
          ex("afundo", "Afundo", 3, "10 cada"),
          ex("prancha", "Prancha frontal", 3, "30-45s"),
          ex("glutePonte", "Elevação de quadril", 3, "15-20"),
        ],
      },
    ],
  },
  {
    id: 2,
    slug: "classico",
    nome: "Clássico",
    icone: "🟠",
    dificuldade: "Intermediário",
    descricao: "Pull-ups puros e variações",
    resumo: "Pull-ups, chin-ups e australiana. O coração da barra fixa.",
    dias: [
      {
        chave: "segunda",
        diaIdx: 0,
        nomeTreino: "Costas + Bíceps (Clássico)",
        exercicios: [
          ex("barraFixa", "Pull-up", 3, "6-10"),
          ex("barraFixaSupinada", "Chin-up", 3, "8-12"),
          ex("remadaAustraliana", "Barra australiana", 3, "10-15"),
          ex("prancha", "Prancha frontal", 3, "30-45s"),
        ],
      },
      {
        chave: "quarta",
        diaIdx: 2,
        nomeTreino: "Peito + Tríceps (Clássico)",
        exercicios: [
          ex("flexao", "Flexão", 4, "12-15"),
          ex("flexaoDiamante", "Flexão diamante", 3, "8-12"),
          ex("triceps", "Fundos", 3, "10-12"),
          ex("pranchaAlta", "Prancha alta com toques", 3, "16 toques"),
        ],
      },
      {
        chave: "sexta",
        diaIdx: 4,
        nomeTreino: "Perna + Core (Clássico)",
        exercicios: [
          ex("agachamento", "Agachamento livre", 4, "12-15"),
          ex("agachamentoBulgaro", "Agachamento búlgaro", 3, "10 cada"),
          ex("glutePonte", "Elevação de quadril", 3, "15-20"),
          ex("bicycleCrunch", "Abdominal bicicleta", 3, "20 cada"),
        ],
      },
    ],
  },
  {
    id: 3,
    slug: "avancado",
    nome: "Avançado",
    icone: "🔴",
    dificuldade: "Avançado",
    descricao: "Progressão com variações",
    resumo: "Volume alto e variações desafiadoras. Para quem já domina a barra.",
    dias: [
      {
        chave: "segunda",
        diaIdx: 0,
        nomeTreino: "Costas + Bíceps (Avançado)",
        exercicios: [
          ex("barraFixa", "Pull-up", 4, "8-12"),
          ex("barraFixaSupinada", "Chin-up", 4, "8-12"),
          ex("remadaAustraliana", "Australiana pés elevados", 3, "12-15"),
          ex("prancha", "Prancha frontal", 3, "45-60s"),
        ],
      },
      {
        chave: "quarta",
        diaIdx: 2,
        nomeTreino: "Peito + Tríceps (Avançado)",
        exercicios: [
          ex("flexaoDiamante", "Flexão diamante", 4, "10-15"),
          ex("flexao", "Flexão pés elevados", 4, "12-15"),
          ex("triceps", "Fundos profundos", 4, "12-15"),
          ex("pranchaAlta", "Prancha alta com toques", 3, "20 toques"),
        ],
      },
      {
        chave: "sexta",
        diaIdx: 4,
        nomeTreino: "Perna + Core (Avançado)",
        exercicios: [
          ex("agachamentoBulgaro", "Agachamento búlgaro", 4, "12 cada"),
          ex("afundo", "Afundo caminhando", 4, "12 cada"),
          ex("glutePonte", "Elevação de quadril unilateral", 3, "12 cada"),
          ex("bicycleCrunch", "Abdominal bicicleta", 4, "25 cada"),
        ],
      },
    ],
  },
];

export function semanaPorSlug(slug: string): SemanaBarra | undefined {
  return SEMANAS_SO_BARRA.find((s) => s.slug === slug);
}
