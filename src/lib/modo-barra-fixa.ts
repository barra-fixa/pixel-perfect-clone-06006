// Modo "Só Barra Fixa": filtra todos os treinos para usar exclusivamente
// exercícios com barra fixa ou peso corporal. Persistente no localStorage.

const KEY = "elevo:modoBarraFixa";

export function getModoBarraFixa(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function setModoBarraFixa(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("elevo:modo-barra-fixa"));
}

import { useEffect, useState } from "react";

export function useModoBarraFixa(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(getModoBarraFixa());
    const h = () => setOn(getModoBarraFixa());
    window.addEventListener("elevo:modo-barra-fixa", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("elevo:modo-barra-fixa", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return [on, setModoBarraFixa];
}
