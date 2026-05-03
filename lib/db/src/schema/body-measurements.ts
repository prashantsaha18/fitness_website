import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bodyMeasurementsTable = pgTable("body_measurements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  weight: real("weight"),
  waist: real("waist"),
  chest: real("chest"),
  arms: real("arms"),
  hips: real("hips"),
  neck: real("neck"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurementsTable).omit({ id: true, createdAt: true });
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type BodyMeasurement = typeof bodyMeasurementsTable.$inferSelect;
