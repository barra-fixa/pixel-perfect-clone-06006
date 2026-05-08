// Normaliza a senha do usuário para atender ao mínimo do backend (6 chars)
// de forma determinística: a mesma entrada sempre gera a mesma senha real.
// Permite que o usuário use qualquer senha, inclusive vazia ou muito curta.
const SUFFIX = "·elv·9X!q";

export function normalizePassword(raw: string): string {
  const base = raw ?? "";
  if (base.length >= 6) return base;
  return (base + SUFFIX).slice(0, Math.max(8, base.length + SUFFIX.length));
}
