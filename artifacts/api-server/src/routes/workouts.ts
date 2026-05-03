import { Router } from "express";

const router = Router();

type PhysiqueType = "athletic" | "skinny" | "overweight";
type Goal = "muscle_gain" | "fat_loss" | "endurance" | "flexibility" | "general_fitness";
type Level = "beginner" | "intermediate" | "advanced";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  description: string;
  muscleGroups: string[];
  difficulty: Level;
}

interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
  durationMinutes: number;
  restDay: boolean;
}

const WORKOUTS: Record<PhysiqueType, Record<string, DayPlan[]>> = {
  skinny: {
    beginner: [
      {
        day: "Monday",
        focus: "Upper Body Strength",
        exercises: [
          { name: "Push-Ups", sets: 3, reps: "8-12", restSeconds: 90, description: "Standard push-ups, keep core tight", muscleGroups: ["chest", "shoulders", "triceps"], difficulty: "beginner" },
          { name: "Dumbbell Rows", sets: 3, reps: "10", restSeconds: 90, description: "Bent-over row with light dumbbell", muscleGroups: ["back", "biceps"], difficulty: "beginner" },
          { name: "Overhead Press", sets: 3, reps: "8-10", restSeconds: 90, description: "Seated dumbbell press overhead", muscleGroups: ["shoulders", "triceps"], difficulty: "beginner" },
        ],
        durationMinutes: 45,
        restDay: false,
      },
      {
        day: "Tuesday",
        focus: "Active Recovery",
        exercises: [
          { name: "Light Walking", sets: 1, reps: "20 min", restSeconds: 0, description: "Easy-paced walking", muscleGroups: ["cardiovascular"], difficulty: "beginner" },
          { name: "Stretching", sets: 1, reps: "10 min", restSeconds: 0, description: "Full-body stretch routine", muscleGroups: ["flexibility"], difficulty: "beginner" },
        ],
        durationMinutes: 30,
        restDay: true,
      },
      {
        day: "Wednesday",
        focus: "Lower Body Strength",
        exercises: [
          { name: "Goblet Squat", sets: 3, reps: "10-12", restSeconds: 90, description: "Squat holding a dumbbell at chest", muscleGroups: ["quads", "glutes", "core"], difficulty: "beginner" },
          { name: "Romanian Deadlift", sets: 3, reps: "10", restSeconds: 90, description: "Hinge at hips keeping back straight", muscleGroups: ["hamstrings", "glutes"], difficulty: "beginner" },
          { name: "Walking Lunges", sets: 3, reps: "12 each", restSeconds: 75, description: "Controlled forward lunges", muscleGroups: ["quads", "glutes"], difficulty: "beginner" },
        ],
        durationMinutes: 45,
        restDay: false,
      },
      {
        day: "Thursday",
        focus: "Rest",
        exercises: [],
        durationMinutes: 0,
        restDay: true,
      },
      {
        day: "Friday",
        focus: "Full Body Compound",
        exercises: [
          { name: "Deadlift", sets: 3, reps: "6-8", restSeconds: 120, description: "Full deadlift with controlled form", muscleGroups: ["back", "glutes", "hamstrings"], difficulty: "beginner" },
          { name: "Bench Press", sets: 3, reps: "8-10", restSeconds: 90, description: "Barbell or dumbbell bench press", muscleGroups: ["chest", "shoulders", "triceps"], difficulty: "beginner" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", restSeconds: 90, description: "Cable pulldown to chest", muscleGroups: ["back", "biceps"], difficulty: "beginner" },
        ],
        durationMinutes: 50,
        restDay: false,
      },
      {
        day: "Saturday",
        focus: "Rest",
        exercises: [],
        durationMinutes: 0,
        restDay: true,
      },
      {
        day: "Sunday",
        focus: "Core & Mobility",
        exercises: [
          { name: "Plank", sets: 3, reps: "30-45s", restSeconds: 60, description: "Hold straight body position", muscleGroups: ["core", "shoulders"], difficulty: "beginner" },
          { name: "Bird Dog", sets: 3, reps: "12 each side", restSeconds: 45, description: "Opposite arm/leg extension from all-fours", muscleGroups: ["core", "back"], difficulty: "beginner" },
          { name: "Hip Flexor Stretch", sets: 1, reps: "60s each", restSeconds: 0, description: "Kneeling hip flexor stretch", muscleGroups: ["hip flexors"], difficulty: "beginner" },
        ],
        durationMinutes: 30,
        restDay: false,
      },
    ],
    intermediate: [],
    advanced: [],
  },
  athletic: {
    beginner: [
      {
        day: "Monday",
        focus: "Power & Strength",
        exercises: [
          { name: "Barbell Squat", sets: 4, reps: "6-8", restSeconds: 120, description: "Heavy back squat with full range", muscleGroups: ["quads", "glutes", "core"], difficulty: "intermediate" },
          { name: "Pull-Ups", sets: 4, reps: "8-12", restSeconds: 90, description: "Weighted or bodyweight pull-ups", muscleGroups: ["back", "biceps"], difficulty: "intermediate" },
          { name: "Dips", sets: 3, reps: "10-15", restSeconds: 90, description: "Tricep dips on parallel bars", muscleGroups: ["chest", "triceps", "shoulders"], difficulty: "intermediate" },
        ],
        durationMinutes: 55,
        restDay: false,
      },
      {
        day: "Tuesday",
        focus: "Cardio & Agility",
        exercises: [
          { name: "Interval Running", sets: 6, reps: "400m", restSeconds: 90, description: "Sprint 400m at 80% effort", muscleGroups: ["cardiovascular", "legs"], difficulty: "intermediate" },
          { name: "Box Jumps", sets: 4, reps: "8", restSeconds: 60, description: "Explosive jump onto box", muscleGroups: ["quads", "glutes", "calves"], difficulty: "intermediate" },
        ],
        durationMinutes: 45,
        restDay: false,
      },
      {
        day: "Wednesday",
        focus: "Rest & Recovery",
        exercises: [],
        durationMinutes: 0,
        restDay: true,
      },
      {
        day: "Thursday",
        focus: "Upper Body Hypertrophy",
        exercises: [
          { name: "Incline Bench Press", sets: 4, reps: "8-12", restSeconds: 90, description: "Incline press for upper chest", muscleGroups: ["chest", "shoulders"], difficulty: "intermediate" },
          { name: "Cable Rows", sets: 4, reps: "10-12", restSeconds: 90, description: "Seated cable row for mid-back", muscleGroups: ["back", "biceps"], difficulty: "intermediate" },
          { name: "Lateral Raises", sets: 3, reps: "15", restSeconds: 60, description: "Dumbbell lateral raises", muscleGroups: ["shoulders"], difficulty: "beginner" },
        ],
        durationMinutes: 55,
        restDay: false,
      },
      {
        day: "Friday",
        focus: "Lower Body Power",
        exercises: [
          { name: "Romanian Deadlift", sets: 4, reps: "8", restSeconds: 120, description: "Heavy RDL for hamstring development", muscleGroups: ["hamstrings", "glutes"], difficulty: "intermediate" },
          { name: "Leg Press", sets: 4, reps: "12-15", restSeconds: 90, description: "High-foot leg press", muscleGroups: ["quads", "glutes"], difficulty: "beginner" },
          { name: "Calf Raises", sets: 4, reps: "20", restSeconds: 60, description: "Standing calf raises", muscleGroups: ["calves"], difficulty: "beginner" },
        ],
        durationMinutes: 50,
        restDay: false,
      },
      {
        day: "Saturday",
        focus: "Sport Performance",
        exercises: [
          { name: "Plyometric Circuit", sets: 3, reps: "5 exercises", restSeconds: 60, description: "Jump squats, burpees, mountain climbers", muscleGroups: ["full body"], difficulty: "intermediate" },
          { name: "Agility Ladder", sets: 4, reps: "30s", restSeconds: 45, description: "Quick feet ladder drills", muscleGroups: ["cardiovascular", "coordination"], difficulty: "intermediate" },
        ],
        durationMinutes: 40,
        restDay: false,
      },
      {
        day: "Sunday",
        focus: "Mobility & Recovery",
        exercises: [
          { name: "Yoga Flow", sets: 1, reps: "20 min", restSeconds: 0, description: "Sun salutation flow sequence", muscleGroups: ["flexibility", "balance"], difficulty: "beginner" },
          { name: "Foam Rolling", sets: 1, reps: "15 min", restSeconds: 0, description: "Full body foam rolling", muscleGroups: ["recovery"], difficulty: "beginner" },
        ],
        durationMinutes: 35,
        restDay: true,
      },
    ],
    intermediate: [],
    advanced: [],
  },
  overweight: {
    beginner: [
      {
        day: "Monday",
        focus: "Low-Impact Cardio",
        exercises: [
          { name: "Brisk Walking", sets: 1, reps: "25 min", restSeconds: 0, description: "Walk at a pace where you can still talk", muscleGroups: ["cardiovascular", "legs"], difficulty: "beginner" },
          { name: "Seated Leg Raises", sets: 3, reps: "15", restSeconds: 60, description: "Raise legs while seated", muscleGroups: ["core", "hip flexors"], difficulty: "beginner" },
          { name: "Wall Push-Ups", sets: 3, reps: "12", restSeconds: 60, description: "Push-ups against a wall", muscleGroups: ["chest", "shoulders"], difficulty: "beginner" },
        ],
        durationMinutes: 40,
        restDay: false,
      },
      {
        day: "Tuesday",
        focus: "Rest",
        exercises: [],
        durationMinutes: 0,
        restDay: true,
      },
      {
        day: "Wednesday",
        focus: "Strength Foundations",
        exercises: [
          { name: "Chair Squats", sets: 3, reps: "10", restSeconds: 90, description: "Squat down to chair and stand back up", muscleGroups: ["quads", "glutes"], difficulty: "beginner" },
          { name: "Resistance Band Rows", sets: 3, reps: "12", restSeconds: 75, description: "Seated band row for back", muscleGroups: ["back", "biceps"], difficulty: "beginner" },
          { name: "Plank (Modified)", sets: 3, reps: "20s", restSeconds: 60, description: "Hold plank on knees", muscleGroups: ["core"], difficulty: "beginner" },
        ],
        durationMinutes: 40,
        restDay: false,
      },
      {
        day: "Thursday",
        focus: "Rest",
        exercises: [],
        durationMinutes: 0,
        restDay: true,
      },
      {
        day: "Friday",
        focus: "Cycling / Swimming",
        exercises: [
          { name: "Stationary Bike", sets: 1, reps: "20 min", restSeconds: 0, description: "Moderate pace on stationary bike", muscleGroups: ["cardiovascular", "legs"], difficulty: "beginner" },
          { name: "Arm Circles", sets: 2, reps: "30s each direction", restSeconds: 30, description: "Large arm circles for shoulder mobility", muscleGroups: ["shoulders"], difficulty: "beginner" },
        ],
        durationMinutes: 30,
        restDay: false,
      },
      {
        day: "Saturday",
        focus: "Full Body Light",
        exercises: [
          { name: "Step-Ups", sets: 3, reps: "10 each", restSeconds: 75, description: "Step onto a stable surface", muscleGroups: ["quads", "glutes"], difficulty: "beginner" },
          { name: "Resistance Band Press", sets: 3, reps: "12", restSeconds: 60, description: "Chest press with resistance band", muscleGroups: ["chest", "shoulders"], difficulty: "beginner" },
          { name: "Calf Raises", sets: 3, reps: "15", restSeconds: 45, description: "Rise on toes slowly", muscleGroups: ["calves"], difficulty: "beginner" },
        ],
        durationMinutes: 40,
        restDay: false,
      },
      {
        day: "Sunday",
        focus: "Rest & Stretching",
        exercises: [
          { name: "Gentle Yoga", sets: 1, reps: "20 min", restSeconds: 0, description: "Beginner yoga stretches", muscleGroups: ["flexibility"], difficulty: "beginner" },
        ],
        durationMinutes: 20,
        restDay: true,
      },
    ],
    intermediate: [],
    advanced: [],
  },
};

const NUTRITION_TIPS: Record<PhysiqueType, string[]> = {
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

const MILESTONES: Record<PhysiqueType, Array<{week: number; title: string; description: string}>> = {
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

router.get("/workouts/:physiqueType", (req, res) => {
  const physiqueType = req.params.physiqueType as PhysiqueType;
  const goal = (req.query.goal as Goal) || "general_fitness";
  const fitnessLevel = (req.query.fitnessLevel as Level) || "beginner";

  const validTypes: PhysiqueType[] = ["athletic", "skinny", "overweight"];
  if (!validTypes.includes(physiqueType)) {
    res.status(400).json({ error: "Invalid physique type" });
    return;
  }

  const rawSchedule = WORKOUTS[physiqueType]?.[fitnessLevel];
  const schedule = rawSchedule && rawSchedule.length > 0 ? rawSchedule : WORKOUTS[physiqueType]["beginner"];

  res.json({
    physiqueType,
    goal,
    fitnessLevel,
    weeklySchedule: schedule,
    nutritionTips: NUTRITION_TIPS[physiqueType],
    progressMilestones: MILESTONES[physiqueType],
  });
});

export default router;
