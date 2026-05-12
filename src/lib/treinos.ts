// Gerador de planos de treino, baseado em objetivo / caminho / nível / frequência.
// Usa o banco em src/lib/exercicios-db.ts (imagens públicas do Free Exercise DB).
// Determinístico por dia da semana.
import { EXERCICIOS_BASE, imagemDe, imagemFinalDe, type ExercicioId } from "./exercicios-db";
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
  errosComuns?: string[];
  dicas?: string[];
  imagem?: string | null;
  imagemFinal?: string | null;
};

export type Treino = {
  id: string;
  nome: string;
  foco: string;
  duracaoMin: number;
  exercicios: Exercicio[];
};

// ---------- Parametrização por nível ----------

type Params = {
  series: number;
  reps: string;
  descansoSeg: number;
  pesoSugerido?: number;
  dificuldade: "Iniciante" | "Intermediário" | "Avançado";
};

// Define parâmetros de séries/reps/descanso por exercício e nível.
// Centraliza a "receita" — fica fácil ajustar progressão.
function paramsDe(id: ExercicioId, n: Nivel): Params {
  const isIniciante = n === "iniciante";
  const isAvancado = n === "avancado";

  switch (id) {
    // ---- Peito / Tríceps ----
    case "flexao":
      return {
        series: isIniciante ? 3 : 4,
        reps: isIniciante ? "8-10" : "12-15",
        descansoSeg: 60,
        dificuldade: isIniciante ? "Iniciante" : "Intermediário",
      };
    case "supino":
      return {
        series: 4,
        reps: isAvancado ? "6-8" : "8-12",
        descansoSeg: 90,
        pesoSugerido: isIniciante ? 10 : n === "intermediario" ? 16 : 24,
        dificuldade: "Intermediário",
      };
    case "triceps":
      return { series: 3, reps: "10-12", descansoSeg: 45, dificuldade: "Iniciante" };
    case "flexaoDiamante":
      return {
        series: 3,
        reps: isIniciante ? "5-8" : "8-12",
        descansoSeg: 60,
        dificuldade: isIniciante ? "Intermediário" : "Avançado",
      };

    // ---- Costas / Bíceps ----
    case "barraFixa":
      return {
        series: isIniciante ? 3 : 4,
        reps: isIniciante ? "Máx" : "6-10",
        descansoSeg: 75,
        dificuldade: isIniciante ? "Intermediário" : "Avançado",
      };
    case "barraFixaSupinada":
      return {
        series: 3,
        reps: isIniciante ? "Máx" : "6-10",
        descansoSeg: 75,
        dificuldade: isIniciante ? "Intermediário" : "Avançado",
      };
    case "remadaAustraliana":
      return { series: 3, reps: "10-12", descansoSeg: 60, dificuldade: "Iniciante" };
    case "remadaCurvada":
      return {
        series: 4,
        reps: "8-10",
        descansoSeg: 75,
        pesoSugerido: isIniciante ? 8 : n === "intermediario" ? 14 : 20,
        dificuldade: "Intermediário",
      };
    case "rosca":
      return {
        series: 3,
        reps: "10-12",
        descansoSeg: 45,
        pesoSugerido: isIniciante ? 6 : n === "intermediario" ? 10 : 14,
        dificuldade: "Iniciante",
      };
    case "roscaMartelo":
      return {
        series: 3,
        reps: "10-12",
        descansoSeg: 45,
        pesoSugerido: isIniciante ? 6 : n === "intermediario" ? 10 : 14,
        dificuldade: "Iniciante",
      };

    // ---- Pernas ----
    case "agachamento":
      return {
        series: isIniciante ? 3 : 4,
        reps: isIniciante ? "12" : "8-10",
        descansoSeg: 90,
        pesoSugerido: isIniciante ? 0 : n === "intermediario" ? 20 : 40,
        dificuldade: "Intermediário",
      };
    case "agachamentoBulgaro":
      return {
        series: 3,
        reps: "10 cada",
        descansoSeg: 75,
        pesoSugerido: isIniciante ? 0 : n === "intermediario" ? 8 : 14,
        dificuldade: "Intermediário",
      };
    case "afundo":
      return { series: 3, reps: "10 cada", descansoSeg: 60, dificuldade: "Iniciante" };
    case "panturrilha":
      return { series: 4, reps: "15-20", descansoSeg: 30, dificuldade: "Iniciante" };
    case "glutePonte":
      return { series: 3, reps: "12-15", descansoSeg: 45, dificuldade: "Iniciante" };
    case "steup":
      return { series: 3, reps: "10 cada", descansoSeg: 60, dificuldade: "Iniciante" };

    // ---- Ombro ----
    case "desenvolvimento":
      return {
        series: 3,
        reps: "8-10",
        descansoSeg: 75,
        pesoSugerido: isIniciante ? 6 : n === "intermediario" ? 10 : 16,
        dificuldade: "Intermediário",
      };
    case "elevacaoLateral":
      return {
        series: 3,
        reps: "12-15",
        descansoSeg: 45,
        pesoSugerido: isIniciante ? 3 : n === "intermediario" ? 6 : 10,
        dificuldade: "Iniciante",
      };
    case "elevacaoFrontal":
      return {
        series: 3,
        reps: "10-12",
        descansoSeg: 45,
        pesoSugerido: isIniciante ? 3 : n === "intermediario" ? 6 : 10,
        dificuldade: "Iniciante",
      };

    // ---- Core ----
    case "prancha":
      return { series: 3, reps: "30-45s", descansoSeg: 45, dificuldade: "Iniciante" };
    case "pranchaLateral":
      return { series: 2, reps: "30s cada", descansoSeg: 30, dificuldade: "Iniciante" };
    case "abdominal":
      return { series: 3, reps: "20", descansoSeg: 30, dificuldade: "Iniciante" };
    case "bicycleCrunch":
      return { series: 3, reps: "20 cada", descansoSeg: 30, dificuldade: "Iniciante" };
    case "deadbug":
      return { series: 3, reps: "10 cada", descansoSeg: 30, dificuldade: "Iniciante" };
    case "pranchaAlta":
      return { series: 3, reps: "16 toques", descansoSeg: 45, dificuldade: "Intermediário" };

    // ---- Cardio ----
    case "burpee":
      return { series: 4, reps: "10", descansoSeg: 45, dificuldade: "Avançado" };
    case "jumpingJack":
      return { series: 3, reps: "40s", descansoSeg: 30, dificuldade: "Iniciante" };
    case "mountainClimber":
      return { series: 3, reps: "30s", descansoSeg: 30, dificuldade: "Iniciante" };
    case "corrida":
      return { series: 6, reps: "1 min forte / 1 min leve", descansoSeg: 0, dificuldade: "Intermediário" };
    case "pular":
      return { series: 4, reps: "1 min", descansoSeg: 30, dificuldade: "Iniciante" };
  }
}

