import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useEhPro } from "@/lib/pro-status";

type Props = {
  /** Conteúdo Pro — renderizado só quando o usuário tem plano ativo. */
  children: ReactNode;
  /** Título do estado bloqueado. */
  titulo?: string;
  /** Descrição curta do estado bloqueado. */
  descricao?: string;
  /** Rota do CTA "Reativar Pro". Default: /upgrade. */
  ctaTo?: "/upgrade" | "/onboarding/preview";
  /** Texto do CTA. */
  ctaLabel?: string;
};

/**
 * Gate de acesso reutilizável: se Pro, renderiza children; se free/cancelado,
 * mostra estado bloqueado com CTA "Reativar Pro" sem deslogar o usuário.
 */
export function ProGate({
  children,
  titulo = "Recurso Pro",
  descricao = "Este recurso faz parte do plano Pro. Reative pra liberar de novo.",
  ctaTo = "/upgrade",
  ctaLabel = "Reativar Pro",
}: Props) {
  const ehPro = useEhPro();
  if (ehPro) return <>{children}</>;
  return <ProBloqueio titulo={titulo} descricao={descricao} ctaTo={ctaTo} ctaLabel={ctaLabel} />;
}

/** Versão "card" — pode ser usada inline (ex: como banner em uma página parcialmente liberada). */
export function ProBloqueio({
  titulo,
  descricao,
  ctaTo = "/upgrade",
  ctaLabel = "Reativar Pro",
}: {
  titulo: string;
  descricao: string;
  ctaTo?: "/upgrade" | "/onboarding/preview";
  ctaLabel?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklab, var(--secondary) 22%, var(--card)), var(--card))",
        border: "1px solid color-mix(in oklab, var(--secondary) 40%, var(--border))",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "color-mix(in oklab, var(--secondary) 28%, transparent)" }}
        >
          <Lock size={20} style={{ color: "var(--secondary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} style={{ color: "var(--secondary)" }} />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "var(--secondary)" }}
            >
              Pro
            </span>
          </div>
          <h3 className="text-base font-bold mt-0.5 leading-tight">{titulo}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            {descricao}
          </p>
        </div>
      </div>
      <Link
        to={ctaTo}
        className="btn-primary mt-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, var(--secondary), color-mix(in oklab, var(--secondary) 70%, var(--primary)))",
        }}
      >
        {ctaLabel}
      </Link>
      <p className="text-center text-[11px] mt-2" style={{ color: "var(--subtle)" }}>
        Você continua usando o app · treinos com barra fixa seguem liberados.
      </p>
    </div>
  );
}
