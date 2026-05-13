// User state with localStorage cache + Supabase persistence.
// Public API (loadUser/saveUser/useElevoUser) is unchanged.
// When authenticated, writes are mirrored to Supabase and reads are hydrated from it.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";

export type Objetivo = "forca" | "emagrecer" | "taf" | "saude" | "definicao" | "zero";
export type Caminho = "barra" | "casa";
export type Nivel = "iniciante" | "intermediario" | "avancado";

export type Sexo = "masc" | "fem";

export type TafResultado = {
  id?: string;
  cargoId: string;
  data: number; // ms timestamp
  sexo: Sexo;
  resultados: Record<string, number>;
};

export type TreinoFeito = {
  id: string;
  nome: string;
  data: number; // ms timestamp
  duracaoMin: number;
  exercicios: number;
};

export type Notificacoes = {
  treino: boolean;
  agua: boolean;
  comunidade: boolean;
  horario: string;
};

export type ElevoUser = {
  nome?: string;
  email?: string;
  objetivo?: Objetivo;
  caminho?: Caminho;
  equipamentos?: string[];
  temSacoPancada?: boolean;
  nivel?: Nivel;
  frequencia?: number;
  /** Dias da semana escolhidos para treinar (segunda=0..domingo=6). Local-only. */
  diasTreino?: number[];
  plano?: "free" | "pro";
  diasJornada?: number;
  treinosFeitos?: number;
  streak?: number;
  tafCargoId?: string;
  tafSexo?: Sexo;
  tafHistorico?: TafResultado[];
  historicoTreinos?: TreinoFeito[];
  notificacoes?: Notificacoes;
};

const KEY = "elevo:user";
const MIGRATED_KEY = "elevo:migrated";

export function loadUser(): ElevoUser {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocal(next: ElevoUser) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("elevo:user"));
}

export function saveUser(patch: Partial<ElevoUser>) {
  const cur = loadUser();
  const next = { ...cur, ...patch };
  writeLocal(next);
  // Mirror profile-level fields to Supabase (best-effort)
  void pushProfilePatch(patch);
  return next;
}

// ---------- Supabase mapping ----------

const PROFILE_COLS: Record<string, keyof ElevoUser> = {
  nome: "nome",
  email: "email",
  objetivo: "objetivo",
  caminho: "caminho",
  equipamentos: "equipamentos",
  tem_saco_pancada: "temSacoPancada",
  nivel: "nivel",
  frequencia: "frequencia",
  plano: "plano",
  dias_jornada: "diasJornada",
  treinos_feitos: "treinosFeitos",
  streak: "streak",
  taf_cargo_id: "tafCargoId",
  taf_sexo: "tafSexo",
  notificacoes: "notificacoes",
};

function patchToRow(patch: Partial<ElevoUser>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [col, key] of Object.entries(PROFILE_COLS)) {
    if (key in patch) row[col] = patch[key] ?? null;
  }
  return row;
}

function rowToUser(row: Record<string, unknown>): Partial<ElevoUser> {
  const out: Partial<ElevoUser> = {};
  for (const [col, key] of Object.entries(PROFILE_COLS)) {
    if (row[col] !== null && row[col] !== undefined) {
      (out as Record<string, unknown>)[key] = row[col];
    }
  }
  return out;
}

async function getUid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

async function pushProfilePatch(patch: Partial<ElevoUser>) {
  const row = patchToRow(patch);
  if (Object.keys(row).length === 0) return;
  const uid = await getUid();
  if (!uid) return;
  const { error } = await supabase
    .from("profiles")
    .update(row as TablesUpdate<"profiles">)
    .eq("id", uid);
  if (error) console.warn("[elevo] profile sync falhou:", error.message);
}

// ---------- TAF / Histórico helpers ----------

export async function addTafResultado(r: TafResultado) {
  const cur = loadUser();
  const local = [...(cur.tafHistorico ?? []), r];
  writeLocal({ ...cur, tafHistorico: local });
  const uid = await getUid();
  if (!uid) return;
  const { error } = await supabase.from("taf_resultados").insert({
    user_id: uid,
    cargo_id: r.cargoId,
    data: new Date(r.data).toISOString(),
    sexo: r.sexo,
    resultados: r.resultados,
  });
  if (error) console.warn("[elevo] taf sync falhou:", error.message);
}