/** Constrói um Exercicio (com imagem) a partir de um ID do banco e nível. */
function ex(id: ExercicioId, n: Nivel): Exercicio {
  const base = EXERCICIOS_BASE[id];
  const p = paramsDe(id, n);
  return {
    id,
    nome: base.nome,
    musculo: base.musculo,
    emoji: base.emoji,
    series: p.series,
    reps: p.reps,
    descansoSeg: p.descansoSeg,
    pesoSugerido: p.pesoSugerido,
    dificuldade: p.dificuldade,
    instrucoes: [...base.instrucoes],
    errosComuns: [...base.errosComuns],
    dicas: base.dicas ? [...base.dicas] : undefined,
    imagem: imagemDe(id),
    imagemFinal: imagemFinalDe(id),
  };
}

// ---------- Templates por foco ----------

type Foco =
  | "Peito + Tríceps"
  | "Costas + Bíceps"
  | "Pernas"
  | "Ombro + Core"
  | "Full body"
  | "Cardio + Core";

/**
 * Monta a lista de exercícios para um dado foco, caminho e equipamentos.
 *
 * Regras de negócio:
 * - `caminho === "barra"`: barra fixa é o centro do treino. Quando o foco
 *   permite (costas, bíceps, full body, core), a barra entra como exercício PRINCIPAL.
 *   Onde a barra não trabalha (peito, perna), usamos peso do corpo e oferecemos
 *   variações de calistenia que mantêm o aluno fluindo entre os treinos.
 *
 * - `caminho === "casa"`: peso do corpo é o padrão. Halteres, elásticos, etc só
 *   entram se o usuário marcou explicitamente em `equipamentos`. Sem nada marcado
 *   (ou com "nenhum" marcado), o treino é 100% peso do corpo.
 */
