// Simple localStorage-backed onboarding/user state.
import { useEffect, useState } from "react";

export type Objetivo = "forca" | "emagrecer" | "taf" | "saude" | "definicao" | "zero";
export type Caminho = "barra" | "casa";
export type Nivel = "iniciante" | "intermediario" | "avancado";

export type Sexo = "masc" | "fem";

export type TafResultado = {
  cargoId: string;
  data: number; // timestamp
  sexo: Sexo;
  resultados: Record<string, number>; // provaId -> valor
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
  plano?: "free" | "pro";
  diasJornada?: number;
  treinosFeitos?: number;
  streak?: number;
  // TAF
  tafCargoId?: string;
  tafSexo?: Sexo;
  tafHistorico?: TafResultado[];
};

const KEY = "elevo:user";

export function loadUser(): ElevoUser {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUser(patch: Partial<ElevoUser>) {
  const cur = loadUser();
  const next = { ...cur, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("elevo:user"));
  return next;
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
