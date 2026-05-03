import { Activity, Users, Target, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useGetStats } from "@workspace/api-client-react";

const TYPE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Athletic:   { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  Skinny:     { bar: "bg-blue-500",    text: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"       },
  Overweight: { bar: "bg-amber-500",   text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"     },
};

export default function Stats() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <Layout title="Global Stats">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        {isLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 rounded-2xl skeleton" />
              <div className="h-28 rounded-2xl skeleton" />
            </div>
            <div className="h-48 rounded-2xl skeleton" />
            <div className="h-40 rounded-2xl skeleton" />
          </div>
        ) : stats ? (
          <>
            {/* Top stats */}
            <div className="grid grid-cols-2 gap-3">
              <BigStat
                icon={<Users className="w-5 h-5 text-blue-400" />}
                label="Total Scans"
                value={stats.totalClassifications}
                bg="bg-blue-500/10 border-blue-500/20"
              />
              <BigStat
                icon={<Target className="w-5 h-5 text-purple-400" />}
                label="Avg Confidence"
                value={`${(stats.averageConfidence * 100).toFixed(1)}%`}
                bg="bg-purple-500/10 border-purple-500/20"
              />
            </div>

            {/* Distribution */}
            <div className="rounded-2xl bg-card border border-white/8 p-5">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Physique Distribution</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Athletic",   key: "athletic"   },
                  { label: "Skinny",     key: "skinny"     },
                  { label: "Overweight", key: "overweight" },
                ].map(({ label, key }) => {
                  const val = stats.breakdown[key] ?? 0;
                  const pct = stats.totalClassifications > 0
                    ? (val / stats.totalClassifications) * 100
                    : 0;
                  const style = TYPE_COLORS[label] ?? TYPE_COLORS.Athletic;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${style.bar}`} />
                          <span className={`text-sm font-semibold ${style.text}`}>{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600">{val} scans</span>
                          <span className={`text-xs font-mono font-bold ${style.text}`}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live feed */}
            {stats.recentActivity?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">Live Feed</p>
                </div>
                <div className="rounded-2xl bg-card border border-white/8 divide-y divide-white/5">
                  {stats.recentActivity.map((line: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                      <p className="text-xs text-zinc-400 font-mono">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </Layout>
  );
}

function BigStat({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string|number; bg: string }) {
  return (
    <div className={`rounded-2xl p-5 border ${bg}`}>
      <div className="mb-4">{icon}</div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium mt-1">{label}</p>
    </div>
  );
}
