import type { Objetivo } from "./elevo-store";

export const OBJETIVO_LABEL: Record<Objetivo, string> = {
  forca: "Ganhar força",
  emagrecer: "Emagrecer",
  taf: "Passar no TAF",
  saude: "Saúde",
  definicao: "Definição",
  zero: "Começar do zero",
};

/** Título personalizado pro plano de acordo com o objetivo. */
export function tituloPlanoPorObjetivo(obj?: Objetivo): string {
  switch (obj) {
    case "taf": return "Seu plano de aprovação no TAF";
    case "emagrecer": return "Seu plano de emagrecimento";
    case "forca": return "Seu plano de ganho de força";
    case "definicao": return "Seu plano de definição muscular";
    case "saude": return "Seu plano de saúde e disposição";
    case "zero": return "Seu plano pra começar do zero";
    default: return "Seu plano de treino personalizado";
  }
}

/** Pitch curto pro Pro de acordo com o objetivo. */
export function pitchProPorObjetivo(obj?: Objetivo): string {
  switch (obj) {
    case "taf": return "Plano completo de 12 semanas até o TAF + dieta de performance.";
    case "emagrecer": return "Plano de emagrecimento + dieta de déficit calórico personalizada.";
    case "forca": return "Progressão de força 12-24 semanas + dieta de ganho muscular.";
    case "definicao": return "Programa de definição + dieta de cutting personalizada.";
    case "saude": return "Rotina sustentável de saúde + plano alimentar equilibrado.";
    case "zero": return "Plano completo do zero ao avançado + dieta pra iniciantes.";
    default: return "Plano completo personalizado + sua dieta gerada por IA.";
  }
}
