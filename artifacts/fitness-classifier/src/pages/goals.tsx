import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Plus, CheckCircle2, Circle, Trophy, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sessionHeaders } from "@/lib/session";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Goal {
  id: number; goalType: string; title: string; targetValue?: number;
  currentValue?: number; unit?: string; deadline?: string; completed: boolean; createdAt: string;
}

const GOAL_TYPES = [
  { value: "weight",      label: "Weight",    emoji: "⚖️" },
  { value: "measurement", label: "Measure",   emoji: "📏" },
  { value: "workout",     label: "Workout",   emoji: "💪" },
  { value: "nutrition",   label: "Nutrition", emoji: "🥗" },
  { value: "physique",    label: "Physique",  emoji: "🏆" },
  { value: "custom",      label: "Custom",    emoji: "🎯" },
];

const emptyForm = { goalType: "weight", title: "", targetValue: "", currentValue: "", unit: "", deadline: "" };

export default function Goals() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/goals`, { headers: sessionHeaders() });
      if (!r.ok) throw new Error();
      return r.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      const r = await fetch(`${basePath}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...sessionHeaders() },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false); setForm(emptyForm);
      toast({ title: "Goal created!" });
    },
    onError: () => toast({ title: "Failed to create goal", variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const r = await fetch(`${basePath}/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...sessionHeaders() },
        body: JSON.stringify({ completed }),
      });
      if (!r.ok) throw new Error();
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const submit = () => {
    if (!form.title) return;
    const payload: any = { goalType: form.goalType, title: form.title };
    if (form.unit) payload.unit = form.unit;
    if (form.deadline) payload.deadline = form.deadline;
    if (form.targetValue) payload.targetValue = parseFloat(form.targetValue);
    if (form.currentValue) payload.currentValue = parseFloat(form.currentValue);
    addMutation.mutate(payload);
  };

  const active    = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <Layout title="Fitness Goals">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">{active.length} active · {completed.length} completed</p>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Goal
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl bg-card border border-white/8 p-4 space-y-3">
            <p className="text-sm font-bold text-white">New Goal</p>

            <div>
              <label className="block text-xs text-zinc-500 mb-2">Goal Type</label>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, goalType: t.value }))}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-center transition-colors ${form.goalType === t.value ? "border-primary bg-primary/10" : "border-white/8 hover:border-white/15"}`}
                  >
                    <span className="text-lg">{t.emoji}</span>
                    <span className="text-xs font-medium text-white">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Describe your goal…"
                className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "currentValue", label: "Current", ph: "80" },
                { key: "targetValue",  label: "Target",  ph: "75" },
                { key: "unit",         label: "Unit",    ph: "kg" },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
                  <input
                    type={key === "unit" ? "text" : "number"}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Deadline (optional)</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/8 text-zinc-400 text-sm hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={submit} disabled={!form.title || addMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {addMutation.isPending ? "Saving…" : "Create Goal"}
              </button>
            </div>
          </div>
        )}

        {isLoading && <div className="h-40 rounded-2xl skeleton" />}
        {!isLoading && goals.length === 0 && !showForm && (
          <div className="flex flex-col items-center py-16 gap-3">
            <Target className="w-10 h-10 text-zinc-700" />
            <p className="text-zinc-500 text-sm">No goals yet. Set your first goal!</p>
          </div>
        )}

        {active.length > 0 && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3">Active Goals</p>
            <div className="space-y-2">
              {active.map(g => (
                <GoalCard key={g.id} goal={g} onToggle={() => toggleMutation.mutate({ id: g.id, completed: true })} />
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold mb-3">Completed</p>
            <div className="space-y-2">
              {completed.map(g => (
                <GoalCard key={g.id} goal={g} onToggle={() => toggleMutation.mutate({ id: g.id, completed: false })} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function GoalCard({ goal, onToggle }: { goal: Goal; onToggle: () => void }) {
  const emoji = GOAL_TYPES.find(t => t.value === goal.goalType)?.emoji ?? "🎯";
  const progress = goal.targetValue && goal.currentValue != null
    ? Math.min(100, Math.max(0, (goal.currentValue / goal.targetValue) * 100))
    : null;

  return (
    <div className={`rounded-2xl border px-4 py-3.5 ${goal.completed ? "border-emerald-500/25 bg-emerald-500/5" : "border-white/8 bg-card"}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 flex-shrink-0 transition-colors">
          {goal.completed
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            : <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400 transition-colors" />
          }
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <p className={`font-semibold text-sm ${goal.completed ? "line-through text-zinc-600" : "text-white"}`}>{goal.title}</p>
            {goal.completed && <Trophy className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
          </div>

          {progress !== null && (
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-xs text-zinc-600">
                <span>{goal.currentValue}{goal.unit ? ` ${goal.unit}` : ""}</span>
                <span>{Math.round(progress)}%</span>
                <span>{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ""}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${goal.completed ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {goal.deadline && !goal.completed && (
            <p className="text-xs text-zinc-600 mt-1.5">Due {new Date(goal.deadline).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
