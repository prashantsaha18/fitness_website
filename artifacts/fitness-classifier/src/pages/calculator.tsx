import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Calculator as CalcIcon, Activity, Flame } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BMIResult {
  bmi: number;
  category: string;
  description: string;
  color: string;
}

interface TDEEResult {
  bmr: number;
  tdee: number;
  macros: {
    fat_loss: { calories: number; protein: number; carbs: number; fat: number };
    maintenance: { calories: number; protein: number; carbs: number; fat: number };
    muscle_gain: { calories: number; protein: number; carbs: number; fat: number };
  };
}

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little/no exercise" },
  { value: "light", label: "Light", desc: "1-3 days/week" },
  { value: "moderate", label: "Moderate", desc: "3-5 days/week" },
  { value: "active", label: "Active", desc: "6-7 days/week" },
  { value: "very_active", label: "Very Active", desc: "Hard exercise, physical job" },
];

export default function Calculator() {
  const [tab, setTab] = useState<"bmi" | "tdee">("bmi");
  const [form, setForm] = useState({ weight: "", height: "", age: "", gender: "male", activityLevel: "moderate" });
  const [bmiResult, setBmiResult] = useState<BMIResult | null>(null);
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeGoal, setActiveGoal] = useState<"fat_loss" | "maintenance" | "muscle_gain">("maintenance");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function calcBMI() {
    if (!form.weight || !form.height) return;
    setLoading(true);
    try {
      const r = await fetch(`${basePath}/api/calculator/bmi?weight=${form.weight}&height=${form.height}`);
      const data = await r.json();
      setBmiResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function calcTDEE() {
    if (!form.weight || !form.height || !form.age) return;
    setLoading(true);
    try {
      const r = await fetch(`${basePath}/api/calculator/tdee?weight=${form.weight}&height=${form.height}&age=${form.age}&gender=${form.gender}&activityLevel=${form.activityLevel}`);
      const data = await r.json();
      setTdeeResult(data);
    } finally {
      setLoading(false);
    }
  }

  const bmiPercent = bmiResult ? Math.min(100, Math.max(0, ((bmiResult.bmi - 15) / 25) * 100)) : 0;

  return (
    <Layout title="Calculator" showBack backHref="/dashboard">
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 bg-card">
          {(["bmi", "tdee"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}>
              {t === "bmi" ? "BMI Calculator" : "TDEE & Macros"}
            </button>
          ))}
        </div>

        {/* Shared Inputs */}
        <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Weight (kg)" value={form.weight} onChange={set("weight")} placeholder="70" type="number" />
            <InputField label="Height (cm)" value={form.height} onChange={set("height")} placeholder="175" type="number" />
          </div>
          {tab === "tdee" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Age" value={form.age} onChange={set("age")} placeholder="25" type="number" />
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Gender</label>
                  <select value={form.gender} onChange={set("gender")} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Activity Level</label>
                <div className="space-y-1.5">
                  {ACTIVITY_LEVELS.map(a => (
                    <button key={a.value} onClick={() => setForm(f => ({ ...f, activityLevel: a.value }))} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors ${form.activityLevel === a.value ? "border-primary bg-primary/10 text-white" : "border-zinc-700 text-zinc-400 hover:border-zinc-600"}`}>
                      <span className="text-sm font-medium">{a.label}</span>
                      <span className="text-xs text-zinc-500">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <button
            onClick={tab === "bmi" ? calcBMI : calcTDEE}
            disabled={loading || !form.weight || !form.height || (tab === "tdee" && !form.age)}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CalcIcon className="w-4 h-4" />}
            Calculate
          </button>
        </div>

        {/* BMI Result */}
        {tab === "bmi" && bmiResult && (
          <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-black text-white">{bmiResult.bmi}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: bmiResult.color }}>{bmiResult.category}</p>
                <p className="text-xs text-zinc-500">{bmiResult.description}</p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center" style={{ borderColor: bmiResult.color }}>
                <CalcIcon className="w-8 h-8" style={{ color: bmiResult.color }} />
              </div>
            </div>
            {/* BMI bar */}
            <div>
              <div className="h-3 rounded-full bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/4 bg-blue-500 rounded-l-full" />
                <div className="absolute inset-y-0 left-1/4 w-1/4 bg-emerald-500" />
                <div className="absolute inset-y-0 left-2/4 w-1/4 bg-amber-500" />
                <div className="absolute inset-y-0 right-0 w-1/4 bg-red-500 rounded-r-full" />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-zinc-900 shadow-lg transition-all" style={{ left: `calc(${bmiPercent}% - 6px)` }} />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div className="rounded-lg bg-zinc-800/50 p-2"><span className="block text-zinc-500">Healthy Range</span><span className="text-white font-medium">18.5 – 24.9</span></div>
              <div className="rounded-lg bg-zinc-800/50 p-2"><span className="block text-zinc-500">Your BMI</span><span className="text-white font-medium">{bmiResult.bmi}</span></div>
            </div>
          </div>
        )}

        {/* TDEE Result */}
        {tab === "tdee" && tdeeResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border border-white/10 p-4 text-center">
                <p className="text-xs text-zinc-500 mb-1">Base Metabolic Rate</p>
                <p className="text-3xl font-black text-white">{tdeeResult.bmr}</p>
                <p className="text-xs text-zinc-500">kcal/day</p>
              </div>
              <div className="rounded-2xl bg-primary/10 border border-primary/30 p-4 text-center">
                <p className="text-xs text-zinc-400 mb-1">Daily Calories (TDEE)</p>
                <p className="text-3xl font-black text-primary">{tdeeResult.tdee}</p>
                <p className="text-xs text-zinc-500">kcal/day</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Macro Plans</p>
              <div className="flex rounded-xl overflow-hidden border border-white/10 bg-card mb-3">
                {(["fat_loss", "maintenance", "muscle_gain"] as const).map(g => (
                  <button key={g} onClick={() => setActiveGoal(g)} className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeGoal === g ? "bg-primary text-white" : "text-zinc-400 hover:text-white"}`}>
                    {g === "fat_loss" ? "Cut" : g === "maintenance" ? "Maintain" : "Bulk"}
                  </button>
                ))}
              </div>
              <MacroCard data={tdeeResult.macros[activeGoal]} goal={activeGoal} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: any, placeholder?: string, type?: string }) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-primary" />
    </div>
  );
}

function MacroCard({ data, goal }: { data: any, goal: string }) {
  const colors = { fat_loss: "text-red-400", maintenance: "text-emerald-400", muscle_gain: "text-blue-400" };
  const goalLabel = goal === "fat_loss" ? "Fat Loss" : goal === "maintenance" ? "Maintenance" : "Muscle Gain";
  return (
    <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-white">{goalLabel} Plan</p>
        <div className="flex items-center gap-1">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className={`font-bold ${(colors as any)[goal]}`}>{data.calories} kcal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MacroItem label="Protein" value={data.protein} color="text-blue-400" bg="bg-blue-500/10" />
        <MacroItem label="Carbs" value={data.carbs} color="text-amber-400" bg="bg-amber-500/10" />
        <MacroItem label="Fat" value={data.fat} color="text-red-400" bg="bg-red-500/10" />
      </div>
    </div>
  );
}

function MacroItem({ label, value, color, bg }: { label: string, value: number, color: string, bg: string }) {
  return (
    <div className={`rounded-xl p-3 ${bg} text-center`}>
      <p className={`text-xl font-bold ${color}`}>{value}g</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
