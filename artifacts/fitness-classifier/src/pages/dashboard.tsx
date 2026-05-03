import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Show, useUser } from "@clerk/react";
import { Layout } from "@/components/Layout";
import { Camera, Target, Ruler, Flame, TrendingUp, ChevronRight, Zap, Award, Activity } from "lucide-react";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface DashboardData {
  profile: any;
  latestScan: any;
  totalScans: number;
  completedGoals: number;
  activeGoals: number;
  streak: number;
  recentMeasurements: any[];
  recentClassifications: any[];
}

function physiqueColor(type: string) {
  if (type === "athletic") return "text-emerald-400";
  if (type === "skinny") return "text-blue-400";
  return "text-amber-400";
}

function physiqueGradient(type: string) {
  if (type === "athletic") return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
  if (type === "skinny") return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
  return "from-amber-500/20 to-amber-500/5 border-amber-500/30";
}

function AuthedDashboard() {
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/dashboard`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to fetch dashboard");
      return r.json();
    },
  });

  const firstName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || "Athlete";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latest = data?.latestScan;

  return (
    <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-500 text-sm">Good day,</p>
          <h2 className="text-xl font-bold text-white">{firstName} 👋</h2>
        </div>
        {(data?.streak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400">{data?.streak}d streak</span>
          </div>
        )}
      </div>

      {/* Scan CTA */}
      <button
        onClick={() => setLocation("/")}
        className="w-full bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-4 flex items-center justify-between group hover:from-blue-500 hover:to-blue-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white">Scan Your Physique</p>
            <p className="text-blue-200 text-xs">AI-powered body analysis</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<Camera className="w-4 h-4" />} value={data?.totalScans ?? 0} label="Scans" color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
        <StatCard icon={<Target className="w-4 h-4" />} value={data?.activeGoals ?? 0} label="Active Goals" color="text-purple-400" bg="bg-purple-500/10 border-purple-500/20" />
        <StatCard icon={<Award className="w-4 h-4" />} value={data?.completedGoals ?? 0} label="Completed" color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
      </div>

      {/* Latest Physique */}
      {latest && (
        <div className={`rounded-2xl p-4 bg-gradient-to-br border ${physiqueGradient(latest.physiqueType)}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Latest Analysis</p>
            <span className="text-xs text-zinc-500">{new Date(latest.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold capitalize ${physiqueColor(latest.physiqueType)}`}>{latest.physiqueType}</p>
              <p className="text-zinc-400 text-sm">{Math.round((latest.confidence ?? 0) * 100)}% confidence</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-400 text-xs">BMI</p>
              <p className="text-white font-bold text-lg">{typeof latest.bodyMetrics?.bmi === "number" ? latest.bodyMetrics.bmi.toFixed(1) : "—"}</p>
            </div>
          </div>
        </div>
      )}

      {!latest && (
        <div className="rounded-2xl p-4 bg-card border border-white/10 text-center">
          <Zap className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">No scans yet. Start your first physique analysis!</p>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/measurements" icon={<Ruler className="w-5 h-5" />} label="Log Measurements" color="text-cyan-400" bg="bg-cyan-500/10 border-cyan-500/20" />
          <QuickAction href="/goals" icon={<Target className="w-5 h-5" />} label="Set a Goal" color="text-purple-400" bg="bg-purple-500/10 border-purple-500/20" />
          <QuickAction href="/calculator" icon={<Activity className="w-5 h-5" />} label="BMI Calculator" color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
          <QuickAction href="/workout" icon={<TrendingUp className="w-5 h-5" />} label="View Plan" color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
        </div>
      </div>

      {/* Recent Activity */}
      {(data?.recentClassifications?.length ?? 0) > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Recent Scans</p>
            <Link href="/history" className="text-xs text-primary">View all</Link>
          </div>
          <div className="space-y-2">
            {data!.recentClassifications.slice(1, 4).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-card border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className={`text-sm font-medium capitalize ${physiqueColor(c.physiqueType)}`}>{c.physiqueType}</span>
                </div>
                <span className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color, bg }: { icon: React.ReactNode, value: number, label: string, color: string, bg: string }) {
  return (
    <div className={`rounded-xl p-3 border ${bg} flex flex-col items-center gap-1`}>
      <div className={color}>{icon}</div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-zinc-500 text-center leading-tight">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon, label, color, bg }: { href: string, icon: React.ReactNode, label: string, color: string, bg: string }) {
  return (
    <Link href={href} className={`rounded-xl p-3 border ${bg} flex items-center gap-2 hover:opacity-80 transition-opacity`}>
      <div className={color}>{icon}</div>
      <span className="text-sm text-zinc-300">{label}</span>
    </Link>
  );
}

function SignedOutLanding() {
  return (
    <div className="px-4 py-8 max-w-lg mx-auto space-y-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto">
        <Activity className="w-10 h-10 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Track Your Fitness Journey</h2>
        <p className="text-zinc-400">Sign in to access your personal dashboard, track measurements, set goals, and analyze your physique over time.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-left">
        {[
          { icon: "📸", title: "AI Physique Scan", desc: "Pose estimation & body type classification" },
          { icon: "📊", title: "Progress Tracking", desc: "Measurements & charts over time" },
          { icon: "🎯", title: "Fitness Goals", desc: "Set and track your targets" },
          { icon: "🔥", title: "Daily Streaks", desc: "Stay consistent with your training" },
        ].map((f) => (
          <div key={f.title} className="rounded-xl p-3 bg-card border border-white/10">
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="text-sm font-semibold text-white">{f.title}</p>
            <p className="text-xs text-zinc-500">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Link href="/sign-up" className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors text-center">
          Create Account
        </Link>
        <Link href="/sign-in" className="flex-1 py-3 rounded-xl bg-card border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-colors text-center">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Layout title="PHYSIQUE.AI">
      <Show when="signed-in">
        <AuthedDashboard />
      </Show>
      <Show when="signed-out">
        <SignedOutLanding />
      </Show>
    </Layout>
  );
}
