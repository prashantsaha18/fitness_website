import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Camera } from "lucide-react";
import { authHeaders } from "@/lib/auth-store";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Classification {
  id: number; physiqueType: string; confidence: number; bodyMetrics: any; createdAt: string;
}

const typeStyle: Record<string, { color: string; dot: string }> = {
  athletic:   { color: "text-emerald-400", dot: "bg-emerald-500" },
  skinny:     { color: "text-blue-400",    dot: "bg-blue-500"    },
  overweight: { color: "text-amber-400",   dot: "bg-amber-500"   },
};

export default function History() {
  const { data: rows = [], isLoading } = useQuery<Classification[]>({
    queryKey: ["history"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/history`, { headers: authHeaders() });
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  return (
    <Layout title="Scan History">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-3">
        {isLoading && (
          <div className="space-y-2">
            {[0,1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}
          </div>
        )}

        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Camera className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No scans yet. Start your first analysis!</p>
          </div>
        )}

        {rows.map(r => {
          const s = typeStyle[r.physiqueType] ?? typeStyle.athletic;
          return (
            <div key={r.id} className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-card border border-white/8">
              <div className={`w-3 h-3 rounded-full ${s.dot} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className={`font-bold capitalize ${s.color}`}>{r.physiqueType}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-white">{Math.round(r.confidence * 100)}%</p>
                <p className="text-[10px] text-zinc-600">confidence</p>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
