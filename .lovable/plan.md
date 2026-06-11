# Plano: 8 mudanças no Elevo

Antes de implementar quero alinhar escopo — é um lote grande e algumas decisões mudam o produto. Login/auth fica intocado.

## 1. Reordenar onboarding: prévia → email+whatsapp → cartão
- `onboarding.processando` passa a navegar para uma **nova tela** `onboarding/previa` (não mais direto pro email).
- `onboarding/previa`: mostra plano real (já temos `getPlanoSemanal`) com **título personalizado por objetivo** (`OBJETIVO_LABEL` → "Seu plano de aprovação no TAF", "Seu plano de emagrecimento" etc.).
- `onboarding/email` vira `onboarding/contato`: captura **email + whatsapp** juntos, com máscara BR `(11) 91234-5678`, validação 10–11 dígitos, checkbox de consentimento LGPD.
- Migration: adicionar coluna `whatsapp text` em `profiles` + salvar no `handle_new_user` via `raw_user_meta_data`.
- Só **depois** do magic link confirmado, mostrar `onboarding/preview` atual (que vira a tela do cartão / oferta Pro).

## 2. Tela do Pro (cartão) — copy claro
- Reescrever `onboarding.preview.tsx` + `upgrade.tsx` com:
  - "**14 dias grátis** — você só é cobrado depois"
  - "Se bater sua meta de treino no mês, **o mês é grátis**"
  - Gancho dieta IA: "Desbloqueie seu plano completo + **sua dieta personalizada por IA**"
  - Pitch do H1 muda conforme `objetivo` (TAF / emagrecer / força / etc.)
- Mecanismo treina=não-paga mantido.
- **Nota:** não vou integrar Stripe/Paddle agora (não foi pedido) — só copy. Confirma?

## 3. Remover "barra fixa de porta"
- Varrer `src/lib/produtos.ts`, `loja.tsx`, `equipamentos-pedidos.ts`, copy do onboarding/saco e qualquer menção. Trocar tudo por **"barra fixa de parede"**.

## 4. GIFs no treino do dia (todos os exercícios)
- Generalizar `barra-gifs.functions.ts` → `ensureExerciciosGifs` que roda pra **qualquer** exercício ativo com `exercisedb_id` e sem `gif_url_local` (não só `equipment=barra_fixa_parede`).
- Ampliar `SEARCH_BY_EXDB_ID` cobrindo flexão, agachamento, prancha, afundo, polichinelo, burpee, mountain climber, abdominal, ponte, elevação panturrilha, etc.
- Chamar `ensureExerciciosGifs` no mount de `/treino-do-dia` e `/treino.ativo`.
- Renderizar `<img src={gif_url_local}>` no card de exercício (hoje é quadrado cinza).

## 5. Vídeos de execução "(em breve)"
- Onde aparece "Vídeos de execução" no upgrade/planos, adicionar sufixo `(em breve)` e desabilitar visualmente.

## 6. Só Barra Fixa = livre
- Remover qualquer gate Pro de `treinos-so-barra` e do card na home. Acessível sempre.

## 7. Nova aba "Dieta" (substitui Loja no BottomNav)
- Nova rota `/dieta`: form (objetivo, alergias, refeições/dia, preferências) → server fn chamando Lovable AI (`google/gemini-3-flash-preview`) → retorna plano com refeições.
- **Free:** vê prévia (1 dia, sem receitas).
- **Pro:** plano semanal completo + receitas.
- BottomNav: trocar ícone "Loja" por "Dieta" (ShoppingBag → UtensilsCrossed).
- Realocar conteúdo da Loja: card "**Equipamentos & parceiros**" no Perfil (e card menor na Home) linkando para `/loja` (rota mantida, só sai da nav).

## 8. Clareza do mês grátis no Perfil
- Card "Meu plano" mostra:
  - Texto explícito: "Treine **X de Y vezes** essa semana para garantir seu mês grátis"
  - Barra de progresso visual
  - Contador de dias restantes do trial separado

## Ordem de execução
1, 3, 5, 6, 8 (rápidos / copy) → 4 (GIFs + backfill) → 7 (Dieta IA, maior) → 2 (Pro copy depende de 7 pro gancho dieta).

## Perguntas antes de codar
- **(a)** Tela do Pro: implemento só copy/UI (sem cobrança real)? Ou já integro Stripe?
- **(b)** Dieta IA: ok usar `google/gemini-3-flash-preview` via Lovable AI Gateway (gratuito pra você no momento, sem chave)?
- **(c)** Loja: realoco como card no **Perfil** (minha sugestão) ou prefere card permanente na **Home**?
- **(d)** Whatsapp é **obrigatório** ou opcional no onboarding/contato?

Responde essas 4 e eu toco o lote inteiro.