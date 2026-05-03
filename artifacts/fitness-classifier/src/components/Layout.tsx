import { Link, useLocation } from "wouter";
import { Activity, Camera, History as HistoryIcon, BarChart3, ChevronLeft, LayoutDashboard, Calculator, Ruler, Target, LogIn, LogOut, User } from "lucide-react";
import { Show, useUser, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function Layout({ children, showBack = false, title, backHref }: { children: React.ReactNode, showBack?: boolean, title?: string, backHref?: string }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <header className="flex-none sticky top-0 z-50 glass-panel border-b-0 border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link href={backHref || "/"} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            {title || "PHYSIQUE.AI"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs text-zinc-300 max-w-[80px] truncate">{user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "User"}</span>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: `${basePath}/` })}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
              <LogIn className="w-3 h-3" />
              Sign in
            </Link>
          </Show>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 w-full glass-panel border-t border-white/5 pb-safe">
        <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
          <Show when="signed-in">
            <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Home" isActive={location === "/dashboard"} />
          </Show>
          <Show when="signed-out">
            <NavItem href="/" icon={<Camera className="w-5 h-5" />} label="Scan" isActive={location === "/"} />
          </Show>
          <NavItem href="/workout" icon={<Activity className="w-5 h-5" />} label="Plan" isActive={location === "/workout"} />
          <NavItem href="/calculator" icon={<Calculator className="w-5 h-5" />} label="Calc" isActive={location === "/calculator"} />
          <NavItem href="/measurements" icon={<Ruler className="w-5 h-5" />} label="Measure" isActive={location === "/measurements"} />
          <NavItem href="/goals" icon={<Target className="w-5 h-5" />} label="Goals" isActive={location === "/goals"} />
          <NavItem href="/stats" icon={<BarChart3 className="w-5 h-5" />} label="Stats" isActive={location === "/stats"} />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-0.5 min-w-[44px] transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span className="text-[9px] font-medium tracking-wide uppercase">{label}</span>
    </Link>
  );
}
