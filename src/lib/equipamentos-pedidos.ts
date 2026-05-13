// Telemetria de pedidos de equipamentos novos.
// Salva no Supabase (tabela equipamentos_pedidos) o que os usuários querem
// que a gente adicione. RLS garante que cada usuário só vê os próprios pedidos.
import { supabase } from "@/integrations/supabase/client";

export type StatusPedido = "novo" | "analisando" | "rejeitado" | "adicionado";

export type PedidoEquipamento = {
  id: string;
  user_id: string;
  email_user: string;
  nome_equipamento: string;
  descricao: string | null;
  categoria: string | null;
  data_pedido: string;
  status: StatusPedido;
};

/** Usuário autenticado pede um equipamento novo. */
export async function pedirEquipamento(
  nomeEquipamento: string,
  descricao?: string
): Promise<{ ok: boolean; erro?: string }> {
  const nome = nomeEquipamento.trim();
  if (nome.length < 2) return { ok: false, erro: "Nome muito curto" };
  if (nome.length > 120) return { ok: false, erro: "Nome muito longo" };

  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return { ok: false, erro: "Você precisa estar logado" };

  const { error } = await supabase.from("equipamentos_pedidos").insert({
    user_id: user.id,
    email_user: user.email ?? "",
    nome_equipamento: nome,
    descricao: descricao?.trim() || null,
  });
  if (error) {
    console.error("[equipamentos] insert falhou:", error.message);
    return { ok: false, erro: "Não foi possível enviar agora. Tenta de novo." };
  }
  return { ok: true };
}

/** Lista pedidos do usuário atual (para mostrar histórico, se quiser). */
export async function meusPedidos(): Promise<PedidoEquipamento[]> {
  const { data, error } = await supabase
    .from("equipamentos_pedidos")
    .select("*")
    .order("data_pedido", { ascending: false });
  if (error) {
    console.warn("[equipamentos] select falhou:", error.message);
    return [];
  }
  return (data ?? []) as PedidoEquipamento[];
}
