// Diagrama anatômico — SVG estilizado de corpo frontal + traseiro.
// Pinta os músculos por intensidade (primário / secundário).
import { useMemo } from "react";
import type { MuscleRegion } from "@/lib/exercisedb-mapping";

type Props = {
  primary?: MuscleRegion[]; // vermelho
  secondary?: MuscleRegion[]; // laranja
};

const NOMES_PT: Record<MuscleRegion, string> = {
  chest: "Peito",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebraço",
  abs: "Abdômen",
  obliques: "Oblíquos",
  quads: "Quadríceps",
  hamstrings: "Posteriores",
  glutes: "Glúteos",
  calves: "Panturrilha",
  lats: "Dorsais",
  upperback: "Costas (sup.)",
  traps: "Trapézio",
  lowerback: "Lombar",
};

// Regiões frontais
const FRONT_REGIONS: Partial<Record<MuscleRegion, string>> = {
  // Peito (dois ovais)
  chest: "M 38 50 Q 50 44 50 60 Q 50 70 42 70 Q 36 68 36 60 Z M 62 50 Q 50 44 50 60 Q 50 70 58 70 Q 64 68 64 60 Z",
  // Ombros
  shoulders: "M 30 48 Q 26 52 28 60 Q 32 60 34 54 Z M 70 48 Q 74 52 72 60 Q 68 60 66 54 Z",
  // Bíceps
  biceps: "M 26 60 Q 22 70 26 82 Q 32 82 32 72 Q 32 65 30 60 Z M 74 60 Q 78 70 74 82 Q 68 82 68 72 Q 68 65 70 60 Z",
  // Antebraço
  forearms: "M 24 84 Q 20 96 24 108 Q 30 108 30 98 Q 30 90 28 84 Z M 76 84 Q 80 96 76 108 Q 70 108 70 98 Q 70 90 72 84 Z",
  // Abdômen
  abs: "M 42 72 L 58 72 L 58 110 L 42 110 Z",
  // Oblíquos
  obliques: "M 36 76 L 42 76 L 42 108 L 38 108 Z M 58 76 L 64 76 L 62 108 L 58 108 Z",
  // Quadríceps
  quads: "M 38 116 Q 36 140 40 160 Q 48 160 48 140 Q 48 122 46 116 Z M 54 116 Q 52 122 52 140 Q 52 160 60 160 Q 64 140 62 116 Z",
  // Panturrilha
  calves: "M 40 168 Q 38 184 42 196 Q 48 196 48 184 Q 48 174 46 168 Z M 54 168 Q 52 174 52 184 Q 52 196 58 196 Q 62 184 60 168 Z",
};

// Regiões traseiras
const BACK_REGIONS: Partial<Record<MuscleRegion, string>> = {
  traps: "M 42 42 Q 50 38 58 42 Q 58 52 50 54 Q 42 52 42 42 Z",
  upperback: "M 36 56 Q 50 52 64 56 Q 64 70 50 72 Q 36 70 36 56 Z",
  lats: "M 32 64 Q 26 84 34 100 Q 42 98 42 86 Q 42 74 38 64 Z M 68 64 Q 74 84 66 100 Q 58 98 58 86 Q 58 74 62 64 Z",
  lowerback: "M 42 100 L 58 100 L 58 116 L 42 116 Z",
  triceps: "M 24 60 Q 20 76 24 88 Q 30 88 30 78 Q 30 68 28 60 Z M 76 60 Q 80 76 76 88 Q 70 88 70 78 Q 70 68 72 60 Z",
  glutes: "M 38 116 Q 36 132 44 138 Q 50 134 50 122 Z M 62 116 Q 64 132 56 138 Q 50 134 50 122 Z",
  hamstrings: "M 38 140 Q 36 158 42 168 Q 48 166 48 152 Q 48 144 46 140 Z M 54 140 Q 52 144 52 152 Q 52 166 58 168 Q 64 158 62 140 Z",
  calves: "M 40 172 Q 38 190 42 200 Q 48 198 48 188 Q 48 178 46 172 Z M 54 172 Q 52 178 52 188 Q 52 198 58 200 Q 62 190 60 172 Z",
};

// Silhueta de corpo (contorno)
const BODY_SILHOUETTE_FRONT =
  "M 50 18 Q 58 18 58 28 Q 58 36 54 38 Q 60 40 68 46 Q 76 50 78 60 Q 80 80 76 110 L 70 112 L 64 116 L 64 162 L 62 198 L 56 200 L 54 168 L 50 168 L 46 168 L 44 200 L 38 198 L 36 162 L 36 116 L 30 112 L 24 110 Q 20 80 22 60 Q 24 50 32 46 Q 40 40 46 38 Q 42 36 42 28 Q 42 18 50 18 Z";

const BODY_SILHOUETTE_BACK = BODY_SILHOUETTE_FRONT;

export function MuscleDiagram({ primary = [], secondary = [] }: Props) {
  const colorFor = (region: MuscleRegion): string => {
    if (primary.includes(region)) return "var(--primary)";
    if (secondary.includes(region)) return "color-mix(in oklab, var(--primary) 45%, var(--card))";
    return "color-mix(in oklab, var(--foreground) 8%, transparent)";
  };

  const allActive = useMemo(() => {
    const set = new Set<MuscleRegion>([...primary, ...secondary]);
    return Array.from(set);
  }, [primary, secondary]);

  return (
    <div className="elevo-card p-4 mt-3">
      <h2 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--primary)" }}>
        Músculos trabalhados
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Frontal */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 220" className="w-full max-h-[260px]">
            <path d={BODY_SILHOUETTE_FRONT} fill="color-mix(in oklab, var(--foreground) 6%, transparent)" stroke="color-mix(in oklab, var(--foreground) 18%, transparent)" strokeWidth="0.6" />
            {(Object.keys(FRONT_REGIONS) as MuscleRegion[]).map((region) => (
              <path
                key={region}
                d={FRONT_REGIONS[region]!}
                fill={colorFor(region)}
                stroke="color-mix(in oklab, var(--foreground) 25%, transparent)"
                strokeWidth="0.4"
              />
            ))}
          </svg>
          <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Frontal
          </span>
        </div>

        {/* Traseira */}
        <div className="flex flex-col items-center">
          <svg viewBox="0 0 100 220" className="w-full max-h-[260px]">
            <path d={BODY_SILHOUETTE_BACK} fill="color-mix(in oklab, var(--foreground) 6%, transparent)" stroke="color-mix(in oklab, var(--foreground) 18%, transparent)" strokeWidth="0.6" />
            {(Object.keys(BACK_REGIONS) as MuscleRegion[]).map((region) => (
              <path
                key={region}
                d={BACK_REGIONS[region]!}
                fill={colorFor(region)}
                stroke="color-mix(in oklab, var(--foreground) 25%, transparent)"
                strokeWidth="0.4"
              />
            ))}
          </svg>
          <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Costas
          </span>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
          Primário
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 45%, var(--card))" }} />
          Secundário
        </div>
      </div>

      {/* Lista de nomes */}
      {allActive.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {primary.map((r) => (
            <span
              key={`p-${r}`}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {NOMES_PT[r]}
            </span>
          ))}
          {secondary.map((r) => (
            <span
              key={`s-${r}`}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{
                backgroundColor: "color-mix(in oklab, var(--primary) 22%, var(--card))",
                color: "var(--primary)",
              }}
            >
              {NOMES_PT[r]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
