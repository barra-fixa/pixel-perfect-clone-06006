-- Tabela: pedidos de equipamentos novos enviados pelos usuários
CREATE TABLE IF NOT EXISTS public.equipamentos_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_user TEXT NOT NULL,
  nome_equipamento TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  data_pedido TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','analisando','rejeitado','adicionado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipamentos_pedidos_user_id ON public.equipamentos_pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_pedidos_status ON public.equipamentos_pedidos(status);
CREATE INDEX IF NOT EXISTS idx_equipamentos_pedidos_data ON public.equipamentos_pedidos(data_pedido);

ALTER TABLE public.equipamentos_pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pedidos: dono insere" ON public.equipamentos_pedidos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pedidos: dono lê os próprios" ON public.equipamentos_pedidos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at_equipamentos_pedidos
  BEFORE UPDATE ON public.equipamentos_pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tabela: log de quando insights semanais foram mostrados (para evitar spam)
CREATE TABLE IF NOT EXISTS public.insights_mostrados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data_criada TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_insights_mostrados_user_id ON public.insights_mostrados(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_mostrados_data ON public.insights_mostrados(data_criada);

ALTER TABLE public.insights_mostrados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insights: dono insere" ON public.insights_mostrados
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Insights: dono lê" ON public.insights_mostrados
  FOR SELECT TO authenticated USING (auth.uid() = user_id);