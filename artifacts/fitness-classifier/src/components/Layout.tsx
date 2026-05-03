import { Link, useLocation } from "wouter";
import { Camera, Activity, Calculator, Ruler, Target, BarChart3, LogIn, LogOut, User, LayoutDashboard } from "lucide-react";
import { Show, useUser, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Athlete";

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 h-14 px-4 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <span className="font-black text-base tracking-tight">
          <span className="text-white">PHYSIQUE</span>
          <span className="text-primary">.AI</span>
        </span>

        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-xs text-zinc-300 max-w-[72px] truncate font-medium">{displayName}</span>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: `${basePath}/` })}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/8 transition-colors text-zinc-500 hover:text-zinc-300"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="h-8 px-3 flex items-center gap-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              Sign In
            </Link>
          </Show>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        {title && (
          <div className="px-4 pt-5 pb-1">
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
        )}
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 h-16 border-t border-white/5 bg-background/90 backdrop-blur-xl">
        <div className="h-full max-w-lg mx-auto flex items-center justify-around px-2">
          <Show when="signed-in">
            <NavBtn href="/dashboard" icon={<LayoutDashboard />} label="Home" active={location === "/dashboard"} />
          </Show>
          <Show when="signed-out">
            <NavBtn href="/" icon={<Camera />} label="Scan" active={location === "/"} />
          </Show>
          <NavBtn href="/workout" icon={<Activity />} label="Plan" active={location === "/workout"} />
          <NavBtn href="/calculator" icon={<Calculator />} label="Calc" active={location === "/calculator"} />
          <NavBtn href="/measurements" icon={<Ruler />} label="Measure" active={location === "/measurements"} />
          <NavBtn href="/goals" icon={<Target />} label="Goals" active={location === "/goals"} />
          <NavBtn href="/stats" icon={<BarChart3 />} label="Stats" active={location === "/stats"} />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 min-w-[44px] py-1 transition-all duration-200 ${
        active ? "text-primary" : "text-zinc-600 hover:text-zinc-400"
      }`}
    >
      <div className={`w-5 h-5 [&>svg]:w-full [&>svg]:h-full ${active ? "[&>svg]:stroke-[2.5]" : "[&>svg]:stroke-[1.75]"}`}>
        {icon}
      </div>
      <span className={`text-[9px] font-semibold uppercase tracking-wider ${active ? "text-primary" : ""}`}>{label}</span>
      {active && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
      )}
    </Link>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-4 pt-5 pb-4">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-card border border-white/8 ${className}`}>
      {children}
    </div>
  );
}

export function Spinner() {
  return <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
}

export function AuthGate({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
      <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
        <LogIn className="w-7 h-7 text-zinc-500" />
      </div>
      <p className="text-zinc-400 text-sm">{message || "Sign in to access this feature"}</p>
      <Link
        href="/sign-in"
        className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Sign In
      </Link>
    </div>
  );
}
