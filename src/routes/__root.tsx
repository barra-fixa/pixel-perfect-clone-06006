import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { useAuth } from "@/hooks/use-auth";

const PUBLIC_ROUTES = ["/", "/auth"];
function isPublic(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/onboarding")) return true;
  return false;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Elevo — Treine em casa, eleve sua vida" },
      { name: "description", content: "Plano de treino personalizado por IA. Treine em casa, com ou sem barra. Se bater a meta, o mês é grátis." },
      { name: "theme-color", content: "#1D9E75" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Elevo" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:title", content: "Elevo — Treine em casa, eleve sua vida" },
      { property: "og:description", content: "Plano de treino personalizado por IA. Treine em casa, com ou sem barra. Se bater a meta, o mês é grátis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Elevo — Treine em casa, eleve sua vida" },
      { name: "twitter:description", content: "Plano de treino personalizado por IA. Treine em casa, com ou sem barra. Se bater a meta, o mês é grátis." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d62ad0a1-9859-47fe-ac28-6ae17d08b3bf/id-preview-417cb987--14d9864d-84a0-4462-8699-485dd2c2f80a.lovable.app-1778189818528.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d62ad0a1-9859-47fe-ac28-6ae17d08b3bf/id-preview-417cb987--14d9864d-84a0-4462-8699-485dd2c2f80a.lovable.app-1778189818528.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pub = isPublic(location.pathname);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated && !pub) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, isAuthenticated, pub, navigate]);

  if (loading && !pub) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Carregando...
      </div>
    );
  }
  if (!isAuthenticated && !pub) return null;
  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}
