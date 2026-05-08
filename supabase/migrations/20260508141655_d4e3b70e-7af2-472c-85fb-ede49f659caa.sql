
-- 1) Estender profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS caminho text,
  ADD COLUMN IF NOT EXISTS equipamentos text[],
  ADD COLUMN IF NOT EXISTS tem_saco_pancada boolean,
  ADD COLUMN IF NOT EXISTS nivel text,
  ADD COLUMN IF NOT EXISTS frequencia integer,
  ADD COLUMN IF NOT EXISTS plano text,
  ADD COLUMN IF NOT EXISTS dias_jornada integer,
  ADD COLUMN IF NOT EXISTS treinos_feitos integer,
  ADD COLUMN IF NOT EXISTS streak integer,
  ADD COLUMN IF NOT EXISTS taf_cargo_id text,
  ADD COLUMN IF NOT EXISTS taf_sexo text,
  ADD COLUMN IF NOT EXISTS notificacoes jsonb;

-- 2) taf_resultados
CREATE TABLE IF NOT EXISTS public.taf_resultados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cargo_id text NOT NULL,
  data timestamptz NOT NULL DEFAULT now(),
  sexo text NOT NULL,
  resultados jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_taf_resultados_user ON public.taf_resultados(user_id);
ALTER TABLE public.taf_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TAF select dono" ON public.taf_resultados
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "TAF insert dono" ON public.taf_resultados
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "TAF update dono" ON public.taf_resultados
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "TAF delete dono" ON public.taf_resultados
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_taf_resultados_updated
  BEFORE UPDATE ON public.taf_resultados
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) treinos_historico
CREATE TABLE IF NOT EXISTS public.treinos_historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  data timestamptz NOT NULL DEFAULT now(),
  duracao_min integer NOT NULL DEFAULT 0,
  exercicios integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_treinos_historico_user ON public.treinos_historico(user_id);
ALTER TABLE public.treinos_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Treinos select dono" ON public.treinos_historico
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Treinos insert dono" ON public.treinos_historico
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Treinos update dono" ON public.treinos_historico
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Treinos delete dono" ON public.treinos_historico
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_treinos_historico_updated
  BEFORE UPDATE ON public.treinos_historico
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
