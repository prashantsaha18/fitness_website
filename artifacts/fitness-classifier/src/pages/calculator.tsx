import { useState } from "react";
import { Calculator as CalcIcon, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { Layout } from "@/components/Layout";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const ACTIVITY = [
  { value: "sedentary",   label: "Sedentary",   desc: "Desk job, little exercise" },
  { value: "light",       label: "Light",        desc: "1-3 days / week" },
  { value: "moderate",    label: "Moderate",     desc: "3-5 days / week" },
  { value: "active",      label: "Active",       desc: "6-7 days / week" },
  { value: "very_active", label: "Very Active",  desc: "Hard training + physical job" },
];

const BMI_SCALE = [
  { label: "Under", max: 18.5, color: "#60a5fa" },
  { label: "Normal", max: 25,  color: "#34d399" },
  { label: "Over",   max: 30,  color: "#fbbf24" },
  { label: "Obese",  max: 50,  color: "#f87171" },
];

export default function Calculator() {
  const [tab,       setTab]       = useState<"bmi"|"tdee">("bmi");
  const [form,      setForm]      = useState({ weight: "", height: "", age: "", gender: "male", activity: "moderate" });
  const [bmi,       setBmi]       = useState<any>(null);
  const [tdee,      setTdee]      = useState<any>(null);
  const [loading,   setLoading]   = useState(false);
  const [goalTab,   setGoalTab]   = useState<"fat_loss"|"maintenance"|"muscle_gain">("maintenance");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const calc = async () => {
    if (!form.weight || !form.height) return;
    setLoading(true);
    try {
      if (tab === "bmi") {
        const r = await fetch(`${basePath}/api/calculator/bmi?weight=${form.weight}&height=${form.height}`);
        setBmi(await r.json());
      } else {
        if (!form.age) return;
        const q = `weight=${form.weight}&height=${form.height}&age=${form.age}&gender=${form.gender}&activityLevel=${form.activity}`;
        const r = await fetch(`${basePath}/api/calculator/tdee?${q}`);
        setTdee(await r.json());
      }
    } finally {
      setLoading(false);
    }
  };

  const bmiPct = bmi ? Math.min(98, Math.max(2, ((bmi.bmi - 10) / 35) * 100)) : 0;
  const canCalc = form.weight && form.height && (tab === "bmi" || form.age);

  return (
    <Layout title="Calculator">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-white/8 bg-card">
          {(["bmi","tdee"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === t ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {t === "bmi" ? "BMI Calculator" : "TDEE & Macros"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="rounded-2xl bg-card border border-white/8 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weight (kg)" value={form.weight} onChange={set("weight")} placeholder="70" />
            <Field label="Height (cm)" value={form.height} onChange={set("height")} placeholder="175" />
          </div>

          {tab === "tdee" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age" value={form.age} onChange={set("age")} placeholder="25" />
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Gender</label>
                  <select value={form.gender} onChange={set("gender")} className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-2 font-medium">Activity Level</label>
                <div className="space-y-1.5">
                  {ACTIVITY.map(a => (
                    <button
                      key={a.value}
                      onClick={() => setForm(f => ({ ...f, activity: a.value }))}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${form.activity === a.value ? "border-primary bg-primary/10" : "border-white/8 hover:border-white/15"}`}
                    >
                      <span className={`text-sm font-semibold ${form.activity === a.value ? "text-white" : "text-zinc-400"}`}>{a.label}</span>
                      <span className="text-xs text-zinc-600">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={calc}
            disabled={loading || !canCalc}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calculating…</>
              : <><CalcIcon className="w-4 h-4" /> Calculate</>
            }
          </button>
        </div>

        {/* BMI result */}
        {tab === "bmi" && bmi && (
          <div className="rounded-2xl bg-card border border-white/8 p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-black text-white">{bmi.bmi}</p>
                <p className="text-sm font-bold mt-1" style={{ color: bmi.color }}>{bmi.category}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{bmi.description}</p>
              </div>
              <div className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center" style={{ borderColor: bmi.color + "60" }}>
                <span className="text-3xl font-black" style={{ color: bmi.color }}>{bmi.bmi}</span>
              </div>
            </div>

            {/* BMI gradient bar */}
            <div>
              <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-zinc-900 shadow-lg"
                  style={{ left: `calc(${bmiPct}% - 8px)` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-600 mt-1.5">
                {BMI_SCALE.map(s => <span key={s.label}>{s.label}</span>)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-zinc-900 p-3">
                <p className="text-xs text-zinc-600">Healthy Range</p>
                <p className="text-sm font-bold text-white mt-0.5">18.5 – 24.9</p>
              </div>
              <div className="rounded-xl bg-zinc-900 p-3">
                <p className="text-xs text-zinc-600">Your BMI</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: bmi.color }}>{bmi.bmi}</p>
              </div>
            </div>
          </div>
        )}

        {/* TDEE result */}
        {tab === "tdee" && tdee && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border border-white/8 p-4 text-center">
                <p className="text-xs text-zinc-600 mb-2">Base Metabolic Rate</p>
                <p className="text-3xl font-black text-white">{tdee.bmr}</p>
                <p className="text-xs text-zinc-600 mt-0.5">kcal/day</p>
              </div>
              <div className="rounded-2xl bg-primary/8 border border-primary/20 p-4 text-center">
                <p className="text-xs text-zinc-500 mb-2">Total Daily Energy</p>
                <p className="text-3xl font-black text-primary">{tdee.tdee}</p>
                <p className="text-xs text-zinc-600 mt-0.5">kcal/day</p>
              </div>
            </div>

            {/* Goal selector */}
            <div className="flex rounded-xl overflow-hidden border border-white/8 bg-card">
              {(["fat_loss","maintenance","muscle_gain"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGoalTab(g)}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${goalTab === g ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {g === "fat_loss" ? "Cut" : g === "maintenance" ? "Maintain" : "Bulk"}
                </button>
              ))}
            </div>

            <MacroPlan data={tdee.macros[goalTab]} goal={goalTab} />
          </div>
        )}
      </div>
    </Layout>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: any; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs text-zinc-500 mb-1.5 font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}

function MacroPlan({ data, goal }: { data: any; goal: string }) {
  const goalColors: Record<string, string> = { fat_loss: "text-red-400", maintenance: "text-emerald-400", muscle_gain: "text-blue-400" };
  const goalLabel = goal === "fat_loss" ? "Fat Loss" : goal === "maintenance" ? "Maintenance" : "Muscle Gain";

  return (
    <div className="rounded-2xl bg-card border border-white/8 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-white">{goalLabel}</p>
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className={`font-bold text-sm ${goalColors[goal]}`}>{data.calories} kcal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <MacroTile icon={<Beef className="w-3.5 h-3.5" />} label="Protein" value={data.protein} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/20" />
        <MacroTile icon={<Wheat className="w-3.5 h-3.5" />} label="Carbs"   value={data.carbs}   color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
        <MacroTile icon={<Droplets className="w-3.5 h-3.5" />} label="Fat" value={data.fat}     color="text-red-400"   bg="bg-red-500/10 border-red-500/20" />
      </div>
    </div>
  );
}

function MacroTile({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`rounded-xl p-3 border text-center ${bg}`}>
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>{icon}</div>
      <p className={`text-xl font-black ${color}`}>{value}g</p>
      <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
    </div>
  );
}
