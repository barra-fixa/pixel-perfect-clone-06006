// Server function: gera um plano alimentar com IA (Lovable AI Gateway).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  objetivo: z.string().min(1).max(60),
  restricoes: z.string().max(400).optional(),
  refeicoesPorDia: z.number().int().min(2).max(7),
  preferencias: z.string().max(400).optional(),
  modoPreview: z.boolean().default(false),
});

export type Refeicao = {
  nome: string;
  horario: string;
  itens: string[];
  calorias?: number;
  receita?: string;
};

export type PlanoDieta = {
  titulo: string;
  resumoCalorico: string;
  refeicoes: Refeicao[];
  diasCobertos: number;
  preview: boolean;
};

export const gerarPlanoDieta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<PlanoDieta> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente");

    const dias = data.modoPreview ? 1 : 7;
    const incluirReceitas = !data.modoPreview;

    const sys = `Você é um nutricionista esportivo brasileiro. Gere planos alimentares práticos,
acessíveis e culturalmente adequados ao Brasil. Responda SEMPRE em JSON válido seguindo
EXATAMENTE o schema pedido, sem texto fora do JSON.`;

    const user = `Gere um plano alimentar para ${dias} dia(s) com ${data.refeicoesPorDia} refeições por dia.
Objetivo: ${data.objetivo}.
Restrições/alergias: ${data.restricoes || "nenhuma"}.
Preferências: ${data.preferencias || "comida brasileira do dia a dia"}.
${incluirReceitas ? "Inclua uma receita curta (3-5 passos) em cada refeição." : "NÃO inclua receitas."}

Schema JSON exigido:
{
  "titulo": "string curta",
  "resumoCalorico": "ex: ~2200 kcal/dia, 150g proteína",
  "refeicoes": [
    { "nome": "Café da manhã", "horario": "07:00", "itens": ["..."], "calorias": 450${incluirReceitas ? ', "receita": "Passo 1..."' : ""} }
  ]
}

Retorne UM dia representativo. Use medidas caseiras (xícara, colher, unidade).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit — tente em alguns segundos.");
    if (res.status === 402) throw new Error("Créditos esgotados no workspace.");
    if (!res.ok) throw new Error(`AI Gateway HTTP ${res.status}`);

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { titulo?: string; resumoCalorico?: string; refeicoes?: Refeicao[] } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Resposta da IA não é JSON válido");
    }

    return {
      titulo: parsed.titulo ?? "Plano alimentar",
      resumoCalorico: parsed.resumoCalorico ?? "",
      refeicoes: parsed.refeicoes ?? [],
      diasCobertos: dias,
      preview: data.modoPreview,
    };
  });
