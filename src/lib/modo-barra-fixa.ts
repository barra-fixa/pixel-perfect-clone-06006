// Modo "Só Barra Fixa": filtra todos os treinos para usar exclusivamente
// exercícios com barra fixa ou peso corporal. Persistente no localStorage.
//
// Dois sinais separados:
// - modoBarraFixa: toggle manual do usuário (filtragem leve via exercicios-filtro).
// - semanaSoBarraAtiva: semana específica do fluxo "Treinos Só Barra Fixa"
//   (Fundação/Clássico/Avançado). Quando setada, sobrepõe o plano semanal.

import { useEffect, useState } from "react";

const KEY = "elevo:modoBarraFixa";
const KEY_SEMANA = "elevo:semanaSoBarraAtiva";
const EVT = "elevo:modo-barra-fixa";

export function getModoBarraFixa(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function setModoBarraFixa(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

export type SemanaSoBarraSlug = "fundacao" | "classico" | "avancado";

export function getSemanaSoBarraAtiva(): SemanaSoBarraSlug | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY_SEMANA);
  if (v === "fundacao" || v === "classico" || v === "avancado") return v;
  return null;
}

export function setSemanaSoBarraAtiva(slug: SemanaSoBarraSlug | null) {
  if (typeof window === "undefined") return;
  if (slug) localStorage.setItem(KEY_SEMANA, slug);
  else localStorage.removeItem(KEY_SEMANA);
  window.dispatchEvent(new Event(EVT));
}

export function useModoBarraFixa(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getModoBarraFixa());
    const h = () => setOn(getModoBarraFixa());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return [on, setModoBarraFixa];
}

export function useSemanaSoBarraAtiva(): SemanaSoBarraSlug | null {
  const [s, setS] = useState<SemanaSoBarraSlug | null>(null);
  useEffect(() => {
    setS(getSemanaSoBarraAtiva());
    const h = () => setS(getSemanaSoBarraAtiva());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
}
