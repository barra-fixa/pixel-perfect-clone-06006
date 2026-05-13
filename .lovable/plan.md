## Onda 6 — Plano de implementação

Vou implementar em fases, adaptando ao stack atual (TanStack Router + `elevo-store` + `localStorage`/Supabase). Já existe `frequencia` e `equipamentos[]` no store — vou reutilizar.

### Fase 1 — Frequência inteligente (já parcialmente existe)
- `src/lib/treinos.ts`: adicionar `getDiasTreino(frequencia)` → retorna índices dos dias (seg=0):
  - 3x → [0,2,4]
  - 4x → [0,1,3,4]
  - 5x → [0,1,2,3,4]
  - 2x → [0,3]
  - 7x → [0..6]
- A tela `onboarding.frequencia.tsx` **já existe** e salva `frequencia`. Sem mudanças.

### Fase 2 — Abas dinâmicas em `treino-do-dia.tsx`
- Mostrar apenas as abas dos dias planejados (`getDiasTreino(user.frequencia)`).
- Botão **"+ Outro dia"** abre modo expandido mostrando todos os 7 dias (estado local).
- Hoje destacado mesmo se não estiver no plano (avisa: "fora do plano").

### Fase 3 — Equipamentos & filtragem
- `src/lib/exercicios-filtro.ts` (novo):
  - Mapa de exercícios → `{ equipamentoNecessario, alternativaId? }`.
  - `filtrarExercicios(exercicios, equipamentos[], modoBarra)` → substitui ou remove.
- Integrar em `getPlanoSemanal` (ou pós-processar no `treino-do-dia` e `treino.ativo`).
- `perfil.dados.tsx` **já tem** edição de equipamentos via onboarding link. Adicionar toggle direto na tela de perfil para os 7 equipamentos novos (barra, banco, peso, corda, kettlebell, paralela, nenhum).

### Fase 4 — Modo "Só Barra Fixa"
- `src/lib/modo-barra-fixa.ts` (novo): get/set em localStorage (`modoBarraFixa`).
- Toggle em `perfil.dados.tsx`.
- Quando ativo → `filtrarExercicios` ignora todos que não usam barra, substitui por alternativa "barra/peso corporal".

### Fase 5 — Produtos da Barra Fixa
- `src/lib/produtos.ts` (novo): array com 3 produtos (links ML, descrição, preço placeholder).
- Card "Compre sua barra fixa" no rodapé de:
  - `home.tsx`
  - `treino-do-dia.tsx`
- Já existe `/loja` — adicionar seção "Barras recomendadas" lá em vez de criar nova rota.

### Fase 6 — (Opcional, vou pular) `treinos-so-barra.tsx`
Marcado como opcional no prompt. Skip para focar no essencial; o modo "Só Barra Fixa" já cobre o caso de uso.

### Validação
- `tsc --noEmit` limpo.
- Verificar que abas refletem frequência selecionada.
- Verificar substituições (ex.: sem kettlebell → "Jump squats").

### Fora de escopo
- Não vou criar nova rota `/onboarding/frequencia` (já existe).
- Não vou mexer em backend (Supabase) — equipamentos e modo continuam via `elevo-store` que já sincroniza.
- Imagens dos produtos: usar placeholder/emoji 🏋️ (não vou raspar Mercado Livre).