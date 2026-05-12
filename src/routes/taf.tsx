import { createFileRoute, Link, Outlet, useChildMatches, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, ChevronRight, Trophy, Calendar, Target } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { CARGOS, getCargo } from "@/lib/taf-data";
import { saveUser, useElevoUser, type Sexo } from "@/lib/elevo-store";

export const Route = createFileRoute("/taf")({
  component: TafLayout,
});

/**
 * Wrapper que decide o que renderizar:
 * - `/taf` -> TafPage (seleção de cargo, histórico).
 * - `/taf/simulado`, `/taf/resultado` -> <Outlet /> (rota filha).
 */
function TafLayout() {
  const filhas = useChildMatches();
  if (filhas.length > 0) {
    return <Outlet />;
  }
  return <TafPage />;
}

function TafPage() {
  const user = useElevoUser();
  const navigate = useNavigate();
  const [cargoId, setCargoId] = useState<string | undefined>(user.tafCargoId);
  const [sexo, setSexo] = useState<Sexo>(user.tafSexo ?? "masc");
  const cargo = getCargo(cargoId);
  const ultimo = (user.tafHistorico ?? []).filter((h) => h.cargoId === cargoId).at(-1);

  const iniciarSimulado = () => {
    if (!cargoId) return;
    saveUser({ tafCargoId: cargoId, tafSexo: sexo });
    navigate({ to: "/taf/simulado" });
  };

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-1">
        <div
          className="size-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in oklab, var(--primary) 18%, transparent)" }}
        >
          <Shield size={20} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight">TAF</h1>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Teste de Aptidão Física
          </p>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Escolha seu cargo</h2>
        <div className="grid gap-3">
          {CARGOS.map((c) => (
            <button
              key={c.id}
              className="selectable flex items-center gap-3"
              data-active={cargoId === c.id}
              onClick={() => setCargoId(c.id)}
            >
              <span className="text-3xl">{c.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">{c.nome}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {c.provas.length} provas · {c.sigla}
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--subtle)" }} />
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold mb-3">Sexo (para metas)</h2>
        <div className="flex gap-2">
          <button
            className="chip flex-1"
            data-active={sexo === "masc"}
            onClick={() => setSexo("masc")}
          >
            Masculino
          </button>
          <button
            className="chip flex-1"
            data-active={sexo === "fem"}
            onClick={() => setSexo("fem")}
          >
            Feminino
          </button>
        </div>
      </section>

      {cargo && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold mb-3">
            Metas — {cargo.nome}
          </h2>
          <div className="elevo-card p-4 space-y-3">
            {cargo.provas.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.nome}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {p.descricao}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                    {p.meta[sexo]} {p.unidade}
                  </div>
                  <div className="text-[10px]" style={{ color: "var(--subtle)" }}>
                    mínimo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {ultimo && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy size={14} style={{ color: "var(--secondary)" }} />
            Último simulado
          </h2>
          <div className="elevo-card p-4">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
              <Calendar size={12} />
              {new Date(ultimo.data).toLocaleDateString("pt-BR")}
            </div>
            <div className="space-y-2">
              {cargo?.provas.map((p) => {
                const v = ultimo.resultados[p.id] ?? 0;
                const meta = p.meta[ultimo.sexo];
                const ok = v >= meta;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span>{p.emoji} {p.nome}</span>
                    <span
                      className="font-semibold"
                      style={{ color: ok ? "var(--primary)" : "var(--destructive)" }}
                    >
                      {v} / {meta} {p.unidade}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="mt-8">
        <button
          className="btn-primary"
          disabled={!cargoId}
          onClick={iniciarSimulado}
        >
          <Target size={18} className="mr-2" />
          Iniciar simulado
        </button>
        <Link to="/home" className="btn-ghost w-full mt-2">
          Voltar
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
