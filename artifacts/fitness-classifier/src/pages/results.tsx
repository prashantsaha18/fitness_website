import { useLocation } from "wouter";
import { ChevronRight, RotateCcw, Activity, Scan } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAppStore } from "@/lib/store";

const typeStyle: Record<string, { color: string; glow: string; label: string }> = {
  athletic:   { color: "text-emerald-400", glow: "shadow-emerald-500/20", label: "Athletic" },
  skinny:     { color: "text-blue-400",    glow: "shadow-blue-500/20",    label: "Lean"     },
  overweight: { color: "text-amber-400",   glow: "shadow-amber-500/20",   label: "Bulky"    },
};

export default function Results() {
  const [, setLocation] = useLocation();
  const { lastResult } = useAppStore();

  if (!lastResult) {
    return (
      <Layout title="Results">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Scan className="w-7 h-7 text-zinc-600" />
          </div>
          <div>
            <p className="text-white font-semibold">No Analysis Yet</p>
            <p className="text-zinc-500 text-sm mt-1">Complete a scan to see your results.</p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
          >
            Start Scan
          </button>
        </div>
      </Layout>
    );
  }

  const { physiqueType, confidence, bodyMetrics, recommendations, probabilities } = lastResult;
  const style = typeStyle[physiqueType] ?? typeStyle.athletic;
  const confidencePct = Math.round(confidence * 100);

  const metrics = [
    { label: "Shoulder-Hip Ratio", value: bodyMetrics.shoulderHipRatio.toFixed(2) },
    { label: "Torso-Leg Ratio",    value: bodyMetrics.torsoLegRatio.toFixed(2) },
    { label: "Symmetry Score",     value: `${(bodyMetrics.symmetryScore * 100).toFixed(0)}%` },
    { label: "Posture Score",      value: `${(bodyMetrics.postureScore * 100).toFixed(0)}%` },
  ];

  return (
    <Layout title="Analysis Results">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        {/* Hero */}
        <div className="rounded-3xl bg-card border border-white/8 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-3">Detected Physique</p>
          <h2 className={`text-5xl font-black capitalize mb-2 ${style.color}`}>{physiqueType}</h2>

          {/* Confidence arc */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700" style={{ width: `${confidencePct}%` }} />
            </div>
            <span className="text-sm font-bold font-mono text-white">{confidencePct}%</span>
          </div>
          <p className="text-xs text-zinc-600 mt-1">Confidence</p>

          {/* Probabilities */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {Object.entries(probabilities).map(([type, prob]) => {
              const s = typeStyle[type] ?? typeStyle.athletic;
              return (
                <div key={type} className="rounded-xl bg-zinc-900 border border-white/6 p-3 text-center">
                  <p className={`text-lg font-black font-mono ${type === physiqueType ? s.color : "text-zinc-400"}`}>
                    {((prob as number) * 100).toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wide capitalize mt-0.5">{type}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body metrics */}
        <div>
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold px-1 mb-3">Body Metrics</p>
          <div className="grid grid-cols-2 gap-2.5">
            {metrics.map(m => (
              <div key={m.label} className="rounded-2xl bg-card border border-white/8 p-4">
                <p className="text-xs text-zinc-600 mb-1.5 leading-tight">{m.label}</p>
                <p className="text-2xl font-black font-mono text-white">{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations?.length > 0 && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold px-1 mb-3">Recommendations</p>
            <div className="rounded-2xl bg-card border border-white/8 divide-y divide-white/5">
              {recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex gap-3 p-4">
                  <span className="text-primary font-mono text-sm font-bold shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => setLocation("/")}
            className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/8 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-zinc-400" />
          </button>
          <button
            onClick={() => setLocation(`/workout?type=${physiqueType}`)}
            className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 active:scale-95"
          >
            <Activity className="w-5 h-5" />
            View Training Plan
            <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
          </button>
        </div>
      </div>
    </Layout>
  );
}
