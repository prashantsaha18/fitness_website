import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Plus, TrendingUp, TrendingDown, Minus, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authHeaders } from "@/lib/auth-store";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Measurement {
  id: number; weight?: number; waist?: number; chest?: number;
  arms?: number; hips?: number; neck?: number; notes?: string; createdAt: string;
}

const FIELDS = [
  { key: "weight", label: "Weight", unit: "kg", icon: "⚖️" },
  { key: "waist",  label: "Waist",  unit: "cm", icon: "📏" },
  { key: "chest",  label: "Chest",  unit: "cm", icon: "💪" },
  { key: "arms",   label: "Arms",   unit: "cm", icon: "🦾" },
  { key: "hips",   label: "Hips",   unit: "cm", icon: "🏃" },
  { key: "neck",   label: "Neck",   unit: "cm", icon: "📐" },
];

export default function Measurements() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: rows = [], isLoading } = useQuery<Measurement[]>({
    queryKey: ["measurements"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/measurements`, { headers: authHeaders() });
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Record<string, number | undefined>) => {
      const r = await fetch(`${basePath}/api/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["measurements"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false); setForm({});
      toast({ title: "Measurements saved!" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const submit = () => {
    const payload: Record<string, number | undefined> = {};
    FIELDS.forEach(f => { const v = parseFloat(form[f.key]); if (!isNaN(v)) payload[f.key] = v; });
    if (form.notes) (payload as any).notes = form.notes;
    addMutation.mutate(payload);
  };

  const latest = rows[0];
  const prev   = rows[1];

  const trend = (key: string) => {
    if (!latest || !prev) return null;
    const a = (latest as any)[key], b = (prev as any)[key];
    if (a == null || b == null) return null;
    const diff = a - b;
    if (Math.abs(diff) < 0.05) return { dir: "flat", val: 0 };
    return { dir: diff > 0 ? "up" : "down", val: Math.abs(diff).toFixed(1) };
  };

  return (
    <Layout title="Body Measurements">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{rows.length} {rows.length === 1 ? "entry" : "entries"} logged</p>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Today
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl bg-card border border-white/8 p-4 space-y-3">
            <p className="text-sm font-bold text-white">Today's Measurements</p>
            <div className="grid grid-cols-2 gap-2.5">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1.5">{f.icon} {f.label} ({f.unit})</label>
                  <input
                    type="number" step="0.1"
                    value={form[f.key] || ""}
                    onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                    placeholder={f.key === "weight" ? "70" : "85"}
                    className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <input
              type="text"
              value={form.notes || ""}
              onChange={e => setForm(x => ({ ...x, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 py-2.5 rounded-xl border border-white/8 text-zinc-400 text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={submit} disabled={addMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}

        {isLoading && <div className="h-40 rounded-2xl skeleton" />}
        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Ruler className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No measurements yet. Log your first one!</p>
          </div>
        )}

        {latest && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3">
              Latest — {new Date(latest.createdAt).toLocaleDateString()}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FIELDS.map(f => {
                const val = (latest as any)[f.key];
                if (val == null) return null;
                const t = trend(f.key);
                const isWeightDown = f.key === "weight" && t?.dir === "down";
                const trendColor = !t || t.dir === "flat" ? "text-zinc-600"
                  : (isWeightDown || (f.key !== "weight" && t.dir === "up")) ? "text-emerald-400"
                  : "text-red-400";
                const TrendIcon = !t || t.dir === "flat" ? Minus : t.dir === "up" ? TrendingUp : TrendingDown;
                return (
                  <div key={f.key} className="rounded-2xl bg-card border border-white/8 p-3 text-center">
                    <p className="text-xs text-zinc-600 mb-1">{f.label}</p>
                    <p className="text-lg font-black text-white">{val}<span className="text-xs text-zinc-600 font-normal ml-0.5">{f.unit}</span></p>
                    {t && (
                      <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        {t.val !== 0 && <span>{t.val}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {rows.length > 1 && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3">History</p>
            <div className="space-y-2">
              {rows.slice(1).map(m => (
                <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-white/6">
                  <span className="text-sm text-zinc-500">{new Date(m.createdAt).toLocaleDateString()}</span>
                  <div className="flex gap-3 text-sm">
                    {m.weight && <span className="text-white font-medium">{m.weight}kg</span>}
                    {m.waist  && <span className="text-zinc-500">W:{m.waist}</span>}
                    {m.chest  && <span className="text-zinc-500">C:{m.chest}</span>}
                    {m.arms   && <span className="text-zinc-500">A:{m.arms}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
