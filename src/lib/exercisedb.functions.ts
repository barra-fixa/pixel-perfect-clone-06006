// Server function: busca info de exercício no ExerciseDB (RapidAPI).
// Cache em memória por instância do worker (TTL 24h).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { EXERCISEDB_MAPPING } from "./exercisedb-mapping";
import type { ExercicioId } from "./exercicios-db";

type CacheEntry = {
  expires: number;
  data: ExerciseDbResult;
};

export type ExerciseDbResult = {
  gifUrl: string | null;
  target: string;
  secondaryMuscles: string[];
  bodyPart: string | null;
  source: "api" | "fallback";
};

const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export const getExerciseDbInfo = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ exId: z.string().min(1).max(64) }).parse(input)
  )
  .handler(async ({ data }) => {
    const exId = data.exId as ExercicioId;
    const mapping = EXERCISEDB_MAPPING[exId];

    if (!mapping) {
      return {
        gifUrl: null,
        target: "",
        secondaryMuscles: [],
        bodyPart: null,
        source: "fallback" as const,
      };
    }

    // Cache hit
    const cached = cache.get(exId);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      const fallback: ExerciseDbResult = {
        gifUrl: null,
        target: mapping.fallback.target,
        secondaryMuscles: mapping.fallback.secondary,
        bodyPart: null,
        source: "fallback",
      };
      return fallback;
    }

    try {
      const url = `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(
        mapping.searchName
      )}?limit=1`;
      const res = await fetch(url, {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      });

      if (!res.ok) {
        console.error(`[ExerciseDB] ${exId} → HTTP ${res.status}`);
        const fallback: ExerciseDbResult = {
          gifUrl: null,
          target: mapping.fallback.target,
          secondaryMuscles: mapping.fallback.secondary,
          bodyPart: null,
          source: "fallback",
        };
        // cache curto pra não martelar a API em caso de erro
        cache.set(exId, { expires: Date.now() + 5 * 60 * 1000, data: fallback });
        return fallback;
      }

      const arr = (await res.json()) as Array<{
        gifUrl?: string;
        target?: string;
        secondaryMuscles?: string[];
        bodyPart?: string;
      }>;

      const first = arr[0];
      const result: ExerciseDbResult = {
        gifUrl: first?.gifUrl ?? null,
        target: first?.target ?? mapping.fallback.target,
        secondaryMuscles: first?.secondaryMuscles ?? mapping.fallback.secondary,
        bodyPart: first?.bodyPart ?? null,
        source: "api",
      };
      cache.set(exId, { expires: Date.now() + TTL_MS, data: result });
      return result;
    } catch (err) {
      console.error(`[ExerciseDB] ${exId} → fetch error`, err);
      return {
        gifUrl: null,
        target: mapping.fallback.target,
        secondaryMuscles: mapping.fallback.secondary,
        bodyPart: null,
        source: "fallback" as const,
      };
    }
  });
