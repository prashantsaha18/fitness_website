import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Dumbbell, Clock, Flame, Calendar, Info, RefreshCw } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetWorkoutPlan, GetWorkoutPlanGoal, GetWorkoutPlanFitnessLevel } from "@workspace/api-client-react";

export default function Workout() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialType = searchParams.get("type") || "athletic";

  const [physiqueType, setPhysiqueType] = useState<"athletic"|"skinny"|"overweight">(initialType as any);
  const [goal, setGoal] = useState<GetWorkoutPlanGoal>("general_fitness");
  const [level, setLevel] = useState<GetWorkoutPlanFitnessLevel>("intermediate");

  const { data: plan, isLoading, refetch, isFetching } = useGetWorkoutPlan(physiqueType, { 
    goal, 
    fitnessLevel: level 
  });

  return (
    <Layout title="TRAINING PROTOCOL">
      <div className="max-w-md mx-auto p-4 space-y-6">
        
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Physique</label>
              <Select value={physiqueType} onValueChange={(val: any) => setPhysiqueType(val)}>
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="skinny">Skinny</SelectItem>
                  <SelectItem value="overweight">Overweight</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Goal</label>
              <Select value={goal} onValueChange={(val: any) => setGoal(val)}>
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="fat_loss">Fat Loss</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Level</label>
              <Select value={level} onValueChange={(val: any) => setLevel(val)}>
                <SelectTrigger className="h-9 bg-black/40 border-white/10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="icon" variant="outline" className="h-9 w-9 shrink-0 border-white/10 bg-black/40" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 text-primary ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
          </div>
        ) : plan ? (
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="w-full grid grid-cols-2 bg-white/5 border border-white/5 rounded-lg h-12 p-1 mb-6">
              <TabsTrigger value="schedule" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold tracking-wider uppercase">Schedule</TabsTrigger>
              <TabsTrigger value="nutrition" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs font-bold tracking-wider uppercase">Nutrition</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="space-y-4 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {plan.weeklySchedule.map((day, idx) => (
                <Card key={idx} className={`bg-card/40 border-white/5 overflow-hidden ${day.restDay ? 'opacity-60' : ''}`}>
                  <div className={`h-1 w-full ${day.restDay ? 'bg-muted' : 'bg-primary'}`} />
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-sm font-bold tracking-wider uppercase text-white">{day.day}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 capitalize font-medium">{day.focus}</p>
                    </div>
                    {!day.restDay && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
                        {day.durationMinutes} MIN
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {day.restDay ? (
                      <div className="py-4 text-center border border-dashed border-white/10 rounded-lg bg-white/[0.02]">
                        <p className="text-xs text-muted-foreground font-medium">Active Recovery / Rest</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {day.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="flex gap-3 items-start border-l-2 border-white/10 pl-3 py-1">
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-gray-200">{ex.name}</h4>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
                                <span className="flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> {ex.sets}x{ex.reps}</span>
                                <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {ex.restSeconds}s</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-card/40 border-white/5">
                <CardHeader className="p-5 pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold tracking-wider uppercase flex items-center text-secondary">
                    <Flame className="w-4 h-4 mr-2" />
                    Nutrition Protocols
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <ul className="space-y-4">
                    {plan.nutritionTips.map((tip, i) => (
                      <li key={i} className="flex gap-3 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-white/5">
                <CardHeader className="p-5 pb-3 border-b border-white/5">
                  <CardTitle className="text-sm font-bold tracking-wider uppercase flex items-center text-primary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-5 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                    {plan.progressMilestones.map((ms, i) => (
                      <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-white/5 bg-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-xs">Week {ms.week}</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-200 mb-1">{ms.title}</h4>
                          <p className="text-xs text-muted-foreground">{ms.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
        
      </div>
    </Layout>
  );
}
