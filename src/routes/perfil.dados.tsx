import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Check, Dumbbell, Home as HomeIcon, Plus, Zap, X } from "lucide-react";
import {
  loadUser,
  saveUser,
  type Caminho,
  type Nivel,
  type Objetivo,
  type Sexo,
} from "@/lib/elevo-store";
import { CARGOS } from "@/lib/taf-data";
import { pedirEquipamento } from "@/lib/equipamentos-pedidos";

export const Route = createFileRoute("/perfil/dados")({
  component: DadosPage,
});

const OBJETIVOS: { id: Objetivo; label: string; emoji: string }[] = [
  { id: "forca", label: "Ganhar força", emoji: "💪" },
  { id: "emagrecer", label: "Emagrecer", emoji: "🔥" },
  { id: "taf", label: "Passar no TAF", emoji: "🎯" },
  { id: "saude", label: "Saúde", emoji: "❤️" },
  { id: "definicao", label: "Definição", emoji: "✨" },
  { id: "zero", label: "Começar do zero", emoji: "🌱" },
];

const NIVEIS: { id: Nivel; label: string; sub: string }[] = [
  { id: "iniciante", label: "Iniciante", sub: "0-1 barras seguidas" },
  { id: "intermediario", label: "Intermediário", sub: "2-7 barras" },
  { id: "avancado", label: "Avançado", sub: "8+ barras" },
];

// Opções de equipamentos (alinhadas com onboarding.equipamentos.tsx)
const EQUIPAMENTOS: { id: string; emoji: string; titulo: string }[] = [
  { id: "nenhum", emoji: "🏃", titulo: "Nenhum — só meu corpo" },
  { id: "halteres", emoji: "🏋️", titulo: "Halteres" },
  { id: "elastico", emoji: "🟢", titulo: "Banda elástica" },
  { id: "corda", emoji: "🪢", titulo: "Corda de pular" },
  { id: "kettlebell", emoji: "⚫", titulo: "Kettlebell" },
  { id: "paralela", emoji: "🦾", titulo: "Barra paralela" },
  { id: "saco", emoji: "🥊", titulo: "Saco de pancada" },
  { id: "bike", emoji: "🚴", titulo: "Bicicleta" },
  { id: "tapete", emoji: "🧘", titulo: "Colchonete" },
];

function DadosPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [objetivo, setObjetivo] = useState<Objetivo | undefined>();
  const [nivel, setNivel] = useState<Nivel | undefined>();
  const [frequencia, setFrequencia] = useState<number>(3);
  const [tafCargoId, setTafCargoId] = useState<string | undefined>();
  const [tafSexo, setTafSexo] = useState<Sexo | undefined>();
  const [caminho, setCaminho] = useState<Caminho | undefined>();
  const [equipamentos, setEquipamentos] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  // Modal "Não vejo meu equipamento"
  const [pedidoOpen, setPedidoOpen] = useState(false);
  const [pedidoNome, setPedidoNome] = useState("");
  const [pedidoDesc, setPedidoDesc] = useState("");
  const [pedidoStatus, setPedidoStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [pedidoErr, setPedidoErr] = useState<string>("");

  async function handlePedirEquipamento() {
    if (pedidoStatus === "sending") return;
    setPedidoStatus("sending");
    const r = await pedirEquipamento(pedidoNome, pedidoDesc);
    if (r.ok) {
      setPedidoStatus("ok");
      setTimeout(() => {
        setPedidoOpen(false);
        setPedidoNome("");
        setPedidoDesc("");
        setPedidoStatus("idle");
      }, 1400);
    } else {
      setPedidoStatus("err");
      setPedidoErr(r.erro ?? "Erro ao enviar");
    }
  }

  useEffect(() => {
    const u = loadUser();
    setNome(u.nome ?? "");
    setEmail(u.email ?? "");
    setObjetivo(u.objetivo);
    setNivel(u.nivel);
    setFrequencia(u.frequencia ?? 3);
    setTafCargoId(u.tafCargoId);
    setTafSexo(u.tafSexo);
    setCaminho(u.caminho);
    setEquipamentos(u.equipamentos ?? []);
  }, []);

  const onSave = () => {
    saveUser({
      nome,
      email,
      objetivo,
      nivel,
      frequencia,
      tafCargoId,
      tafSexo,
      caminho,
      equipamentos,
    });
    setSaved(true);
    setTimeout(() => navigate({ to: "/perfil" }), 600);
  };

  const toggleEquip = (id: string) => {
    setEquipamentos((prev) => {
      // "Nenhum" é exclusivo: ao marcar, desmarca todos os outros;
      // ao marcar qualquer outro item, desmarca "Nenhum" automaticamente.
      if (id === "nenhum") {
        return prev.includes("nenhum") ? [] : ["nenhum"];
      }
      const semNenhum = prev.filter((p) => p !== "nenhum");
      return semNenhum.includes(id)
        ? semNenhum.filter((p) => p !== id)
        : [...semNenhum, id];
    });
  };

  return (
    <div className="elevo-shell px-5 pt-6 pb-32 min-h-dvh">
      <header className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate({ to: "/perfil" })}
          className="size-10 rounded-full flex items-center justify-center elevo-card"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Meus dados</h1>
      </header>

      <section className="space-y-3">
        <Field label="Nome">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Seu nome"
          />
        </Field>
        <Field label="E-mail">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full bg-transparent outline-none text-sm"
            placeholder="voce@exemplo.com"
          />
        </Field>
      </section>

      <Section title="Objetivo">
        <div className="grid grid-cols-2 gap-2">
          {OBJETIVOS.map((o) => (
            <button
              key={o.id}
              data-active={objetivo === o.id}
              onClick={() => setObjetivo(o.id)}
              className="selectable text-left p-3"
            >
              <div className="text-xl">{o.emoji}</div>
              <div className="text-xs font-semibold mt-1">{o.label}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Como você treina (caminho) */}
      <Section title="Como você treina?">
        <div className="grid grid-cols-1 gap-2">
          <button
            data-active={caminho === "barra"}
            onClick={() => setCaminho("barra")}
            className="selectable selectable-purple flex gap-3 items-center text-left p-3"
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)",
                color: "var(--secondary)",
              }}
            >
              <Dumbbell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Com minha Barra Fixa</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Treinos focados em calistenia e progressão na barra
              </div>
            </div>
            {caminho === "barra" && <Check size={18} style={{ color: "var(--secondary)" }} />}
          </button>

          <button
            data-active={caminho === "casa"}
            onClick={() => setCaminho("casa")}
            className="selectable flex gap-3 items-center text-left p-3"
          >
            <div
              className="size-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "color-mix(in oklab, var(--primary) 25%, transparent)",
                color: "var(--primary)",
              }}
            >
              <HomeIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">Treino em casa</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Peso do corpo + equipamentos opcionais
              </div>
            </div>
            {caminho === "casa" && <Check size={18} style={{ color: "var(--primary)" }} />}
          </button>
        </div>
      </Section>

      {/* Trilha da Barra — atalho quando o caminho é barra */}
      {caminho === "barra" && (
        <Link
          to="/trilha-barra"
          className="elevo-card p-4 mt-4 flex items-center gap-3"
          style={{ borderColor: "color-mix(in oklab, var(--secondary) 30%, var(--border))" }}
        >
          <div
            className="size-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 25%, transparent)" }}
          >
            <Zap size={18} style={{ color: "var(--secondary)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Trilha da Barra</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Veja em qual nível da jornada você está
            </div>
          </div>
          <ChevronLeft size={18} className="rotate-180" style={{ color: "var(--subtle)" }} />
        </Link>
      )}

      {/* Equipamentos — só mostra se caminho == casa */}
      {caminho === "casa" && (
        <Section title="O que você tem em casa?">
          <p className="text-xs mb-3 -mt-1" style={{ color: "var(--muted-foreground)" }}>
            Marque o que tiver disponível. Vamos usar nos seus treinos.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPAMENTOS.map((e) => (
              <button
                key={e.id}
                data-active={equipamentos.includes(e.id)}
                onClick={() => toggleEquip(e.id)}
                className="selectable text-left p-3"
              >
                <div className="text-xl">{e.emoji}</div>
                <div className="text-xs font-semibold mt-1">{e.titulo}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPedidoOpen(true)}
            className="mt-3 w-full elevo-card p-3 flex items-center justify-center gap-2 text-sm font-semibold"
            style={{ color: "var(--primary)" }}
          >
            <Plus size={16} />
            Não vejo o meu equipamento aqui
          </button>
        </Section>
      )}

      <Section title="Nível">
        <div className="space-y-2">
          {NIVEIS.map((n) => (
            <button
              key={n.id}
              data-active={nivel === n.id}
              onClick={() => setNivel(n.id)}
              className="selectable w-full text-left flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-semibold">{n.label}</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {n.sub}
                </div>
              </div>
              {nivel === n.id && <Check size={18} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Frequência semanal">
        <div className="elevo-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Treinos por semana
            </span>
            <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>
              {frequencia}x
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={frequencia}
            onChange={(e) => setFrequencia(parseInt(e.target.value))}
            className="w-full accent-[oklch(0.62_0.13_160)]"
          />
        </div>
      </Section>

      <Section title="TAF — cargo alvo">
        <div className="grid grid-cols-2 gap-2">
          {CARGOS.map((c) => (
            <button
              key={c.id}
              data-active={tafCargoId === c.id}
              onClick={() => setTafCargoId(c.id)}
              className="selectable text-left p-3"
            >
              <div className="text-xl">{c.emoji}</div>
              <div className="text-xs font-semibold mt-1">{c.sigla}</div>
              <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                {c.nome}
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            data-active={tafSexo === "masc"}
            onClick={() => setTafSexo("masc")}
            className="selectable text-center"
          >
            <div className="text-sm font-semibold">Masculino</div>
          </button>
          <button
            data-active={tafSexo === "fem"}
            onClick={() => setTafSexo("fem")}
            className="selectable text-center"
          >
            <div className="text-sm font-semibold">Feminino</div>
          </button>
        </div>
      </Section>

      <button onClick={onSave} className="btn-primary mt-8">
        {saved ? "Salvo ✓" : "Salvar alterações"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="elevo-card p-3 block">
      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--subtle)" }}>
        {label}
      </div>
      {children}
    </label>
  );
}
