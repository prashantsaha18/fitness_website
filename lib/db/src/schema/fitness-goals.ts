import { pgTable, serial, text, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fitnessGoalsTable = pgTable("fitness_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  goalType: text("goal_type").notNull(),
  title: text("title").notNull(),
  targetValue: real("target_value"),
  currentValue: real("current_value"),
  unit: text("unit"),
  deadline: timestamp("deadline"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFitnessGoalSchema = createInsertSchema(fitnessGoalsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFitnessGoal = z.infer<typeof insertFitnessGoalSchema>;
export type FitnessGoal = typeof fitnessGoalsTable.$inferSelect;
