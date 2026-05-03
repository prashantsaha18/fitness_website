import React from "react";
import { Activity, Users, Target, Zap } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stats() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <Layout title="GLOBAL STATS">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 bg-white/5 rounded-xl" />
              <Skeleton className="h-28 bg-white/5 rounded-xl" />
            </div>
            <Skeleton className="h-64 bg-white/5 rounded-xl" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={<Users className="w-5 h-5 text-primary" />}
                label="Total Scans"
                value={stats.totalClassifications}
              />
              <StatCard 
                icon={<Target className="w-5 h-5 text-secondary" />}
                label="Avg Confidence"
                value={`${(stats.averageConfidence * 100).toFixed(1)}%`}
              />
            </div>

            <Card className="bg-card/40 border-white/5 backdrop-blur-md">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-6 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-white" />
                  Physique Distribution
                </h3>
                
                <div className="space-y-5">
                  <DistributionBar 
                    label="Athletic" 
                    value={stats.breakdown.athletic} 
                    total={stats.totalClassifications} 
                    color="bg-primary" 
                  />
                  <DistributionBar 
                    label="Skinny" 
                    value={stats.breakdown.skinny} 
                    total={stats.totalClassifications} 
                    color="bg-secondary" 
                  />
                  <DistributionBar 
                    label="Overweight" 
                    value={stats.breakdown.overweight} 
                    total={stats.totalClassifications} 
                    color="bg-orange-500" 
                  />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase flex items-center px-1">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                Live Feed
              </h3>
              <div className="glass-panel rounded-xl overflow-hidden divide-y divide-white/5">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="p-3 px-4 text-xs font-mono text-gray-300 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col justify-between">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-white font-mono">{value}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

function DistributionBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono text-muted-foreground">{value} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
