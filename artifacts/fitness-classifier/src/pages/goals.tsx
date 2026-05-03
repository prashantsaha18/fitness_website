import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Show } from "@clerk/react";
import { Layout } from "@/components/Layout";
import { Plus, Target, CheckCircle2, Circle, Lock, Trophy } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Goal {
  id: number;
  goalType: string;
  title: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

const GOAL_TYPES = [
  { value: "weight", label: "Weight Goal", emoji: "⚖️", examples: "Lose 5kg, Reach 75kg" },
  { value: "measurement", label: "Measurement", emoji: "📏", examples: "Waist under 80cm" },
  { value: "workout", label: "Workout Habit", emoji: "💪", examples: "Train 4x per week" },
  { value: "nutrition", label: "Nutrition", emoji: "🥗", examples: "Eat 150g protein/day" },
  { value: "physique", label: "Physique Goal", emoji: "🏆", examples: "Reach Athletic classification" },
  { value: "custom", label: "Custom Goal", emoji: "🎯", examples: "Anything you want" },
];

export default function Goals() {
  return (
    <Layout title="Goals" showBack backHref="/dashboard">
      <Show when="signed-in">
        <AuthedGoals />
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
      <p className="text-zinc-300">Sign in to set and track your fitness goals</p>
      <Link href="/sign-in" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Sign In
      </Link>
    </div>
  );
}

function AuthedGoals() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goalType: "weight", title: "", targetValue: "", currentValue: "", unit: "", deadline: "" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const r = await fetch(`${basePath}/api/goals`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      const r = await fetch(`${basePath}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("Failed to create goal");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false);
      setForm({ goalType: "weight", title: "", targetValue: "", currentValue: "", unit: "", deadline: "" });
      toast({ title: "Goal created!" });
    },
    onError: () => toast({ title: "Failed to create goal", variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const r = await fetch(`${basePath}/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed }),
      });
      if (!r.ok) throw new Error("Failed to update goal");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function submit() {
    if (!form.title) return;
    const payload: any = {
      goalType: form.goalType,
      title: form.title,
      unit: form.unit || undefined,
      deadline: form.deadline || undefined,
    };
    if (form.targetValue) payload.targetValue = parseFloat(form.targetValue);
    if (form.currentValue) payload.currentValue = parseFloat(form.currentValue);
    addMutation.mutate(payload);
  }

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);
  const selectedType = GOAL_TYPES.find(t => t.value === form.goalType);

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goal form */}
      {showForm && (
        <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
          <p className="font-semibold text-white text-sm">New Goal</p>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Goal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, goalType: t.value }))} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${form.goalType === t.value ? "border-primary bg-primary/10" : "border-zinc-700 hover:border-zinc-600"}`}>
                  <span>{t.emoji}</span>
                  <div>
                    <p className="text-xs font-medium text-white">{t.label}</p>
                  </div>
                </button>
              ))}
            </div>
            {selectedType && <p className="text-xs text-zinc-500 mt-1">e.g. {selectedType.examples}</p>}
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Goal Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={selectedType?.examples?.split(",")[0] || "Describe your goal"} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Current</label>
              <input type="number" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} placeholder="80" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Target</label>
              <input type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} placeholder="75" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Unit</label>
              <input type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Deadline (optional)</label>
            <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-zinc-400 text-sm hover:text-white transition-colors">Cancel</button>
            <button onClick={submit} disabled={!form.title || addMutation.isPending} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              {addMutation.isPending ? "Saving…" : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {isLoading && <div className="text-center text-zinc-500 py-8">Loading…</div>}

      {/* Active Goals */}
      {active.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Active Goals</p>
          <div className="space-y-2">
            {active.map(goal => <GoalCard key={goal.id} goal={goal} onToggle={() => completeMutation.mutate({ id: goal.id, completed: true })} />)}
          </div>
        </div>
      )}

      {active.length === 0 && !isLoading && !showForm && (
        <div className="text-center py-12 space-y-2">
          <Target className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">No active goals. Set your first goal!</p>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-3">Completed 🏆</p>
          <div className="space-y-2">
            {completed.map(goal => <GoalCard key={goal.id} goal={goal} onToggle={() => completeMutation.mutate({ id: goal.id, completed: false })} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onToggle }: { goal: Goal; onToggle: () => void }) {
  const emoji = GOAL_TYPES.find(t => t.value === goal.goalType)?.emoji || "🎯";
  const progress = goal.targetValue && goal.currentValue
    ? Math.min(100, Math.max(0, ((goal.currentValue / goal.targetValue) * 100)))
    : null;

  return (
    <div className={`rounded-xl border px-4 py-3 ${goal.completed ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-card"}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} className="mt-0.5 flex-shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors">
          {goal.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{emoji}</span>
            <p className={`font-medium text-sm ${goal.completed ? "line-through text-zinc-500" : "text-white"}`}>{goal.title}</p>
          </div>
          {goal.targetValue != null && goal.currentValue != null && (
            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Progress: {goal.currentValue}{goal.unit && ` ${goal.unit}`}</span>
                <span>Target: {goal.targetValue}{goal.unit && ` ${goal.unit}`}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {goal.deadline && (
            <p className="text-xs text-zinc-500 mt-1">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
          )}
        </div>
        {goal.completed && <Trophy className="w-4 h-4 text-amber-400 flex-shrink-0" />}
      </div>
    </div>
  );
}
