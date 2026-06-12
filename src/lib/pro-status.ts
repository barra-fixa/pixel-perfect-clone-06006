// Único ponto de verdade pro status Pro do usuário.
// Lê `user.plano` (espelho de profiles.plano, atualizado pelo webhook do
// Mercado Pago em mercadopago-webhook.ts e por cancelarAssinaturaMP).
// "pro" => liberado; qualquer outro valor (free/cancelled/sem assinatura)
// => bloqueado nos recursos Pro, mas o app continua acessível.
import type { ElevoUser } from "@/lib/elevo-store";
import { useElevoUser } from "@/lib/elevo-store";

export function ehProAtivo(user: ElevoUser | null | undefined): boolean {
  return (user?.plano ?? "free") === "pro";
}

export function useEhPro(): boolean {
  const user = useElevoUser();
  return ehProAtivo(user);
}
