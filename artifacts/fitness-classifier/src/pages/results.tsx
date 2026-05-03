import React from "react";
import { useLocation } from "wouter";
import { Activity, ChevronRight, BarChart, ActivitySquare, Move } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export default function Results() {
  const [, setLocation] = useLocation();
  const { lastResult } = useAppStore();

  if (!lastResult) {
    return (
      <Layout title="RESULTS" showBack>
        <div className="flex flex-col items-center justify-center h-[60vh] px-4 text-center">
          <ActivitySquare className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Recent Analysis</h2>
          <p className="text-muted-foreground mb-6">Complete a camera analysis to see your body metrics.</p>
          <Button onClick={() => setLocation("/")} variant="outline" className="border-white/10">
            Start Analysis
          </Button>
        </div>
      </Layout>
    );
  }

  const { bodyMetrics, recommendations, physiqueType } = lastResult;

  return (
    <Layout title="ANALYSIS RESULTS" showBack>
      <div className="p-4 max-w-md mx-auto space-y-6">
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
          
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">Detected Physique</p>
          <h2 className="text-3xl font-black capitalize tracking-tight text-white mb-4">{physiqueType}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <MetricCard label="Shoulder-Hip Ratio" value={bodyMetrics.shoulderHipRatio.toFixed(2)} />
            <MetricCard label="Torso-Leg Ratio" value={bodyMetrics.torsoLegRatio.toFixed(2)} />
            <MetricCard label="Symmetry Score" value={(bodyMetrics.symmetryScore * 100).toFixed(0)} unit="%" />
            <MetricCard label="Posture Score" value={(bodyMetrics.postureScore * 100).toFixed(0)} unit="%" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center">
            <BarChart className="w-4 h-4 mr-2 text-primary" />
            Key Recommendations
          </h3>
          <Card className="bg-card/40 border-white/5 backdrop-blur-sm">
            <CardContent className="p-0">
              <ul className="divide-y divide-white/5">
                {recommendations.map((rec, i) => (
                  <li key={i} className="p-4 flex items-start gap-3">
                    <div className="mt-0.5 min-w-5 flex justify-center text-primary font-mono text-sm">{i + 1}</div>
                    <p className="text-sm text-gray-300 leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Button 
          size="lg" 
          className="w-full h-14 bg-primary text-primary-foreground font-bold text-base mt-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          onClick={() => setLocation(`/workout?type=${physiqueType}`)}
        >
          <Activity className="w-5 h-5 mr-2" />
          Generate Workout Plan
          <ChevronRight className="w-5 h-5 ml-auto opacity-50" />
        </Button>
        
      </div>
    </Layout>
  );
}

function MetricCard({ label, value, unit = "" }: { label: string, value: string | number, unit?: string }) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 line-clamp-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-mono font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-muted-foreground font-mono">{unit}</span>}
      </div>
    </div>
  );
}
