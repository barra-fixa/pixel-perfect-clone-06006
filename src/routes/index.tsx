import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Splash,
});

function Splash() {
  return (
    <div className="elevo-shell elevo-grid-bg flex flex-col items-center justify-between px-6 pt-24 pb-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div
          className="mb-6 size-16 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
            boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 70%, transparent)",
          }}
        >
          <span className="text-2xl font-black text-white">E</span>
        </div>
        <h1 className="text-6xl font-black tracking-tight">Elevo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          by Barra Fixa
        </p>
        <p className="mt-10 text-xl font-medium leading-tight max-w-[280px]">
          Eleve seu treino.
          <br />
          <span style={{ color: "var(--primary)" }}>Eleve sua vida.</span>
        </p>
      </div>

      <div className="w-full space-y-3">
        <Link to="/onboarding/objetivo" className="btn-primary">
          Começar agora
        </Link>
        <Link to="/home" className="btn-ghost w-full block text-center">
          Já tenho conta
        </Link>
      </div>
    </div>
  );
}
