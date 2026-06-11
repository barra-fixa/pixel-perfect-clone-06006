
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plano_ciclo text,
  ADD COLUMN IF NOT EXISTS plano_inicio timestamptz,
  ADD COLUMN IF NOT EXISTS plano_fim timestamptz,
  ADD COLUMN IF NOT EXISTS mp_preapproval_id text,
  ADD COLUMN IF NOT EXISTS mp_payer_id text,
  ADD COLUMN IF NOT EXISTS mp_status text;

CREATE TABLE IF NOT EXISTS public.mp_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id text UNIQUE,
  tipo text,
  resource_id text,
  user_id uuid,
  payload jsonb,
  processado_em timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.mp_eventos TO service_role;
ALTER TABLE public.mp_eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_eventos service only" ON public.mp_eventos FOR ALL TO service_role USING (true) WITH CHECK (true);
