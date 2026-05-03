import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthStore } from "@/lib/auth-store";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Login() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const r = await fetch(`${basePath}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed");
      setAuth(data.token, data.user);
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message || "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight mb-1">
            <span className="text-white">PHYSIQUE</span>
            <span className="text-primary">.AI</span>
          </h1>
          <p className="text-zinc-500 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 font-medium uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-600">
          Don't have an account?{" "}
          <button
            onClick={() => setLocation("/signup")}
            className="text-primary font-semibold hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
