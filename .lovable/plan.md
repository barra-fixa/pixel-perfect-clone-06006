## Objetivo

Mover os dados do `elevo-store` (localStorage) para o backend (Supabase), mantendo a app funcionando exatamente como hoje — mas com persistência por usuário, sincronizada entre dispositivos.

## O que está no localStorage hoje

O tipo `ElevoUser` em `src/lib/elevo-store.ts` guarda:

- **Perfil / onboarding**: `nome`, `email`, `objetivo`, `caminho`, `equipamentos[]`, `temSacoPancada`, `nivel`, `frequencia`, `plano`, `diasJornada`, `treinosFeitos`, `streak`
- **TAF**: `tafCargoId`, `tafSexo`, `tafHistorico[]` (lista de resultados)
- **Histórico de treinos**: `historicoTreinos[]`
- **Notificações**: `notificacoes` (treino/agua/comunidade + horário)

## Mudanças no banco (Supabase)

### 1. Estender `profiles`
Adicionar colunas de onboarding e progresso (mesmos nomes de hoje):
`objetivo`, `caminho`, `equipamentos (text[])`, `tem_saco_pancada`, `nivel`, `frequencia`, `plano`, `dias_jornada`, `treinos_feitos`, `streak`, `taf_cargo_id`, `taf_sexo`, `notificacoes (jsonb)`.

### 2. Nova tabela `taf_resultados`
Campos: `id`, `user_id`, `cargo_id`, `data` (timestamptz), `sexo`, `resultados (jsonb)`, timestamps.
RLS: dono lê/insere/atualiza/apaga.

### 3. Nova tabela `treinos_historico`
Campos: `id`, `user_id`, `nome`, `data` (timestamptz), `duracao_min`, `exercicios (int)`, timestamps.
RLS: dono lê/insere/atualiza/apaga.

Todas as tabelas com RLS estrita (`auth.uid() = user_id`) e índices em `user_id`.

## Mudanças no frontend

### `src/lib/elevo-store.ts` (refatorado, mesma API pública)
- `loadUser()` / `saveUser()` / `useElevoUser()` continuam existindo — mas agora:
  - Quando há sessão Supabase: leem/gravam em `profiles` (e tabelas filhas) e usam localStorage só como cache.
  - Sem sessão (durante onboarding pré-cadastro): comportamento atual em localStorage.
- Adicionar helpers: `addTreinoHistorico(...)`, `addTafResultado(...)` que escrevem nas tabelas certas.
- Após login: hidrata o cache local a partir do banco.

### Sincronização inicial (one-shot)
No primeiro login após a migração, se o `localStorage` tiver dados e o `profiles` do usuário estiver vazio, faz upload do estado local para o banco e marca como migrado (`localStorage` flag).

### Pontos que já gravam dados (nenhuma mudança de UX)
- Telas de onboarding (`onboarding.objetivo`, `caminho`, `nivel`, `equipamentos`, `frequencia`, `notificacoes` etc.) — continuam chamando `saveUser(...)`, agora persistindo no banco.
- `taf.resultado.tsx` — usa `addTafResultado`.
- `treino.concluido.tsx` — usa `addTreinoHistorico`.
- `perfil.historico.tsx` e `taf.tsx` — leem do hook reativo (que agora vem do banco).

## Detalhes técnicos

- Toda escrita usa o client `@/integrations/supabase/client` direto do browser (RLS protege).
- Estado reativo: assinar `postgres_changes` em `profiles`/tabelas do usuário **opcional** (fase 2). Por ora, invalidação manual + evento `elevo:user` já existente.
- Conversões: `data` (ms epoch no front) ↔ `timestamptz` no banco.
- Nada muda em rotas, componentes visuais ou fluxo do usuário.

## Fora do escopo
- Realtime cross-device (pode ser adicionado depois).
- Migração do estado de outros usuários (só migra o do usuário logado, on-demand).