export async function addTreinoHistorico(t: TreinoFeito) {
  const cur = loadUser();
  const local = [...(cur.historicoTreinos ?? []), t];
  writeLocal({ ...cur, historicoTreinos: local });
  const uid = await getUid();
  if (!uid) return;
  const { error } = await supabase.from("treinos_historico").insert({
    user_id: uid,
    nome: t.nome,
    data: new Date(t.data).toISOString(),
    duracao_min: t.duracaoMin,
    exercicios: t.exercicios,
  });
  if (error) console.warn("[elevo] treino sync falhou:", error.message);
}

// ---------- Hydration / one-shot migration ----------

export async function hydrateFromSupabase() {
  const uid = await getUid();
  if (!uid) return;

  const [{ data: profile }, { data: tafs }, { data: treinos }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("taf_resultados").select("*").eq("user_id", uid).order("data", { ascending: true }),
    supabase.from("treinos_historico").select("*").eq("user_id", uid).order("data", { ascending: true }),
  ]);

  const fromDb: Partial<ElevoUser> = profile ? rowToUser(profile as Record<string, unknown>) : {};
  fromDb.tafHistorico = (tafs ?? []).map((t) => ({
    id: t.id,
    cargoId: t.cargo_id,
    data: new Date(t.data).getTime(),
    sexo: t.sexo as Sexo,
    resultados: (t.resultados ?? {}) as Record<string, number>,
  }));
  fromDb.historicoTreinos = (treinos ?? []).map((t) => ({
    id: t.id,
    nome: t.nome,
    data: new Date(t.data).getTime(),
    duracaoMin: t.duracao_min,
    exercicios: t.exercicios,
  }));

  // One-shot upload: if local has data not yet in db, push it.
  await migrateLocalToSupabase(uid, fromDb);

  // Merge: prefer db, fall back to local for missing fields.
  const local = loadUser();
  const merged: ElevoUser = { ...local, ...stripEmpty(fromDb) };
  writeLocal(merged);
}

function stripEmpty(o: Partial<ElevoUser>): Partial<ElevoUser> {
  const out: Partial<ElevoUser> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

async function migrateLocalToSupabase(uid: string, fromDb: Partial<ElevoUser>) {
  if (localStorage.getItem(MIGRATED_KEY) === "1") return;
  const local = loadUser();

  // Profile fields: push any local field that isn't in db yet.
  const profilePatch: Partial<ElevoUser> = {};
  for (const key of Object.values(PROFILE_COLS)) {
    if (local[key] !== undefined && fromDb[key] === undefined) {
      (profilePatch as Record<string, unknown>)[key] = local[key];
    }
  }
  if (Object.keys(profilePatch).length > 0) {
    const row = patchToRow(profilePatch);
    await supabase.from("profiles").update(row as TablesUpdate<"profiles">).eq("id", uid);
    Object.assign(fromDb, profilePatch);
  }

  // TAF: if db has none and local has some, push them.
  if ((fromDb.tafHistorico?.length ?? 0) === 0 && (local.tafHistorico?.length ?? 0) > 0) {
    const rows = local.tafHistorico!.map((r) => ({
      user_id: uid,
      cargo_id: r.cargoId,
      data: new Date(r.data).toISOString(),
      sexo: r.sexo,
      resultados: r.resultados,
    }));
    await supabase.from("taf_resultados").insert(rows);
    fromDb.tafHistorico = local.tafHistorico;
  }

  // Histórico de treinos: idem.
  if ((fromDb.historicoTreinos?.length ?? 0) === 0 && (local.historicoTreinos?.length ?? 0) > 0) {
    const rows = local.historicoTreinos!.map((t) => ({
      user_id: uid,
      nome: t.nome,
      data: new Date(t.data).toISOString(),
      duracao_min: t.duracaoMin,
      exercicios: t.exercicios,
    }));
    await supabase.from("treinos_historico").insert(rows);
    fromDb.historicoTreinos = local.historicoTreinos;
  }

  localStorage.setItem(MIGRATED_KEY, "1");
}

export function clearLocalCache() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(MIGRATED_KEY);
  window.dispatchEvent(new Event("elevo:user"));
}

export function useElevoUser() {
  const [user, setUser] = useState<ElevoUser>({});
  useEffect(() => {
    setUser(loadUser());
    const h = () => setUser(loadUser());
    window.addEventListener("elevo:user", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("elevo:user", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return user;
}

export const META_POR_NIVEL: Record<Nivel, number> = {
  iniciante: 4,
  intermediario: 8,
  avancado: 12,
};
