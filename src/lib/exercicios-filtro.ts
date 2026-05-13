// Filtragem inteligente de exercícios:
// - Substitui exercícios que precisam de equipamento ausente por alternativas caseiras.
// - Modo "Só Barra Fixa": mantém apenas exercícios com barra ou peso corporal.
//
// O `montar()` em treinos.ts já considera caminho/equipamentos. Esse módulo aplica
// uma camada de pós-processamento que: (a) garante que nada com equipamento não
// marcado escape; (b) implementa o "modo só barra fixa".

import type { Exercicio } from "./treinos";
import type { ExercicioId } from "./exercicios-db";

export type EquipReq = "nenhum" | "barra" | "peso" | "corda" | "paralela";

export const EXERCICIOS_COMPATIVEL_BARRA_FIXA_PAREDE: ExercicioId[] = [
  "barraFixa",
  "barraFixaSupinada",
  "remadaAustraliana",
];

// Equipamento mínimo que cada exercício exige para ser executado bem.
const EQUIP_REQ: Record<ExercicioId, EquipReq> = {
  flexao: "nenhum",
  supino: "peso",
  triceps: "nenhum",
  flexaoDiamante: "nenhum",

  barraFixa: "barra",
  barraFixaSupinada: "barra",
  remadaAustraliana: "barra",
  remadaCurvada: "peso",

  rosca: "peso",
  roscaMartelo: "peso",

  agachamento: "nenhum",
  agachamentoBulgaro: "nenhum",
  afundo: "nenhum",
  panturrilha: "nenhum",
  glutePonte: "nenhum",
  steup: "nenhum",

  desenvolvimento: "peso",
  elevacaoLateral: "peso",
  elevacaoFrontal: "peso",

  prancha: "nenhum",
  pranchaLateral: "nenhum",
  abdominal: "nenhum",
  bicycleCrunch: "nenhum",
  deadbug: "nenhum",
  pranchaAlta: "nenhum",

  burpee: "nenhum",
  jumpingJack: "nenhum",
  mountainClimber: "nenhum",
  corrida: "nenhum",
  pular: "corda",
};

// Substituições caseiras (mesmo músculo, sem o equipamento ausente).
const ALTERNATIVA_CASEIRA: Partial<Record<ExercicioId, ExercicioId>> = {
  supino: "flexao",
  remadaCurvada: "remadaAustraliana", // se também não tiver barra, vira flexao via segundo passo
  rosca: "flexaoDiamante",
  roscaMartelo: "flexaoDiamante",
  desenvolvimento: "pranchaAlta",
  elevacaoLateral: "pranchaAlta",
  elevacaoFrontal: "pranchaAlta",
  pular: "jumpingJack",
};

// Substituições para o modo "Só Barra Fixa" (sem peso/paralela/corda).
const ALTERNATIVA_BARRA: Partial<Record<ExercicioId, ExercicioId>> = {
  supino: "flexao",
  remadaCurvada: "remadaAustraliana",
  rosca: "barraFixaSupinada",
  roscaMartelo: "barraFixaSupinada",
  desenvolvimento: "pranchaAlta",
  elevacaoLateral: "pranchaAlta",
  elevacaoFrontal: "pranchaAlta",
  pular: "jumpingJack",
  flexaoDiamante: "flexao",
};

function temEquip(equipamentos: string[], req: EquipReq, caminho: string): boolean {
  if (req === "nenhum") return true;
  if (req === "barra") return caminho === "barra";
  if (req === "peso") return equipamentos.includes("halteres") || equipamentos.includes("kettlebell");
  if (req === "corda") return equipamentos.includes("corda");
  if (req === "paralela") return equipamentos.includes("paralela");
  return true;
}

export type FiltroOpts = {
  equipamentos: string[];
  caminho: "barra" | "casa";
  modoBarraFixa: boolean;
};

/**
 * Aplica filtragem em uma lista de exercícios. Substitui (não remove) sempre que
 * possível para preservar a estrutura do treino.
 */
export function filtrarExercicios(
  exs: Exercicio[],
  opts: FiltroOpts,
  builder: (id: ExercicioId) => Exercicio,
): Exercicio[] {
  const out: Exercicio[] = [];
  for (const ex of exs) {
    const id = ex.id as ExercicioId;
    const req = EQUIP_REQ[id];
    const nomeNormalizado = `${ex.nome ?? ""}`.toLowerCase();
    const ehBarraAustraliana = id === "remadaAustraliana" || nomeNormalizado.includes("australiana");

    // Modo "Só Barra Fixa": qualquer coisa que não seja barra ou nenhum vira alternativa.
    if (opts.modoBarraFixa && req !== "barra" && req !== "nenhum") {
      if (ehBarraAustraliana) {
        console.warn("❌ Exercício removido: Barra australiana [inversa] (incompatível com barra fixa de parede)");
      }
      const alt = ALTERNATIVA_BARRA[id];
      if (alt) out.push(builder(alt));
      continue;
    }

    if (opts.modoBarraFixa && req === "barra" && ehBarraAustraliana && !EXERCICIOS_COMPATIVEL_BARRA_FIXA_PAREDE.includes(id)) {
      console.warn("❌ Exercício removido: Barra australiana [inversa] (incompatível com barra fixa de parede)");
      continue;
    }

    // Tem o equipamento? mantém.
    if (temEquip(opts.equipamentos, req, opts.caminho)) {
      out.push(ex);
      continue;
    }

    // Não tem o equipamento: troca por alternativa caseira.
    const alt = ALTERNATIVA_CASEIRA[id];
    if (alt) {
      const altReq = EQUIP_REQ[alt];
      if (temEquip(opts.equipamentos, altReq, opts.caminho)) {
        out.push(builder(alt));
        continue;
      }
    }
    // Sem alternativa válida: pula.
  }
  // Dedup por id, preservando ordem.
  const seen = new Set<string>();
  return out.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
}
