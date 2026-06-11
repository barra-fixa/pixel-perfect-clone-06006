
CREATE TABLE public.dieta_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  objetivo TEXT NOT NULL,
  restricoes TEXT NOT NULL DEFAULT '',
  refeicoes_dia INT NOT NULL,
  preferencias_bucket TEXT NOT NULL DEFAULT '',
  plano JSONB NOT NULL,
  modelo TEXT NOT NULL,
  hits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.dieta_cache TO authenticated;
GRANT ALL ON public.dieta_cache TO service_role;

ALTER TABLE public.dieta_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth can read dieta cache"
  ON public.dieta_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX dieta_cache_key_idx ON public.dieta_cache (cache_key);

CREATE TRIGGER set_dieta_cache_updated_at
  BEFORE UPDATE ON public.dieta_cache
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
