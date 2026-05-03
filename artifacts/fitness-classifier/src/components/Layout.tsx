import { Link, useLocation } from "wouter";
import { Camera, Activity, Calculator, Ruler, Target, BarChart3, LayoutDashboard, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useQueryClient } from "@tanstack/react-query";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();

  const handleLogout = () => {
    logout();
    qc.clear();
    setLocation("/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 h-14 px-4 flex items-center justify-between border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <Link href="/dashboard">
          <span className="font-black text-base tracking-tight cursor-pointer">
            <span className="text-white">PHYSIQUE</span>
            <span className="text-primary">.AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-xs text-zinc-500 font-medium hidden sm:block">
              {user.name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/8 text-zinc-500 hover:text-white hover:border-white/15 transition-colors text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
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
          <NavBtn href="/dashboard" icon={<LayoutDashboard />} label="Home"    active={location === "/dashboard"} />
          <NavBtn href="/"          icon={<Camera />}          label="Scan"    active={location === "/"} />
          <NavBtn href="/workout"   icon={<Activity />}        label="Plan"    active={location === "/workout"} />
          <NavBtn href="/calculator" icon={<Calculator />}     label="Calc"    active={location === "/calculator"} />
          <NavBtn href="/measurements" icon={<Ruler />}        label="Measure" active={location === "/measurements"} />
          <NavBtn href="/goals"     icon={<Target />}          label="Goals"   active={location === "/goals"} />
          <NavBtn href="/stats"     icon={<BarChart3 />}       label="Stats"   active={location === "/stats"} />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center gap-1 min-w-[40px] py-1 transition-all duration-200 ${
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
