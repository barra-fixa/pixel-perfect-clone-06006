// Motor 100% estático para o Free: TDEE + templates de refeição por objetivo.
// Zero IA, zero custo. Pré-via de 1 dia sai daqui.
import type { Refeicao } from "./dieta.functions";

export type SexoTDEE = "masc" | "fem";

export type PerfilTDEE = {
  objetivo: string; // texto livre
  sexo?: SexoTDEE;
  idade?: number;
  pesoKg?: number;
  alturaCm?: number;
  nivelAtividade?: "sedentario" | "leve" | "moderado" | "intenso";
};

const ATIVIDADE_FATOR: Record<NonNullable<PerfilTDEE["nivelAtividade"]>, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
};

/** Mifflin-St Jeor + fator atividade + ajuste pelo objetivo. */
export function calcularCalorias(p: PerfilTDEE): { kcal: number; proteinaG: number; resumo: string } {
  const sexo = p.sexo ?? "masc";
  const idade = p.idade ?? 30;
  const peso = p.pesoKg ?? (sexo === "masc" ? 78 : 65);
  const altura = p.alturaCm ?? (sexo === "masc" ? 175 : 162);
  const nivel = p.nivelAtividade ?? "moderado";

  const bmr = sexo === "masc"
    ? 10 * peso + 6.25 * altura - 5 * idade + 5
    : 10 * peso + 6.25 * altura - 5 * idade - 161;

  const tdee = bmr * ATIVIDADE_FATOR[nivel];

  const obj = p.objetivo.toLowerCase();
  let kcal = tdee;
  let proteinaPorKg = 1.6;
  if (/emagrec|cutting|definicao|definição|perd/.test(obj)) {
    kcal = tdee - 400;
    proteinaPorKg = 2.0;
  } else if (/massa|ganho|forca|força|hipertrofia/.test(obj)) {
    kcal = tdee + 300;
    proteinaPorKg = 1.8;
  } else if (/taf|performance/.test(obj)) {
    kcal = tdee + 150;
    proteinaPorKg = 1.8;
  }

  kcal = Math.round(kcal / 50) * 50;
  const proteinaG = Math.round(peso * proteinaPorKg);
  return {
    kcal,
    proteinaG,
    resumo: `~${kcal} kcal/dia · ${proteinaG}g proteína`,
  };
}

type Template = {
  nome: string;
  horario: string;
  itens: string[];
  caloriasPct: number; // fração da diária
};

const CAFE: Template[] = [
  { nome: "Café da manhã", horario: "07:00", caloriasPct: 0.25,
    itens: ["2 ovos mexidos", "2 fatias de pão integral", "1 fruta (banana ou maçã)", "Café preto sem açúcar"] },
  { nome: "Café da manhã", horario: "07:00", caloriasPct: 0.25,
    itens: ["Tapioca (4 colheres) com queijo branco", "1 fruta", "Café com leite desnatado"] },
];
const LANCHE_MANHA: Template = {
  nome: "Lanche da manhã", horario: "10:00", caloriasPct: 0.10,
  itens: ["1 iogurte natural", "1 colher de granola sem açúcar"],
};
const ALMOCO: Template[] = [
  { nome: "Almoço", horario: "12:30", caloriasPct: 0.30,
    itens: ["4 colheres de arroz integral", "1 concha de feijão", "150g de frango grelhado", "Salada à vontade (folhas, tomate, pepino)"] },
  { nome: "Almoço", horario: "12:30", caloriasPct: 0.30,
    itens: ["1 batata-doce média", "150g de patinho moído", "Brócolis e cenoura refogados", "Salada de folhas"] },
];
const LANCHE_TARDE: Template = {
  nome: "Lanche da tarde", horario: "16:00", caloriasPct: 0.10,
  itens: ["1 fruta", "30g de castanhas mistas"],
};
const PRE_TREINO: Template = {
  nome: "Pré-treino", horario: "17:30", caloriasPct: 0.10,
  itens: ["1 banana", "1 café preto"],
};
const JANTAR: Template[] = [
  { nome: "Jantar", horario: "20:00", caloriasPct: 0.25,
    itens: ["150g de filé de tilápia ou frango", "Legumes assados (abobrinha, cenoura)", "1 porção pequena de arroz"] },
  { nome: "Jantar", horario: "20:00", caloriasPct: 0.25,
    itens: ["Omelete com 3 ovos + queijo branco + tomate", "Salada de folhas com azeite"] },
];
const CEIA: Template = {
  nome: "Ceia", horario: "22:00", caloriasPct: 0.05,
  itens: ["1 iogurte natural ou 1 copo de leite desnatado", "1 colher de pasta de amendoim"],
};

function aplicaRestricoes(itens: string[], restricoes: string): string[] {
  const r = restricoes.toLowerCase();
  return itens.map((i) => {
    let s = i;
    if (/lactose|leite/.test(r)) {
      s = s.replace(/leite desnatado/gi, "bebida vegetal sem açúcar")
           .replace(/iogurte natural/gi, "iogurte vegetal")
           .replace(/queijo branco/gi, "tofu temperado");
    }
    if (/gluten|glúten/.test(r)) {
      s = s.replace(/pão integral/gi, "pão sem glúten")
           .replace(/tapioca/gi, "tapioca"); // já é sem glúten
    }
    if (/vegetarian|vegan/.test(r)) {
      s = s.replace(/frango grelhado|patinho moído|filé de tilápia ou frango/gi, "grão-de-bico ou tofu temperado");
    }
    return s;
  }).filter(Boolean);
}

function escolhe<T>(arr: T[], seed: number): T { return arr[seed % arr.length]; }

/** Monta 1 dia a partir dos templates respeitando refeicoes/dia e restrições. */
export function montarDiaEstatico(opts: {
  objetivo: string;
  restricoes: string;
  refeicoesPorDia: number;
  preferencias: string;
  diaSeed?: number;
  caloriasDia: number;
}): Refeicao[] {
  const seed = opts.diaSeed ?? 0;
  const todas: Template[] = [
    escolhe(CAFE, seed),
    LANCHE_MANHA,
    escolhe(ALMOCO, seed),
    LANCHE_TARDE,
    PRE_TREINO,
    escolhe(JANTAR, seed),
    CEIA,
  ];
  // Reduz pra refeicoesPorDia mantendo café, almoço, jantar como prioridade.
  const prioridade = [0, 2, 5, 1, 3, 6, 4];
  const ordemEscolhida = prioridade.slice(0, Math.min(opts.refeicoesPorDia, 7)).sort((a, b) => a - b);
  const selecionadas = ordemEscolhida.map((i) => todas[i]);

  // Normaliza % calorias pra somar 1
  const somaPct = selecionadas.reduce((s, t) => s + t.caloriasPct, 0);
  return selecionadas.map((t) => ({
    nome: t.nome,
    horario: t.horario,
    itens: aplicaRestricoes(t.itens, opts.restricoes),
    calorias: Math.round((t.caloriasPct / somaPct) * opts.caloriasDia),
  }));
}

/** Título amigável por objetivo. */
export function tituloDietaPorObjetivo(obj: string): string {
  const o = obj.toLowerCase();
  if (/emagrec|definicao|definição/.test(o)) return "Plano alimentar de emagrecimento";
  if (/massa|hipertrofia|forca|força|ganho/.test(o)) return "Plano alimentar de ganho de massa";
  if (/taf|performance/.test(o)) return "Plano alimentar de performance";
  return "Plano alimentar equilibrado";
}
