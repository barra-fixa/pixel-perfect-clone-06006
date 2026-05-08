import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { saveUser } from "@/lib/elevo-store";
import { normalizePassword } from "@/lib/password";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      const pwd = normalizePassword(senha);
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: pwd,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { nome },
          },
        });
        if (error) throw error;
        saveUser({ nome, email });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      }
      navigate({ to: "/home" });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErro(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/home` },
      });
      if (error) throw error;
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro com Google");
    }
  };

  return (
    <div className="elevo-shell px-6 pt-14 pb-8 min-h-dvh flex flex-col">
      <div className="text-center">
        <h1 className="text-3xl font-black">Elevo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
          {mode === "login" ? "Entre na sua conta" : "Crie sua conta grátis"}
        </p>
      </div>

      <form onSubmit={handleEmail} className="mt-8 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
              Nome
            </label>
            <input
              className="input-field"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Como prefere ser chamado?"
            />
          </div>
        )}
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            E-mail
          </label>
          <input
            type="email"
            inputMode="email"
            required
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
            Senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            className="input-field"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {erro && (
          <p className="text-xs" style={{ color: "var(--destructive)" }}>
            {erro}
          </p>
        )}

        <button className="btn-primary" disabled={loading}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs" style={{ color: "var(--subtle)" }}>
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        ou
        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      </div>

      <button onClick={handleGoogle} className="btn-outline">
        Continuar com Google
      </button>

      <button
        onClick={() => {
          setErro(null);
          setMode(mode === "login" ? "signup" : "login");
        }}
        className="mt-6 text-center text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        {mode === "login" ? (
          <>Não tem conta? <span style={{ color: "var(--primary)" }}>Cadastre-se</span></>
        ) : (
          <>Já tem conta? <span style={{ color: "var(--primary)" }}>Entrar</span></>
        )}
      </button>

      <Link to="/" className="mt-4 text-center text-xs" style={{ color: "var(--subtle)" }}>
        ← Voltar
      </Link>
    </div>
  );
}
