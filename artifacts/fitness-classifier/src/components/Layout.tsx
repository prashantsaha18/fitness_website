import { Link, useLocation } from "wouter";
import { Activity, Camera, History as HistoryIcon, BarChart3, ChevronLeft } from "lucide-react";

export function Layout({ children, showBack = false, title }: { children: React.ReactNode, showBack?: boolean, title?: string }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <header className="flex-none sticky top-0 z-50 glass-panel border-b-0 border-white/5 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          )}
          <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {title || "PHYSIQUE.AI"}
          </h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full glass-panel border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-16 px-6 max-w-md mx-auto">
          <NavItem href="/" icon={<Camera />} label="Analyze" isActive={location === "/"} />
          <NavItem href="/workout" icon={<Activity />} label="Plan" isActive={location === "/workout"} />
          <NavItem href="/history" icon={<HistoryIcon />} label="History" isActive={location === "/history"} />
          <NavItem href="/stats" icon={<BarChart3 />} label="Stats" isActive={location === "/stats"} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 w-16 transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
}