function montar(foco: Foco, n: Nivel, c: Caminho, equipamentos: string[]): Exercicio[] {
  const temBarra = c === "barra";
  const temHalteres = equipamentos.includes("halteres");
  const temKettlebell = equipamentos.includes("kettlebell");
  const temParalela = equipamentos.includes("paralela");
  const temCorda = equipamentos.includes("corda");

  // Kettlebell se comporta como "peso" em muitos exercícios (agachamento goblet,
  // press, swing). Por simplicidade, ele "destrava" exercícios com carga,
  // assim como os halteres. Quando o usuário tem qualquer um dos dois, o app
  // pode usar exercícios com peso.
  const temPeso = temHalteres || temKettlebell;

  switch (foco) {
    case "Peito + Tríceps":
      // Barra paralela é PERFEITA pra peito e tríceps (dips/mergulho).
      // Se tem paralela, usamos como complemento à flexão.
      if (temBarra && temParalela) {
        return [ex("flexao", n), ex("flexaoDiamante", n), ex("triceps", n), ex("prancha", n)];
      }
      if (temBarra) {
        return [ex("flexao", n), ex("flexaoDiamante", n), ex("triceps", n), ex("prancha", n)];
      }
      if (temParalela) {
        return [ex("flexao", n), ex("triceps", n), ex("flexaoDiamante", n), ex("prancha", n)];
      }
      if (temPeso) {
        return [ex("flexao", n), ex("supino", n), ex("triceps", n), ex("prancha", n)];
      }
      return [ex("flexao", n), ex("flexaoDiamante", n), ex("triceps", n), ex("prancha", n)];

    case "Costas + Bíceps":
      // Aqui é onde a barra REALMENTE brilha.
      if (temBarra) {
        return [
          ex("barraFixa", n), // principal — costas
          ex("barraFixaSupinada", n), // principal — bíceps
          ex("remadaAustraliana", n), // complementar (mesma barra)
          ex("prancha", n), // core como fechamento
        ];
      }
      if (temPeso) {
        return [ex("remadaCurvada", n), ex("rosca", n), ex("roscaMartelo", n), ex("prancha", n)];
      }
      // Sem barra e sem peso: alternativas com peso corporal
      return [ex("flexao", n), ex("flexaoDiamante", n), ex("prancha", n), ex("deadbug", n)];

    case "Pernas":
      // Barra fixa não trabalha pernas. Kettlebell pode adicionar carga (goblet squat ~ agachamento com peso).
      // Sempre peso do corpo aqui, com adição de exercícios mais desafiadores se tiver peso.
      return [
        ex("agachamento", n),
        ex("afundo", n),
        ex("agachamentoBulgaro", n),
        ex("glutePonte", n),
        ex("panturrilha", n),
      ];

    case "Ombro + Core":
      // Ombro: com peso (halteres/kettlebell) usamos desenvolvimento; sem, usamos peso corporal.
      if (temPeso) {
        return [ex("desenvolvimento", n), ex("elevacaoLateral", n), ex("pranchaLateral", n), ex("deadbug", n)];
      }
      // Sem peso: pike push-up (flexão pike trabalha ombro), prancha alta
      return [ex("pranchaAlta", n), ex("flexaoDiamante", n), ex("pranchaLateral", n), ex("deadbug", n)];

    case "Full body":
      // Full body com barra: barra fixa é o exercício principal,
      // complementado com agachamento (perna), flexão (peito) e prancha (core).
      if (temBarra) {
        return [
          ex("barraFixa", n), // principal
          ex("agachamento", n), // perna
          ex("flexao", n), // peito
          ex("prancha", n), // core
        ];
      }
      if (temPeso) {
        return [ex("agachamento", n), ex("flexao", n), ex("remadaCurvada", n), ex("prancha", n)];
      }
      return [ex("agachamento", n), ex("flexao", n), ex("burpee", n), ex("prancha", n)];

    case "Cardio + Core":
      // Corda de pular é o equipamento ideal pra cardio explosivo.
      // Quando tem, substitui jumping jack (mesmo músculo, mais eficiente).
      const cardio1 = temCorda ? ex("pular", n) : ex("jumpingJack", n);

      if (temBarra) {
        return [
          cardio1,
          ex("burpee", n),
          ex("mountainClimber", n),
          ex("abdominal", n),
          ex("bicycleCrunch", n),
        ];
      }
      return [
        cardio1,
        ex("burpee", n),
        ex("mountainClimber", n),
        ex("abdominal", n),
        ex("prancha", n),
      ];
  }
}

function duracao(exs: Exercicio[]): number {
  // Aproxima: cada série ~ 60s + descanso
  return Math.round(exs.reduce((acc, e) => acc + e.series * (60 + e.descansoSeg), 0) / 60);
}

// ---------- Seleção do split semanal ----------

function splitSemanal(obj: Objetivo, freq: number): Foco[] {
  const f = Math.max(2, Math.min(6, freq));
  if (obj === "emagrecer" || obj === "taf") {
    const base: Foco[] = [
      "Cardio + Core",
      "Full body",
      "Cardio + Core",
      "Full body",
      "Cardio + Core",
      "Full body",
    ];
    return base.slice(0, f);
  }
  if (obj === "saude" || obj === "zero") {
    const base: Foco[] = [
      "Full body",
      "Full body",
      "Full body",
      "Cardio + Core",
      "Full body",
      "Cardio + Core",
    ];
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
  const six: Foco[] = [
    "Peito + Tríceps",
    "Costas + Bíceps",
    "Pernas",
    "Ombro + Core",
    "Full body",
    "Cardio + Core",
  ];
  return six.slice(0, f);
}

// ---------- API pública ----------

export function getPlanoSemanal(user: ElevoUser): Treino[] {
  const nivel: Nivel = user.nivel ?? "iniciante";
  const caminho: Caminho = user.caminho ?? "casa";
  const obj: Objetivo = user.objetivo ?? "saude";
  const freq = user.frequencia ?? 3;
  const equipamentos = user.equipamentos ?? [];

  const focos = splitSemanal(obj, freq);
  return focos.map((foco, i) => {
    const exs = montar(foco, nivel, caminho, equipamentos);
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
  const idx = date.getDay() % plano.length;
  return plano[idx];
}
