import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import {
  Camera, Target, Ruler, Flame, TrendingUp,
  ChevronRight, Award, Activity, Zap, Plus,
} from "lucide-react";
import { Link } from "wouter";
import { authHeaders } from "@/lib/auth-store";
import { useAuthStore } from "@/lib/auth-store";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface DashboardData {
  latestScan: any;
  totalScans: number;
  completedGoals: number;
  activeGoals: number;
  streak: number;
  recentMeasurements: any[];
  recentClassifications: any[];
}

const typeStyle: Record<string, { color: string; ring: string; text: string }> = {
  athletic:   { color: "bg-emerald-500", ring: "border-emerald-500/40", text: "text-emerald-400" },
  skinny:     { color: "bg-blue-500",    ring: "border-blue-500/40",    text: "text-blue-400"    },
  overweight: { color: "bg-amber-500",   ring: "border-amber-500/40",   text: "text-amber-400"   },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const user = useAuthStore(s => s.user);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/dashboard`, { headers: authHeaders() });
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const latest = data?.latestScan;
  const lstyle = latest ? (typeStyle[latest.physique_type ?? latest.physiqueType] ?? typeStyle.athletic) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm">{greeting},</p>
            <h2 className="text-2xl font-bold text-white">{user?.name ?? "Athlete"} 👋</h2>
          </div>
          {(data?.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{data!.streak}d</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setLocation("/")}
          className="w-full rounded-2xl bg-primary p-4 flex items-center justify-between group hover:bg-primary/90 transition-all active:scale-[.99] shadow-lg shadow-primary/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white">Scan Your Physique</p>
              <p className="text-blue-200 text-xs mt-0.5">AI-powered body analysis</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[0,1,2].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <StatPill icon={<Camera className="w-4 h-4" />} value={data?.totalScans ?? 0} label="Scans" cls="text-blue-400 bg-blue-500/10 border-blue-500/20" />
            <StatPill icon={<Target className="w-4 h-4" />} value={data?.activeGoals ?? 0} label="Goals" cls="text-purple-400 bg-purple-500/10 border-purple-500/20" />
            <StatPill icon={<Award className="w-4 h-4" />} value={data?.completedGoals ?? 0} label="Done" cls="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
          </div>
        )}

        {isLoading ? (
          <div className="h-24 rounded-2xl skeleton" />
        ) : latest && lstyle ? (
          <div className={`rounded-2xl p-4 border ${lstyle.ring} bg-card`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Latest Analysis</p>
              <span className="text-xs text-zinc-600">{new Date(latest.created_at ?? latest.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${lstyle.color}`} />
                <p className={`text-xl font-bold capitalize ${lstyle.text}`}>{latest.physique_type ?? latest.physiqueType}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-600 text-xs">Confidence</p>
                <p className="text-white font-bold">{Math.round((latest.confidence ?? 0) * 100)}%</p>
              </div>
            </div>
          </div>
        ) : !isLoading && (
          <div className="rounded-2xl p-6 border border-white/8 bg-card flex flex-col items-center gap-2 text-center">
            <Zap className="w-8 h-8 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No scans yet. Start your first analysis!</p>
          </div>
        )}

        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2.5">
            <QuickAction href="/measurements" icon={<Ruler className="w-4 h-4" />}     label="Log Measurements" color="text-cyan-400"    bg="border-cyan-500/20 bg-cyan-500/8" />
            <QuickAction href="/goals"        icon={<Plus className="w-4 h-4" />}      label="New Goal"         color="text-purple-400"  bg="border-purple-500/20 bg-purple-500/8" />
            <QuickAction href="/calculator"   icon={<Activity className="w-4 h-4" />}  label="BMI Calculator"   color="text-amber-400"   bg="border-amber-500/20 bg-amber-500/8" />
            <QuickAction href="/workout"      icon={<TrendingUp className="w-4 h-4" />} label="Training Plan"   color="text-emerald-400" bg="border-emerald-500/20 bg-emerald-500/8" />
          </div>
        </div>

        {(data?.recentClassifications?.length ?? 0) > 1 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Recent Scans</p>
              <Link href="/history" className="text-xs text-primary font-medium">View all</Link>
            </div>
            <div className="space-y-2">
              {data!.recentClassifications.slice(1, 4).map((c: any) => {
                const s = typeStyle[c.physique_type ?? c.physiqueType] ?? typeStyle.athletic;
                return (
                  <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-white/6">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className={`text-sm font-semibold capitalize ${s.text}`}>{c.physique_type ?? c.physiqueType}</span>
                    </div>
                    <span className="text-xs text-zinc-600">{new Date(c.created_at ?? c.createdAt).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatPill({ icon, value, label, cls }: { icon: React.ReactNode; value: number; label: string; cls: string }) {
  return (
    <div className={`rounded-2xl p-3 border flex flex-col items-center gap-1 ${cls}`}>
      {icon}
      <p className="text-xl font-black text-white">{value}</p>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, color, bg }: { href: string; icon: React.ReactNode; label: string; color: string; bg: string }) {
  return (
    <Link href={href} className={`rounded-xl p-3 border flex items-center gap-2.5 hover:opacity-80 transition-opacity ${bg}`}>
      <div className={color}>{icon}</div>
      <span className="text-sm text-zinc-300 font-medium">{label}</span>
    </Link>
  );
}
