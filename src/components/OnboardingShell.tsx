import { Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { type ReactNode } from "react";

export function OnboardingShell({
  step,
  total = 4,
  title,
  subtitle,
  children,
  footer,
  back = true,
}: {
  step?: number;
  total?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  back?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="elevo-shell flex flex-col px-5 pt-6 pb-6 min-h-dvh">
      <div className="flex items-center gap-3 mb-6">
        {back ? (
          <button
            onClick={() => router.history.back()}
            className="size-10 rounded-full flex items-center justify-center elevo-card"
            aria-label="Voltar"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="size-10" />
        )}
        {step ? (
          <div className="flex-1">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(step / total) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs" style={{ color: "var(--subtle)" }}>
              {step} de {total}
            </p>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <Link to="/" className="btn-ghost text-xs">
          Sair
        </Link>
      </div>

      <div className="flex-1 fade-up">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            {subtitle}
          </p>
        )}
        <div className="mt-7">{children}</div>
      </div>

      {footer && <div className="pt-4 sticky bottom-0">{footer}</div>}
    </div>
  );
}
