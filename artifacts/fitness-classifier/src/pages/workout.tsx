import { useState } from "react";
import { useSearch } from "wouter";
import { RefreshCw, Clock, Dumbbell, Flame } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useGetWorkoutPlan, GetWorkoutPlanGoal, GetWorkoutPlanFitnessLevel } from "@workspace/api-client-react";

const PHYSIQUE_OPTIONS = [
  { value: "athletic",   label: "Athletic" },
  { value: "skinny",     label: "Lean/Skinny" },
  { value: "overweight", label: "Bulky/Overweight" },
];
const GOAL_OPTIONS = [
  { value: "muscle_gain",    label: "Muscle Gain" },
  { value: "fat_loss",       label: "Fat Loss" },
  { value: "endurance",      label: "Endurance" },
  { value: "general_fitness",label: "General Fitness" },
];
const LEVEL_OPTIONS = [
  { value: "beginner",     label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced",     label: "Advanced" },
];

export default function Workout() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const init = (params.get("type") || "athletic") as any;

  const [physique, setPhysique] = useState<"athletic"|"skinny"|"overweight">(init);
  const [goal,     setGoal]     = useState<GetWorkoutPlanGoal>("general_fitness");
  const [level,    setLevel]    = useState<GetWorkoutPlanFitnessLevel>("intermediate");
  const [tab,      setTab]      = useState<"schedule"|"nutrition">("schedule");

  const { data: plan, isLoading, isFetching, refetch } = useGetWorkoutPlan(physique, { goal, fitnessLevel: level });

  return (
    <Layout title="Training Plan">
      <div className="px-4 pb-6 max-w-lg mx-auto space-y-4">

        {/* Selectors */}
        <div className="rounded-2xl bg-card border border-white/8 p-4 space-y-3">
          <SelectRow label="Physique" options={PHYSIQUE_OPTIONS} value={physique} onChange={setPhysique as any} />
          <SelectRow label="Goal"     options={GOAL_OPTIONS}     value={goal}     onChange={setGoal as any} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SelectRow label="Level" options={LEVEL_OPTIONS} value={level} onChange={setLevel as any} />
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="mb-0.5 w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[0,1,2].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
          </div>
        )}

        {/* Plan */}
        {plan && !isLoading && (
          <>
            {/* Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-white/8 bg-card">
              {(["schedule","nutrition"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${tab === t ? "bg-primary text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  {t === "schedule" ? "Schedule" : "Nutrition"}
                </button>
              ))}
            </div>

            {tab === "schedule" && (
              <div className="space-y-3">
                {plan.weeklySchedule.map((day: any, i: number) => (
                  <div key={i} className={`rounded-2xl border bg-card overflow-hidden ${day.restDay ? "border-white/5 opacity-60" : "border-white/8"}`}>
                    <div className={`h-0.5 w-full ${day.restDay ? "bg-zinc-800" : "bg-primary"}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-bold text-white text-sm uppercase tracking-wide">{day.day}</p>
                          <p className="text-xs text-zinc-500 capitalize mt-0.5">{day.focus}</p>
                        </div>
                        {!day.restDay && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                            <Clock className="w-3 h-3 text-primary" />
                            <span className="text-xs font-mono text-primary">{day.durationMinutes}m</span>
                          </div>
                        )}
                      </div>

                      {day.restDay ? (
                        <div className="mt-3 py-3 rounded-xl border border-dashed border-white/8 text-center">
                          <p className="text-xs text-zinc-600">Rest & Active Recovery</p>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2.5">
                          {day.exercises.map((ex: any, j: number) => (
                            <div key={j} className="flex gap-3 items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{ex.name}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-mono">
                                  <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" />{ex.sets}×{ex.reps}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ex.restSeconds}s rest</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "nutrition" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-card border border-white/8 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <p className="font-bold text-white text-sm">Nutrition Tips</p>
                  </div>
                  <ul className="space-y-3">
                    {plan.nutritionTips.map((tip: string, i: number) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-400 leading-relaxed">
                        <span className="text-primary font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.progressMilestones?.length > 0 && (
                  <div className="rounded-2xl bg-card border border-white/8 p-4">
                    <p className="font-bold text-white text-sm mb-4">Progress Milestones</p>
                    <div className="space-y-4 relative">
                      <div className="absolute left-3 top-2 bottom-2 w-px bg-white/8" />
                      {plan.progressMilestones.map((ms: any, i: number) => (
                        <div key={i} className="flex gap-4 pl-8 relative">
                          <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 border-primary bg-background -translate-x-1/2" />
                          <div>
                            <p className="text-xs text-primary font-mono font-bold">Week {ms.week}</p>
                            <p className="text-sm font-semibold text-white mt-0.5">{ms.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{ms.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

function SelectRow({ label, options, value, onChange }: { label: string; options: {value:string;label:string}[]; value: string; onChange: (v:string)=>void }) {
  return (
    <div>
      <label className="block text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-zinc-900 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
