import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Show } from "@clerk/react";
import { Layout } from "@/components/Layout";
import { Plus, Ruler, TrendingUp, TrendingDown, Minus, Lock } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Measurement {
  id: number;
  weight?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  hips?: number;
  neck?: number;
  notes?: string;
  createdAt: string;
}

const FIELDS = [
  { key: "weight", label: "Weight", unit: "kg", emoji: "⚖️" },
  { key: "waist", label: "Waist", unit: "cm", emoji: "📏" },
  { key: "chest", label: "Chest", unit: "cm", emoji: "💪" },
  { key: "arms", label: "Arms", unit: "cm", emoji: "🦾" },
  { key: "hips", label: "Hips", unit: "cm", emoji: "🏃" },
  { key: "neck", label: "Neck", unit: "cm", emoji: "📐" },
];

export default function Measurements() {
  return (
    <Layout title="Measurements" showBack backHref="/dashboard">
      <Show when="signed-in">
        <AuthedMeasurements />
      </Show>
      <Show when="signed-out">
        <AuthGate />
      </Show>
    </Layout>
  );
}

function AuthGate() {
  return (
    <div className="px-4 py-12 max-w-lg mx-auto text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8 text-zinc-500" />
      </div>
      <p className="text-zinc-300">Sign in to track your body measurements</p>
      <Link href="/sign-in" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Sign In
      </Link>
    </div>
  );
}

function AuthedMeasurements() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: measurements = [], isLoading } = useQuery<Measurement[]>({
    queryKey: ["measurements"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/measurements`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Record<string, number | undefined>) => {
      const r = await fetch(`${basePath}/api/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed to save");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["measurements"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false);
      setForm({});
      toast({ title: "Measurements saved!" });
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  function submit() {
    const payload: Record<string, number | undefined> = {};
    FIELDS.forEach(f => {
      const v = parseFloat(form[f.key]);
      if (!isNaN(v)) payload[f.key] = v;
    });
    addMutation.mutate(payload);
  }

  const latest = measurements[0];
  const prev = measurements[1];

  function trend(key: string) {
    if (!latest || !prev) return null;
    const a = (latest as any)[key];
    const b = (prev as any)[key];
    if (a == null || b == null) return null;
    const diff = a - b;
    if (Math.abs(diff) < 0.1) return { dir: "same", diff: 0 };
    return { dir: diff > 0 ? "up" : "down", diff: Math.abs(diff).toFixed(1) };
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm">{measurements.length} entries logged</p>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Log Today
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
          <p className="font-semibold text-white text-sm">Today's Measurements</p>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-400 mb-1">{f.emoji} {f.label} ({f.unit})</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={`e.g. ${f.key === "weight" ? "70" : "85"}`}
                  value={form[f.key] || ""}
                  onChange={e => setForm(x => ({ ...x, [f.key]: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={form.notes || ""}
            onChange={e => setForm(x => ({ ...x, notes: e.target.value }))}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary"
          />
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setForm({}); }} className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-400 text-sm hover:text-white transition-colors">Cancel</button>
            <button onClick={submit} disabled={addMutation.isPending} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {addMutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Latest snapshot */}
      {latest && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Latest — {new Date(latest.createdAt).toLocaleDateString()}</p>
          <div className="grid grid-cols-3 gap-2">
            {FIELDS.map(f => {
              const val = (latest as any)[f.key];
              const t = trend(f.key);
              if (val == null) return null;
              return (
                <div key={f.key} className="rounded-xl bg-card border border-white/10 p-3 text-center">
                  <p className="text-lg font-bold text-white">{val}<span className="text-xs text-zinc-500 ml-0.5">{f.unit}</span></p>
                  <p className="text-xs text-zinc-500">{f.label}</p>
                  {t && (
                    <div className={`flex items-center justify-center gap-0.5 mt-1 text-[10px] ${t.dir === "down" ? (f.key === "weight" ? "text-emerald-400" : "text-red-400") : t.dir === "up" ? (f.key === "weight" ? "text-amber-400" : "text-emerald-400") : "text-zinc-500"}`}>
                      {t.dir === "up" ? <TrendingUp className="w-3 h-3" /> : t.dir === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {t.diff !== 0 && <span>{t.diff}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History list */}
      {isLoading && <div className="text-center text-zinc-500 py-8">Loading…</div>}
      {!isLoading && measurements.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Ruler className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No measurements yet. Log your first one!</p>
        </div>
      )}
      {measurements.length > 1 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">History</p>
          <div className="space-y-2">
            {measurements.slice(1).map((m) => (
              <div key={m.id} className="rounded-xl bg-card border border-white/10 px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-zinc-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-3 text-sm">
                  {m.weight && <span className="text-white">{m.weight}kg</span>}
                  {m.waist && <span className="text-zinc-400">W:{m.waist}</span>}
                  {m.chest && <span className="text-zinc-400">C:{m.chest}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
