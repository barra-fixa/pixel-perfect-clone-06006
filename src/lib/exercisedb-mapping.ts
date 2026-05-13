// Mapeia nossos IDs internos pra nomes do ExerciseDB (https://exercisedb.io)
// Cada exercício tem um nome alvo e fallbacks de músculos (caso a API falhe).

import type { ExercicioId } from "./exercicios-db";

export type ExerciseDbInfo = {
  // Nome usado na busca da API (case-insensitive)
  searchName: string;
  // Fallback caso a API esteja offline / sem chave
  fallback: {
    target: string; // músculo primário (lats, biceps, etc — termos ExerciseDB)
    secondary: string[]; // músculos secundários
  };
};

export const EXERCISEDB_MAPPING: Record<ExercicioId, ExerciseDbInfo> = {
  flexao:           { searchName: "push-up",                fallback: { target: "pectorals", secondary: ["triceps", "delts", "serratus anterior"] } },
  supino:           { searchName: "barbell bench press",    fallback: { target: "pectorals", secondary: ["triceps", "delts"] } },
  triceps:          { searchName: "triceps dips",           fallback: { target: "triceps", secondary: ["pectorals", "delts"] } },
  flexaoDiamante:   { searchName: "diamond push-up",        fallback: { target: "triceps", secondary: ["pectorals", "delts"] } },
  barraFixa:        { searchName: "pull up",                fallback: { target: "lats", secondary: ["biceps", "traps", "forearms"] } },
  barraFixaSupinada:{ searchName: "chin up",                fallback: { target: "biceps", secondary: ["lats", "traps"] } },
  remadaAustraliana:{ searchName: "inverted row",           fallback: { target: "upper back", secondary: ["biceps", "lats"] } },
  remadaCurvada:    { searchName: "barbell bent over row",  fallback: { target: "upper back", secondary: ["biceps", "lats"] } },
  rosca:            { searchName: "dumbbell biceps curl",   fallback: { target: "biceps", secondary: ["forearms"] } },
  roscaMartelo:     { searchName: "hammer curl",            fallback: { target: "biceps", secondary: ["forearms"] } },
  agachamento:      { searchName: "bodyweight squat",       fallback: { target: "quads", secondary: ["glutes", "hamstrings", "calves"] } },
  agachamentoBulgaro:{searchName: "bulgarian split squat",  fallback: { target: "quads", secondary: ["glutes", "hamstrings"] } },
  afundo:           { searchName: "lunge",                  fallback: { target: "quads", secondary: ["glutes", "hamstrings", "calves"] } },
  panturrilha:      { searchName: "calf raise",             fallback: { target: "calves", secondary: [] } },
  glutePonte:       { searchName: "glute bridge",           fallback: { target: "glutes", secondary: ["hamstrings", "abs"] } },
  steup:            { searchName: "step up",                fallback: { target: "quads", secondary: ["glutes", "calves"] } },
  desenvolvimento:  { searchName: "dumbbell shoulder press",fallback: { target: "delts", secondary: ["triceps"] } },
  elevacaoLateral:  { searchName: "lateral raise",          fallback: { target: "delts", secondary: ["traps"] } },
  elevacaoFrontal:  { searchName: "front raise",            fallback: { target: "delts", secondary: ["pectorals"] } },
  prancha:          { searchName: "plank",                  fallback: { target: "abs", secondary: ["delts", "glutes"] } },
  pranchaLateral:   { searchName: "side plank",             fallback: { target: "abs", secondary: ["delts", "glutes"] } },
  abdominal:        { searchName: "crunch",                 fallback: { target: "abs", secondary: [] } },
  bicycleCrunch:    { searchName: "bicycle crunch",         fallback: { target: "abs", secondary: [] } },
  deadbug:          { searchName: "dead bug",               fallback: { target: "abs", secondary: ["lower back"] } },
  pranchaAlta:      { searchName: "high plank",             fallback: { target: "abs", secondary: ["delts", "pectorals"] } },
  burpee:           { searchName: "burpee",                 fallback: { target: "cardiovascular system", secondary: ["quads", "pectorals", "abs"] } },
  jumpingJack:      { searchName: "jumping jack",           fallback: { target: "cardiovascular system", secondary: ["calves", "delts"] } },
  mountainClimber:  { searchName: "mountain climber",       fallback: { target: "abs", secondary: ["delts", "quads"] } },
  corrida:          { searchName: "run",                    fallback: { target: "cardiovascular system", secondary: ["quads", "calves", "glutes"] } },
  pular:            { searchName: "jump rope",              fallback: { target: "cardiovascular system", secondary: ["calves", "delts"] } },
};

// Normaliza termo de músculo da ExerciseDB pra nossa região do diagrama
export function muscleToRegion(muscle: string): MuscleRegion | null {
  const m = muscle.toLowerCase().trim();
  const map: Record<string, MuscleRegion> = {
    "pectorals": "chest",
    "pecs": "chest",
    "chest": "chest",
    "delts": "shoulders",
    "deltoids": "shoulders",
    "shoulders": "shoulders",
    "biceps": "biceps",
    "triceps": "triceps",
    "forearms": "forearms",
    "abs": "abs",
    "core": "abs",
    "obliques": "obliques",
    "serratus anterior": "abs",
    "quads": "quads",
    "quadriceps": "quads",
    "hamstrings": "hamstrings",
    "glutes": "glutes",
    "calves": "calves",
    "lats": "lats",
    "upper back": "upperback",
    "traps": "traps",
    "trapezius": "traps",
    "lower back": "lowerback",
    "spine": "lowerback",
    "neck": "traps",
    "adductors": "quads",
    "abductors": "glutes",
  };
  return map[m] ?? null;
}

export type MuscleRegion =
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms"
  | "abs" | "obliques"
  | "quads" | "hamstrings" | "glutes" | "calves"
  | "lats" | "upperback" | "traps" | "lowerback";
