// Dieta:
//  - FREE: 100% estático (templates + TDEE). Zero IA.
//  - PRO: IA com cache compartilhado (dieta_cache). Modelo flash-lite barato.
//  - BYOK: se GEMINI_API_KEY estiver setado, usa direto Google AI Studio.
//          Caso contrário, cai no Lovable AI Gateway (LOVABLE_API_KEY).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  calcularCalorias,
  montarDiaEstatico,
  tituloDietaPorObjetivo,
  type PerfilTDEE,
} from "./dieta-templates";

const Input = z.object({
  objetivo: z.string().min(1).max(60),
  restricoes: z.string().max(400).optional(),
  refeicoesPorDia: z.number().int().min(2).max(7),
  preferencias: z.string().max(400).optional(),
  modoPreview: z.boolean().default(false),
  // Opcional: dados do perfil para TDEE no Free
  sexo: z.enum(["masc", "fem"]).optional(),
  idade: z.number().int().min(10).max(100).optional(),
  pesoKg: z.number().min(30).max(250).optional(),
  alturaCm: z.number().min(120).max(230).optional(),
  nivelAtividade: z.enum(["sedentario", "leve", "moderado", "intenso"]).optional(),
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
  origem: "estatico" | "cache" | "ia";
  modelo?: string;
};

// Modelo Flash-Lite (barato). BYOK usa o ID do Google AI Studio.
const MODELO_GATEWAY = "google/gemini-2.5-flash-lite";
const MODELO_BYOK = "gemini-2.5-flash-lite";

function normalizarPreferenciasBucket(p?: string): string {
  if (!p) return "default";
  const s = p.toLowerCase();
  if (/vegan/.test(s)) return "vegano";
  if (/vegetarian/.test(s)) return "vegetariano";
  if (/low.?carb|cetog|keto/.test(s)) return "lowcarb";
  if (/brasil|arroz|feij/.test(s)) return "brasileiro";
  return "default";
}

function normalizarRestricoes(r?: string): string {
  if (!r) return "";
  return r.toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join(",");
}

function montarCacheKey(d: z.infer<typeof Input>): string {
  const obj = d.objetivo.toLowerCase().trim();
  const restr = normalizarRestricoes(d.restricoes);
  const bucket = normalizarPreferenciasBucket(d.preferencias);
  return `v1:${obj}|${restr}|${d.refeicoesPorDia}|${bucket}`;
}

async function gerarComIA(d: z.infer<typeof Input>): Promise<{
  titulo: string;
  resumoCalorico: string;
  refeicoes: Refeicao[];
  modelo: string;
}> {
  const byok = process.env.GEMINI_API_KEY;
  const gatewayKey = process.env.LOVABLE_API_KEY;

  const sys = `Você é um nutricionista esportivo brasileiro. Gere planos alimentares práticos,
acessíveis e culturalmente adequados ao Brasil. Responda SEMPRE em JSON válido, sem texto fora do JSON.`;

  const user = `Gere um plano alimentar para 7 dias com ${d.refeicoesPorDia} refeições por dia.
Objetivo: ${d.objetivo}.
Restrições/alergias: ${d.restricoes || "nenhuma"}.
Preferências: ${d.preferencias || "comida brasileira do dia a dia"}.
Inclua uma receita curta (3-5 passos) em cada refeição.

Schema JSON exigido:
{
  "titulo": "string curta",
  "resumoCalorico": "ex: ~2200 kcal/dia, 150g proteína",
  "refeicoes": [
    { "nome": "Café da manhã", "horario": "07:00", "itens": ["..."], "calorias": 450, "receita": "Passo 1..." }
  ]
}
Retorne UM dia representativo (as refeições serão reaproveitadas pelos 7 dias). Use medidas caseiras.`;

  let content = "";
  let modelo = "";

  if (byok) {
    modelo = MODELO_BYOK;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_BYOK}:generateContent?key=${byok}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    if (!res.ok) throw new Error(`Google AI HTTP ${res.status}: ${await res.text()}`);
    const j = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    content = j.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  } else {
    if (!gatewayKey) throw new Error("Nem GEMINI_API_KEY nem LOVABLE_API_KEY configurados.");
    modelo = MODELO_GATEWAY;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": gatewayKey,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: MODELO_GATEWAY,
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
    const j = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    content = j.choices?.[0]?.message?.content ?? "{}";
  }

  let parsed: { titulo?: string; resumoCalorico?: string; refeicoes?: Refeicao[] } = {};
  try { parsed = JSON.parse(content); } catch { throw new Error("Resposta da IA não é JSON válido"); }
  return {
    titulo: parsed.titulo ?? "Plano alimentar",
    resumoCalorico: parsed.resumoCalorico ?? "",
    refeicoes: parsed.refeicoes ?? [],
    modelo,
  };
}

export const gerarPlanoDieta = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<PlanoDieta> => {
    // ---------------- FREE: 100% estático ----------------
    if (data.modoPreview) {
      const perfil: PerfilTDEE = {
        objetivo: data.objetivo,
        sexo: data.sexo,
        idade: data.idade,
        pesoKg: data.pesoKg,
        alturaCm: data.alturaCm,
        nivelAtividade: data.nivelAtividade,
      };
      const { kcal, resumo } = calcularCalorias(perfil);
      const refeicoes = montarDiaEstatico({
        objetivo: data.objetivo,
        restricoes: data.restricoes ?? "",
        refeicoesPorDia: data.refeicoesPorDia,
        preferencias: data.preferencias ?? "",
        caloriasDia: kcal,
        diaSeed: 0,
      });
      return {
        titulo: tituloDietaPorObjetivo(data.objetivo),
        resumoCalorico: resumo,
        refeicoes,
        diasCobertos: 1,
        preview: true,
        origem: "estatico",
      };
    }

    // ---------------- PRO: cache + IA ----------------
    const key = montarCacheKey(data);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const cached = await supabaseAdmin
      .from("dieta_cache")
      .select("plano, modelo, hits")
      .eq("cache_key", key)
      .maybeSingle();

    if (cached.data) {
      // incrementa hits (best-effort)
      await supabaseAdmin
        .from("dieta_cache")
        .update({ hits: (cached.data.hits ?? 0) + 1 })
        .eq("cache_key", key);
      const p = cached.data.plano as { titulo: string; resumoCalorico: string; refeicoes: Refeicao[] };
      return {
        titulo: p.titulo,
        resumoCalorico: p.resumoCalorico,
        refeicoes: p.refeicoes,
        diasCobertos: 7,
        preview: false,
        origem: "cache",
        modelo: cached.data.modelo,
      };
    }

    const ia = await gerarComIA(data);
    const planoJSON = {
      titulo: ia.titulo,
      resumoCalorico: ia.resumoCalorico,
      refeicoes: ia.refeicoes,
    };

    await supabaseAdmin.from("dieta_cache").insert({
      cache_key: key,
      objetivo: data.objetivo.toLowerCase(),
      restricoes: normalizarRestricoes(data.restricoes),
      refeicoes_dia: data.refeicoesPorDia,
      preferencias_bucket: normalizarPreferenciasBucket(data.preferencias),
      plano: planoJSON,
      modelo: ia.modelo,
    });

    return {
      titulo: ia.titulo,
      resumoCalorico: ia.resumoCalorico,
      refeicoes: ia.refeicoes,
      diasCobertos: 7,
      preview: false,
      origem: "ia",
      modelo: ia.modelo,
    };
  });
