export type PhysiqueType = "athletic" | "skinny" | "overweight";
export type Goal = "muscle_gain" | "fat_loss" | "endurance" | "flexibility" | "general_fitness";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  description: string;
  muscleGroups: string[];
  difficulty: Level;
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
  durationMinutes: number;
  restDay: boolean;
}

export interface WorkoutPlan {
  physiqueType: PhysiqueType;
  goal: Goal;
  fitnessLevel: Level;
  weeklySchedule: DayPlan[];
  nutritionTips: string[];
  progressMilestones: Array<{ week: number; title: string; description: string }>;
}

const SCHEDULES: Record<PhysiqueType, Record<Level, DayPlan[]>> = {
  skinny: {
    beginner: [
      { day: "Monday", focus: "Upper Body Strength", restDay: false, durationMinutes: 45, exercises: [
        { name: "Push-Ups", sets: 3, reps: "8-12", restSeconds: 90, description: "Standard push-ups, keep core tight", muscleGroups: ["chest","shoulders","triceps"], difficulty: "beginner" },
        { name: "Dumbbell Rows", sets: 3, reps: "10", restSeconds: 90, description: "Bent-over row with light dumbbell", muscleGroups: ["back","biceps"], difficulty: "beginner" },
        { name: "Overhead Press", sets: 3, reps: "8-10", restSeconds: 90, description: "Seated dumbbell press overhead", muscleGroups: ["shoulders","triceps"], difficulty: "beginner" },
      ]},
      { day: "Tuesday", focus: "Active Recovery", restDay: true, durationMinutes: 30, exercises: [
        { name: "Light Walking", sets: 1, reps: "20 min", restSeconds: 0, description: "Easy-paced walking", muscleGroups: ["cardiovascular"], difficulty: "beginner" },
        { name: "Stretching", sets: 1, reps: "10 min", restSeconds: 0, description: "Full-body stretch routine", muscleGroups: ["flexibility"], difficulty: "beginner" },
      ]},
      { day: "Wednesday", focus: "Lower Body Strength", restDay: false, durationMinutes: 45, exercises: [
        { name: "Goblet Squat", sets: 3, reps: "10-12", restSeconds: 90, description: "Squat holding a dumbbell at chest", muscleGroups: ["quads","glutes","core"], difficulty: "beginner" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", restSeconds: 90, description: "Hinge at hips keeping back straight", muscleGroups: ["hamstrings","glutes"], difficulty: "beginner" },
        { name: "Walking Lunges", sets: 3, reps: "12 each", restSeconds: 75, description: "Controlled forward lunges", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Friday", focus: "Full Body Compound", restDay: false, durationMinutes: 50, exercises: [
        { name: "Deadlift", sets: 3, reps: "6-8", restSeconds: 120, description: "Full deadlift with controlled form", muscleGroups: ["back","glutes","hamstrings"], difficulty: "beginner" },
        { name: "Bench Press", sets: 3, reps: "8-10", restSeconds: 90, description: "Barbell or dumbbell bench press", muscleGroups: ["chest","shoulders","triceps"], difficulty: "beginner" },
        { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 90, description: "Cable pulldown to chest", muscleGroups: ["back","biceps"], difficulty: "beginner" },
      ]},
      { day: "Saturday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Sunday", focus: "Core & Mobility", restDay: false, durationMinutes: 30, exercises: [
        { name: "Plank", sets: 3, reps: "30-45s", restSeconds: 60, description: "Hold straight body position", muscleGroups: ["core","shoulders"], difficulty: "beginner" },
        { name: "Bird Dog", sets: 3, reps: "12 each side", restSeconds: 45, description: "Opposite arm/leg extension from all-fours", muscleGroups: ["core","back"], difficulty: "beginner" },
        { name: "Hip Flexor Stretch", sets: 1, reps: "60s each", restSeconds: 0, description: "Kneeling hip flexor stretch", muscleGroups: ["hip flexors"], difficulty: "beginner" },
      ]},
    ],
    intermediate: [
      { day: "Monday", focus: "Push Day", restDay: false, durationMinutes: 60, exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: "6-8", restSeconds: 120, description: "Heavy chest press with barbell", muscleGroups: ["chest","shoulders","triceps"], difficulty: "intermediate" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", restSeconds: 90, description: "Incline press for upper chest", muscleGroups: ["chest","shoulders"], difficulty: "intermediate" },
        { name: "Cable Lateral Raises", sets: 4, reps: "15", restSeconds: 60, description: "Cable lateral raises for shoulder width", muscleGroups: ["shoulders"], difficulty: "intermediate" },
        { name: "Tricep Pushdown", sets: 3, reps: "12-15", restSeconds: 60, description: "Cable pushdown for tricep isolation", muscleGroups: ["triceps"], difficulty: "intermediate" },
      ]},
      { day: "Tuesday", focus: "Pull Day", restDay: false, durationMinutes: 60, exercises: [
        { name: "Weighted Pull-Ups", sets: 4, reps: "6-8", restSeconds: 120, description: "Pull-ups with added weight", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Barbell Rows", sets: 4, reps: "8-10", restSeconds: 90, description: "Bent-over barbell row", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Face Pulls", sets: 3, reps: "15", restSeconds: 60, description: "Cable face pulls for rear delts", muscleGroups: ["shoulders","back"], difficulty: "intermediate" },
        { name: "Barbell Curl", sets: 3, reps: "10-12", restSeconds: 60, description: "Standing barbell curl", muscleGroups: ["biceps"], difficulty: "intermediate" },
      ]},
      { day: "Wednesday", focus: "Legs", restDay: false, durationMinutes: 65, exercises: [
        { name: "Back Squat", sets: 4, reps: "6-8", restSeconds: 120, description: "Heavy barbell back squat", muscleGroups: ["quads","glutes","core"], difficulty: "intermediate" },
        { name: "Leg Press", sets: 3, reps: "10-12", restSeconds: 90, description: "Leg press machine", muscleGroups: ["quads","glutes"], difficulty: "intermediate" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", restSeconds: 90, description: "Heavy RDL for hamstrings", muscleGroups: ["hamstrings","glutes"], difficulty: "intermediate" },
        { name: "Calf Raises", sets: 4, reps: "20", restSeconds: 45, description: "Standing or seated calf raises", muscleGroups: ["calves"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Friday", focus: "Push Day (Variation)", restDay: false, durationMinutes: 60, exercises: [
        { name: "Overhead Press", sets: 4, reps: "6-8", restSeconds: 120, description: "Standing barbell overhead press", muscleGroups: ["shoulders","triceps"], difficulty: "intermediate" },
        { name: "Dumbbell Flyes", sets: 3, reps: "12-15", restSeconds: 75, description: "Chest flyes for stretch", muscleGroups: ["chest"], difficulty: "intermediate" },
        { name: "Arnold Press", sets: 3, reps: "10-12", restSeconds: 75, description: "Rotational shoulder press", muscleGroups: ["shoulders"], difficulty: "intermediate" },
      ]},
      { day: "Saturday", focus: "Pull Day (Variation)", restDay: false, durationMinutes: 55, exercises: [
        { name: "Cable Rows", sets: 4, reps: "10-12", restSeconds: 90, description: "Seated cable row", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 75, description: "Wide grip lat pulldown", muscleGroups: ["back","biceps"], difficulty: "beginner" },
        { name: "Hammer Curls", sets: 3, reps: "12", restSeconds: 60, description: "Neutral grip bicep curl", muscleGroups: ["biceps","forearms"], difficulty: "beginner" },
      ]},
      { day: "Sunday", focus: "Active Recovery", restDay: true, durationMinutes: 30, exercises: [
        { name: "Foam Rolling", sets: 1, reps: "15 min", restSeconds: 0, description: "Full body foam rolling for recovery", muscleGroups: ["recovery"], difficulty: "beginner" },
        { name: "Yoga Stretching", sets: 1, reps: "15 min", restSeconds: 0, description: "Targeted flexibility work", muscleGroups: ["flexibility"], difficulty: "beginner" },
      ]},
    ],
    advanced: [
      { day: "Monday", focus: "Heavy Compound - Chest/Shoulders", restDay: false, durationMinutes: 75, exercises: [
        { name: "Barbell Bench Press", sets: 5, reps: "3-5", restSeconds: 180, description: "Max strength barbell bench", muscleGroups: ["chest","shoulders","triceps"], difficulty: "advanced" },
        { name: "Weighted Dips", sets: 4, reps: "8-10", restSeconds: 120, description: "Parallel bar dips with added weight", muscleGroups: ["chest","triceps"], difficulty: "advanced" },
        { name: "Military Press", sets: 4, reps: "5-7", restSeconds: 120, description: "Standing strict overhead press", muscleGroups: ["shoulders","triceps"], difficulty: "advanced" },
        { name: "Cable Crossover", sets: 3, reps: "15", restSeconds: 60, description: "High cable chest crossover", muscleGroups: ["chest"], difficulty: "intermediate" },
      ]},
      { day: "Tuesday", focus: "Heavy Pull - Back/Biceps", restDay: false, durationMinutes: 75, exercises: [
        { name: "Deadlift", sets: 5, reps: "3-5", restSeconds: 180, description: "Max strength conventional deadlift", muscleGroups: ["back","glutes","hamstrings"], difficulty: "advanced" },
        { name: "Weighted Pull-Ups", sets: 4, reps: "6-8", restSeconds: 120, description: "Pull-ups with heavy belt weight", muscleGroups: ["back","biceps"], difficulty: "advanced" },
        { name: "Pendlay Row", sets: 4, reps: "6-8", restSeconds: 120, description: "Strict barbell row from floor", muscleGroups: ["back","biceps"], difficulty: "advanced" },
        { name: "Drag Curls", sets: 3, reps: "10-12", restSeconds: 75, description: "Bicep drag curl variation", muscleGroups: ["biceps"], difficulty: "intermediate" },
      ]},
      { day: "Wednesday", focus: "Legs - Quad Focus", restDay: false, durationMinutes: 80, exercises: [
        { name: "Back Squat", sets: 5, reps: "3-5", restSeconds: 180, description: "Heavy barbell back squat", muscleGroups: ["quads","glutes"], difficulty: "advanced" },
        { name: "Front Squat", sets: 3, reps: "6-8", restSeconds: 120, description: "Front-loaded squat for quads", muscleGroups: ["quads","core"], difficulty: "advanced" },
        { name: "Hack Squat", sets: 3, reps: "10-12", restSeconds: 90, description: "Machine hack squat", muscleGroups: ["quads"], difficulty: "intermediate" },
        { name: "Leg Extension", sets: 3, reps: "15", restSeconds: 60, description: "Isolation for quad definition", muscleGroups: ["quads"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Active Recovery / Mobility", restDay: true, durationMinutes: 40, exercises: [
        { name: "Yoga Flow", sets: 1, reps: "20 min", restSeconds: 0, description: "Sun salutation and deep stretch", muscleGroups: ["flexibility","recovery"], difficulty: "beginner" },
        { name: "Band Activation", sets: 2, reps: "15 each", restSeconds: 30, description: "Hip, shoulder activation drills", muscleGroups: ["activation"], difficulty: "beginner" },
      ]},
      { day: "Friday", focus: "Hypertrophy Upper", restDay: false, durationMinutes: 70, exercises: [
        { name: "Incline Smith Press", sets: 4, reps: "8-12", restSeconds: 90, description: "Upper chest focus on Smith machine", muscleGroups: ["chest","shoulders"], difficulty: "intermediate" },
        { name: "Cable Pullover", sets: 4, reps: "12-15", restSeconds: 75, description: "Cable lat pullover for stretch", muscleGroups: ["back","chest"], difficulty: "intermediate" },
        { name: "Superset: Curl + Pushdown", sets: 4, reps: "12 each", restSeconds: 60, description: "Bicep curl superset with tricep pushdown", muscleGroups: ["biceps","triceps"], difficulty: "intermediate" },
      ]},
      { day: "Saturday", focus: "Legs - Posterior Chain", restDay: false, durationMinutes: 75, exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "8-10", restSeconds: 120, description: "Heavy RDL for hamstring hypertrophy", muscleGroups: ["hamstrings","glutes"], difficulty: "advanced" },
        { name: "Glute Ham Raise", sets: 3, reps: "10-12", restSeconds: 90, description: "GHD machine for posterior chain", muscleGroups: ["hamstrings","glutes"], difficulty: "advanced" },
        { name: "Seated Leg Curl", sets: 3, reps: "15", restSeconds: 60, description: "Isolation hamstring curl", muscleGroups: ["hamstrings"], difficulty: "beginner" },
        { name: "Standing Calf Raises", sets: 5, reps: "20-25", restSeconds: 45, description: "High-volume calf work", muscleGroups: ["calves"], difficulty: "beginner" },
      ]},
      { day: "Sunday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
    ],
  },
  athletic: {
    beginner: [
      { day: "Monday", focus: "Power & Strength", restDay: false, durationMinutes: 55, exercises: [
        { name: "Barbell Squat", sets: 4, reps: "6-8", restSeconds: 120, description: "Heavy back squat with full range", muscleGroups: ["quads","glutes","core"], difficulty: "intermediate" },
        { name: "Pull-Ups", sets: 4, reps: "8-12", restSeconds: 90, description: "Weighted or bodyweight pull-ups", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Dips", sets: 3, reps: "10-15", restSeconds: 90, description: "Tricep dips on parallel bars", muscleGroups: ["chest","triceps","shoulders"], difficulty: "intermediate" },
      ]},
      { day: "Tuesday", focus: "Cardio & Agility", restDay: false, durationMinutes: 45, exercises: [
        { name: "Interval Running", sets: 6, reps: "400m", restSeconds: 90, description: "Sprint 400m at 80% effort", muscleGroups: ["cardiovascular","legs"], difficulty: "intermediate" },
        { name: "Box Jumps", sets: 4, reps: "8", restSeconds: 60, description: "Explosive jump onto box", muscleGroups: ["quads","glutes","calves"], difficulty: "intermediate" },
      ]},
      { day: "Wednesday", focus: "Rest & Recovery", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Thursday", focus: "Upper Body Hypertrophy", restDay: false, durationMinutes: 55, exercises: [
        { name: "Incline Bench Press", sets: 4, reps: "8-12", restSeconds: 90, description: "Incline press for upper chest", muscleGroups: ["chest","shoulders"], difficulty: "intermediate" },
        { name: "Cable Rows", sets: 4, reps: "10-12", restSeconds: 90, description: "Seated cable row for mid-back", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Lateral Raises", sets: 3, reps: "15", restSeconds: 60, description: "Dumbbell lateral raises", muscleGroups: ["shoulders"], difficulty: "beginner" },
      ]},
      { day: "Friday", focus: "Lower Body Power", restDay: false, durationMinutes: 50, exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "8", restSeconds: 120, description: "Heavy RDL for hamstring development", muscleGroups: ["hamstrings","glutes"], difficulty: "intermediate" },
        { name: "Leg Press", sets: 4, reps: "12-15", restSeconds: 90, description: "High-foot leg press", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Calf Raises", sets: 4, reps: "20", restSeconds: 60, description: "Standing calf raises", muscleGroups: ["calves"], difficulty: "beginner" },
      ]},
      { day: "Saturday", focus: "Sport Performance", restDay: false, durationMinutes: 40, exercises: [
        { name: "Plyometric Circuit", sets: 3, reps: "5 exercises", restSeconds: 60, description: "Jump squats, burpees, mountain climbers", muscleGroups: ["full body"], difficulty: "intermediate" },
        { name: "Agility Ladder", sets: 4, reps: "30s", restSeconds: 45, description: "Quick feet ladder drills", muscleGroups: ["cardiovascular","coordination"], difficulty: "intermediate" },
      ]},
      { day: "Sunday", focus: "Mobility & Recovery", restDay: true, durationMinutes: 35, exercises: [
        { name: "Yoga Flow", sets: 1, reps: "20 min", restSeconds: 0, description: "Sun salutation flow sequence", muscleGroups: ["flexibility","balance"], difficulty: "beginner" },
        { name: "Foam Rolling", sets: 1, reps: "15 min", restSeconds: 0, description: "Full body foam rolling", muscleGroups: ["recovery"], difficulty: "beginner" },
      ]},
    ],
    intermediate: [
      { day: "Monday", focus: "Strength - Lower", restDay: false, durationMinutes: 70, exercises: [
        { name: "Back Squat", sets: 5, reps: "5", restSeconds: 180, description: "5x5 strength protocol", muscleGroups: ["quads","glutes"], difficulty: "intermediate" },
        { name: "Romanian Deadlift", sets: 4, reps: "8", restSeconds: 120, description: "Posterior chain focus", muscleGroups: ["hamstrings","glutes"], difficulty: "intermediate" },
        { name: "Box Jumps", sets: 4, reps: "6", restSeconds: 90, description: "Explosive power development", muscleGroups: ["quads","calves"], difficulty: "intermediate" },
      ]},
      { day: "Tuesday", focus: "HIIT & Conditioning", restDay: false, durationMinutes: 50, exercises: [
        { name: "Sprint Intervals", sets: 8, reps: "200m", restSeconds: 60, description: "All-out sprints", muscleGroups: ["cardiovascular","legs"], difficulty: "intermediate" },
        { name: "Battle Ropes", sets: 5, reps: "30s", restSeconds: 30, description: "Continuous rope waves", muscleGroups: ["shoulders","cardiovascular"], difficulty: "intermediate" },
      ]},
      { day: "Wednesday", focus: "Strength - Upper Push", restDay: false, durationMinutes: 65, exercises: [
        { name: "Bench Press 5x5", sets: 5, reps: "5", restSeconds: 180, description: "Strength-focused bench press", muscleGroups: ["chest","shoulders","triceps"], difficulty: "intermediate" },
        { name: "Military Press", sets: 4, reps: "6-8", restSeconds: 120, description: "Strict overhead press", muscleGroups: ["shoulders","triceps"], difficulty: "intermediate" },
        { name: "Weighted Dips", sets: 3, reps: "10", restSeconds: 90, description: "Dips with added load", muscleGroups: ["chest","triceps"], difficulty: "intermediate" },
      ]},
      { day: "Thursday", focus: "Active Recovery", restDay: true, durationMinutes: 35, exercises: [
        { name: "Swimming", sets: 1, reps: "30 min", restSeconds: 0, description: "Easy swim for active recovery", muscleGroups: ["full body","cardiovascular"], difficulty: "beginner" },
      ]},
      { day: "Friday", focus: "Strength - Upper Pull", restDay: false, durationMinutes: 65, exercises: [
        { name: "Weighted Pull-Ups 5x5", sets: 5, reps: "5", restSeconds: 180, description: "Max strength pull-ups", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Pendlay Row", sets: 4, reps: "6-8", restSeconds: 120, description: "Explosive barbell row", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
      ]},
      { day: "Saturday", focus: "Agility & Sport", restDay: false, durationMinutes: 55, exercises: [
        { name: "Cone Drills", sets: 5, reps: "45s", restSeconds: 60, description: "Lateral shuffle, plant and cut patterns", muscleGroups: ["legs","coordination"], difficulty: "intermediate" },
        { name: "Medicine Ball Throws", sets: 4, reps: "10", restSeconds: 60, description: "Rotational power throws", muscleGroups: ["core","shoulders"], difficulty: "intermediate" },
        { name: "Hill Sprints", sets: 6, reps: "40m", restSeconds: 90, description: "Uphill sprints for power", muscleGroups: ["cardiovascular","legs"], difficulty: "intermediate" },
      ]},
      { day: "Sunday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
    ],
    advanced: [
      { day: "Monday", focus: "Max Strength Lower", restDay: false, durationMinutes: 90, exercises: [
        { name: "Squat 5-3-1", sets: 5, reps: "1-3", restSeconds: 240, description: "Near-max effort squat work", muscleGroups: ["quads","glutes","core"], difficulty: "advanced" },
        { name: "Deadlift Singles", sets: 3, reps: "1", restSeconds: 300, description: "Heavy single deadlifts", muscleGroups: ["back","glutes","hamstrings"], difficulty: "advanced" },
        { name: "Depth Jumps", sets: 5, reps: "5", restSeconds: 120, description: "Step off box, immediately jump", muscleGroups: ["quads","calves"], difficulty: "advanced" },
      ]},
      { day: "Tuesday", focus: "Power Endurance", restDay: false, durationMinutes: 70, exercises: [
        { name: "Barbell Complex", sets: 5, reps: "6 exercises x6", restSeconds: 120, description: "Row, hang clean, press, squat, RDL, row without setting bar down", muscleGroups: ["full body"], difficulty: "advanced" },
        { name: "Heavy Sled Push", sets: 4, reps: "20m", restSeconds: 90, description: "Max-load sled drive", muscleGroups: ["legs","cardiovascular"], difficulty: "advanced" },
      ]},
      { day: "Wednesday", focus: "Max Strength Upper", restDay: false, durationMinutes: 85, exercises: [
        { name: "Bench 5-3-1", sets: 5, reps: "1-3", restSeconds: 240, description: "Max effort bench work", muscleGroups: ["chest","shoulders","triceps"], difficulty: "advanced" },
        { name: "Weighted Pull-Up Singles", sets: 3, reps: "1", restSeconds: 240, description: "Near-max weighted pull-up", muscleGroups: ["back","biceps"], difficulty: "advanced" },
        { name: "Push Press", sets: 4, reps: "4-6", restSeconds: 120, description: "Leg-drive assisted overhead press", muscleGroups: ["shoulders","triceps","legs"], difficulty: "advanced" },
      ]},
      { day: "Thursday", focus: "Recovery Swim + Mobility", restDay: true, durationMinutes: 50, exercises: [
        { name: "Pool Swim", sets: 1, reps: "30 min", restSeconds: 0, description: "Low-impact recovery swim", muscleGroups: ["full body","cardiovascular"], difficulty: "beginner" },
        { name: "PNF Stretching", sets: 1, reps: "20 min", restSeconds: 0, description: "Proprioceptive neuromuscular facilitation stretching", muscleGroups: ["flexibility"], difficulty: "intermediate" },
      ]},
      { day: "Friday", focus: "Olympic Lift Day", restDay: false, durationMinutes: 80, exercises: [
        { name: "Power Clean", sets: 5, reps: "3", restSeconds: 180, description: "Explosive clean from floor to rack", muscleGroups: ["full body","power"], difficulty: "advanced" },
        { name: "Hang Snatch", sets: 5, reps: "3", restSeconds: 180, description: "Snatch from hang position", muscleGroups: ["full body","power"], difficulty: "advanced" },
        { name: "Clean Pull", sets: 3, reps: "5", restSeconds: 120, description: "Triple extension pull for speed", muscleGroups: ["back","legs"], difficulty: "advanced" },
      ]},
      { day: "Saturday", focus: "Sport-Specific Conditioning", restDay: false, durationMinutes: 75, exercises: [
        { name: "10-20-30 Run", sets: 4, reps: "3 rounds", restSeconds: 120, description: "10m jog, 20m stride, 30m sprint", muscleGroups: ["cardiovascular","legs"], difficulty: "advanced" },
        { name: "Reactive Agility Drills", sets: 6, reps: "45s", restSeconds: 60, description: "Partner-reactive direction change", muscleGroups: ["legs","coordination","reaction time"], difficulty: "advanced" },
      ]},
      { day: "Sunday", focus: "Full Rest", restDay: true, durationMinutes: 0, exercises: [] },
    ],
  },
  overweight: {
    beginner: [
      { day: "Monday", focus: "Low-Impact Cardio", restDay: false, durationMinutes: 40, exercises: [
        { name: "Brisk Walking", sets: 1, reps: "25 min", restSeconds: 0, description: "Walk at a pace where you can still talk", muscleGroups: ["cardiovascular","legs"], difficulty: "beginner" },
        { name: "Seated Leg Raises", sets: 3, reps: "15", restSeconds: 60, description: "Raise legs while seated", muscleGroups: ["core","hip flexors"], difficulty: "beginner" },
        { name: "Wall Push-Ups", sets: 3, reps: "12", restSeconds: 60, description: "Push-ups against a wall", muscleGroups: ["chest","shoulders"], difficulty: "beginner" },
      ]},
      { day: "Tuesday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Wednesday", focus: "Strength Foundations", restDay: false, durationMinutes: 40, exercises: [
        { name: "Chair Squats", sets: 3, reps: "10", restSeconds: 90, description: "Squat down to chair and stand back up", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Resistance Band Rows", sets: 3, reps: "12", restSeconds: 75, description: "Seated band row for back", muscleGroups: ["back","biceps"], difficulty: "beginner" },
        { name: "Plank (Modified)", sets: 3, reps: "20s", restSeconds: 60, description: "Hold plank on knees", muscleGroups: ["core"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
      { day: "Friday", focus: "Cycling / Low Impact", restDay: false, durationMinutes: 30, exercises: [
        { name: "Stationary Bike", sets: 1, reps: "20 min", restSeconds: 0, description: "Moderate pace on stationary bike", muscleGroups: ["cardiovascular","legs"], difficulty: "beginner" },
        { name: "Arm Circles", sets: 2, reps: "30s each direction", restSeconds: 30, description: "Large arm circles for shoulder mobility", muscleGroups: ["shoulders"], difficulty: "beginner" },
      ]},
      { day: "Saturday", focus: "Full Body Light", restDay: false, durationMinutes: 40, exercises: [
        { name: "Step-Ups", sets: 3, reps: "10 each", restSeconds: 75, description: "Step onto a stable surface", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Resistance Band Press", sets: 3, reps: "12", restSeconds: 60, description: "Chest press with resistance band", muscleGroups: ["chest","shoulders"], difficulty: "beginner" },
        { name: "Calf Raises", sets: 3, reps: "15", restSeconds: 45, description: "Rise on toes slowly", muscleGroups: ["calves"], difficulty: "beginner" },
      ]},
      { day: "Sunday", focus: "Rest & Stretching", restDay: true, durationMinutes: 20, exercises: [
        { name: "Gentle Yoga", sets: 1, reps: "20 min", restSeconds: 0, description: "Beginner yoga stretches", muscleGroups: ["flexibility"], difficulty: "beginner" },
      ]},
    ],
    intermediate: [
      { day: "Monday", focus: "Circuit Training", restDay: false, durationMinutes: 50, exercises: [
        { name: "Goblet Squat", sets: 3, reps: "12", restSeconds: 60, description: "Dumbbell goblet squat", muscleGroups: ["quads","glutes","core"], difficulty: "beginner" },
        { name: "Dumbbell Rows", sets: 3, reps: "12", restSeconds: 60, description: "Bent-over row", muscleGroups: ["back","biceps"], difficulty: "beginner" },
        { name: "Push-Ups", sets: 3, reps: "10-12", restSeconds: 60, description: "Full push-up position", muscleGroups: ["chest","shoulders","triceps"], difficulty: "beginner" },
        { name: "Plank", sets: 3, reps: "30s", restSeconds: 45, description: "Full plank hold", muscleGroups: ["core"], difficulty: "beginner" },
      ]},
      { day: "Tuesday", focus: "Cardio", restDay: false, durationMinutes: 40, exercises: [
        { name: "Incline Treadmill Walk", sets: 1, reps: "30 min", restSeconds: 0, description: "Walk on 5-8% incline", muscleGroups: ["cardiovascular","glutes","calves"], difficulty: "beginner" },
      ]},
      { day: "Wednesday", focus: "Lower Body Focus", restDay: false, durationMinutes: 50, exercises: [
        { name: "Dumbbell Squats", sets: 4, reps: "12", restSeconds: 75, description: "Squat with dumbbells at sides", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Walking Lunges", sets: 3, reps: "10 each", restSeconds: 75, description: "Alternating forward lunges", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Hip Thrusts", sets: 3, reps: "15", restSeconds: 60, description: "Glute bridge on bench", muscleGroups: ["glutes","hamstrings"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Cardio / Swim", restDay: false, durationMinutes: 35, exercises: [
        { name: "Pool Laps", sets: 1, reps: "25 min", restSeconds: 0, description: "Easy freestyle swimming", muscleGroups: ["cardiovascular","full body"], difficulty: "beginner" },
      ]},
      { day: "Friday", focus: "Upper Body", restDay: false, durationMinutes: 50, exercises: [
        { name: "Seated Cable Rows", sets: 4, reps: "12", restSeconds: 75, description: "Machine cable row", muscleGroups: ["back","biceps"], difficulty: "beginner" },
        { name: "Chest Press Machine", sets: 4, reps: "12", restSeconds: 75, description: "Machine chest press for safety", muscleGroups: ["chest","shoulders"], difficulty: "beginner" },
        { name: "Lat Pulldown", sets: 3, reps: "12", restSeconds: 60, description: "Wide grip pulldown", muscleGroups: ["back","biceps"], difficulty: "beginner" },
      ]},
      { day: "Saturday", focus: "Active Rest", restDay: true, durationMinutes: 30, exercises: [
        { name: "Nature Walk", sets: 1, reps: "30 min", restSeconds: 0, description: "Leisurely walk outdoors", muscleGroups: ["cardiovascular"], difficulty: "beginner" },
      ]},
      { day: "Sunday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
    ],
    advanced: [
      { day: "Monday", focus: "Strength + Cardio Combo", restDay: false, durationMinutes: 65, exercises: [
        { name: "Barbell Squat", sets: 4, reps: "10-12", restSeconds: 90, description: "Moderate weight full squat", muscleGroups: ["quads","glutes"], difficulty: "intermediate" },
        { name: "Barbell Row", sets: 4, reps: "10-12", restSeconds: 90, description: "Bent-over row with barbell", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "HIIT Finisher", sets: 5, reps: "30s on / 30s off", restSeconds: 0, description: "Burpee or jump rope intervals", muscleGroups: ["cardiovascular","full body"], difficulty: "intermediate" },
      ]},
      { day: "Tuesday", focus: "Cardio HIIT", restDay: false, durationMinutes: 45, exercises: [
        { name: "Bike Intervals", sets: 10, reps: "1 min hard / 1 min easy", restSeconds: 0, description: "Alternating max effort and recovery", muscleGroups: ["cardiovascular","legs"], difficulty: "intermediate" },
      ]},
      { day: "Wednesday", focus: "Upper Strength", restDay: false, durationMinutes: 60, exercises: [
        { name: "Bench Press", sets: 4, reps: "10-12", restSeconds: 90, description: "Moderate weight bench press", muscleGroups: ["chest","shoulders","triceps"], difficulty: "intermediate" },
        { name: "Pull-Ups / Assisted", sets: 4, reps: "8-10", restSeconds: 90, description: "Pull-ups with band assist if needed", muscleGroups: ["back","biceps"], difficulty: "intermediate" },
        { name: "Shoulder Press", sets: 3, reps: "12", restSeconds: 75, description: "Dumbbell shoulder press", muscleGroups: ["shoulders"], difficulty: "beginner" },
      ]},
      { day: "Thursday", focus: "Active Recovery", restDay: true, durationMinutes: 40, exercises: [
        { name: "Swimming", sets: 1, reps: "30 min", restSeconds: 0, description: "Easy recovery swim", muscleGroups: ["full body","cardiovascular"], difficulty: "beginner" },
      ]},
      { day: "Friday", focus: "Lower Strength + Cardio", restDay: false, durationMinutes: 65, exercises: [
        { name: "Romanian Deadlift", sets: 4, reps: "10-12", restSeconds: 90, description: "Moderate weight RDL", muscleGroups: ["hamstrings","glutes"], difficulty: "intermediate" },
        { name: "Leg Press", sets: 4, reps: "12-15", restSeconds: 75, description: "Machine leg press", muscleGroups: ["quads","glutes"], difficulty: "beginner" },
        { name: "Stairmaster", sets: 1, reps: "15 min", restSeconds: 0, description: "Sustained stair climbing", muscleGroups: ["cardiovascular","glutes","calves"], difficulty: "intermediate" },
      ]},
      { day: "Saturday", focus: "Full Body Circuit", restDay: false, durationMinutes: 55, exercises: [
        { name: "Dumbbell Complex", sets: 4, reps: "6 exercises x8", restSeconds: 90, description: "Squat, row, press, lunge, curl, RDL without setting down", muscleGroups: ["full body"], difficulty: "intermediate" },
      ]},
      { day: "Sunday", focus: "Rest", restDay: true, durationMinutes: 0, exercises: [] },
    ],
  },
};

export const NUTRITION_TIPS: Record<PhysiqueType, string[]> = {
  skinny: [
    "Eat 5-6 small meals per day to consistently fuel muscle growth",
    "Aim for 2000-3000+ calories depending on metabolism and activity",
    "Prioritize protein at every meal: eggs, chicken, fish, legumes",
    "Add healthy calorie-dense foods: nuts, avocado, olive oil, whole grains",
    "Drink caloric beverages like milk or protein shakes between meals",
    "Track your intake with an app to ensure you hit your goals",
  ],
  athletic: [
    "Maintain caloric balance to support performance without gaining fat",
    "Time carbohydrates around workouts for energy and recovery",
    "Stay well hydrated: minimum 2.5-3L water daily",
    "Include anti-inflammatory foods: berries, leafy greens, fatty fish",
    "Post-workout: combine fast protein and carbs within 30 minutes",
    "Periodically cycle calories based on training intensity (high/low days)",
  ],
  overweight: [
    "Create a 300-500 kcal daily deficit for sustainable fat loss",
    "Fill half your plate with non-starchy vegetables at each meal",
    "Choose whole foods over processed: fiber helps you feel fuller",
    "Limit liquid calories: avoid sodas, juice, and alcohol",
    "Protein keeps you full: aim for lean meats, eggs, legumes, Greek yogurt",
    "Meal prep on Sundays to avoid impulsive eating during the week",
  ],
};

export const MILESTONES: Record<PhysiqueType, Array<{ week: number; title: string; description: string }>> = {
  skinny: [
    { week: 2, title: "Foundation Built", description: "Consistent workout habit established. Sleep and nutrition optimized." },
    { week: 4, title: "First Strength Gains", description: "Noticeably stronger on key lifts. Weight up 1-2 kg." },
    { week: 8, title: "Visible Changes", description: "Muscle definition visible. Confidence in gym movements." },
    { week: 12, title: "Solid Physique", description: "3-5 kg of lean mass gained. Compound lifts significantly increased." },
  ],
  athletic: [
    { week: 2, title: "Training Intensity Up", description: "Adapted to new volume and intensity. Recovery improving." },
    { week: 4, title: "Performance Boost", description: "Speed and power metrics improving. PR on major lifts." },
    { week: 8, title: "Peak Conditioning", description: "Optimal body composition. Sport performance at new high." },
    { week: 12, title: "Elite Level", description: "Strength, endurance, and agility all measurably improved." },
  ],
  overweight: [
    { week: 2, title: "Habit Established", description: "Consistent exercise routine. Energy levels improving." },
    { week: 4, title: "First Results", description: "2-3 kg lost. Clothes fitting better. Stamina noticeably improved." },
    { week: 8, title: "Momentum Building", description: "5-7 kg lost. Workout intensity can increase. Mood elevated." },
    { week: 12, title: "Transformed Lifestyle", description: "Significant fat loss achieved. New healthy baseline established." },
  ],
};

export function getWorkoutPlan(
  physiqueType: PhysiqueType,
  goal: Goal,
  fitnessLevel: Level
): WorkoutPlan {
  const typeSchedules = SCHEDULES[physiqueType];
  const schedule =
    (typeSchedules[fitnessLevel]?.length ?? 0) > 0
      ? typeSchedules[fitnessLevel]
      : typeSchedules.beginner;

  return {
    physiqueType,
    goal,
    fitnessLevel,
    weeklySchedule: schedule,
    nutritionTips: NUTRITION_TIPS[physiqueType],
    progressMilestones: MILESTONES[physiqueType],
  };
}
