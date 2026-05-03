import { pgTable, serial, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const classificationsTable = pgTable("classifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  physiqueType: text("physique_type").notNull(),
  confidence: real("confidence").notNull(),
  bodyMetrics: jsonb("body_metrics").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassificationSchema = createInsertSchema(classificationsTable).omit({ id: true, createdAt: true });
export type InsertClassification = z.infer<typeof insertClassificationSchema>;
export type Classification = typeof classificationsTable.$inferSelect;
