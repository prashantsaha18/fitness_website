import React from "react";
import { Clock, TrendingUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useGetHistory } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function History() {
  const { data: history, isLoading } = useGetHistory();

  return (
    <Layout title="HISTORY">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))
        ) : history?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No History Yet</h3>
            <p className="text-sm text-muted-foreground">Your scanned classifications will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history?.map((item, i) => (
              <div key={item.id} className="glass-panel p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="outline" className={`font-mono text-[10px] uppercase tracking-wider ${
                      item.physiqueType === 'athletic' ? 'text-primary border-primary/30 bg-primary/10' : 
                      item.physiqueType === 'overweight' ? 'text-orange-400 border-orange-400/30 bg-orange-400/10' : 
                      'text-secondary border-secondary/30 bg-secondary/10'
                    }`}>
                      {item.physiqueType}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-300">
                    <span>Conf: {(item.confidence * 100).toFixed(0)}%</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>Sym: {(item.bodyMetrics.symmetryScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-primary shadow-inner">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
