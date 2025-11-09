import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: text("mood").notNull(),
  confidence: integer("confidence").notNull(),
  textInput: text("text_input"),
  originalText: text("original_text"),
  originalLanguage: varchar("original_language", { length: 12 }),
  translatedText: text("translated_text"),
  translatedLanguage: varchar("translated_language", { length: 12 }),
  translationProvider: varchar("translation_provider", { length: 32 }),
  faceAnalysis: jsonb("face_analysis"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  mood: text("mood").notNull(),
  completed: integer("completed").notNull().default(0),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  webcamConsent: integer("webcam_consent").notNull().default(0),
  localOnlyProcessing: integer("local_only_processing").notNull().default(1),
  dataLogging: integer("data_logging").notNull().default(1),
  preferredLanguage: varchar("preferred_language", { length: 12 }).default("en"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  timestamp: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MoodEntry = typeof moodEntries.$inferSelect & {
  crisisFlag?: boolean | null;
  crisisKeywords?: string[] | null;
  crisisReasons?: string[] | null;
  negativeMoodStreak?: number | null;
  helplineCode?: string | null;
  helplineName?: string | null;
  helplinePhone?: string | null;
  helplineUrl?: string | null;
  helplineLanguage?: string | null;
};
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema> & {
  crisisFlag?: boolean | null;
  crisisKeywords?: string[] | null;
  crisisReasons?: string[] | null;
  negativeMoodStreak?: number | null;
  helplineCode?: string | null;
  helplineName?: string | null;
  helplinePhone?: string | null;
  helplineUrl?: string | null;
  helplineLanguage?: string | null;
};

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type MoodType = "calm" | "energized" | "stressed" | "focused" | "neutral";
export type DifficultyType = "easy" | "medium" | "hard";

export interface HelplineInfo {
  code: string;
  name: string;
  phone: string;
  url?: string;
  language?: string;
}

export interface CrisisSummary {
  triggered: boolean;
  reasons: string[];
  keywords: string[];
  negativeMoodStreak: number;
  helpline?: HelplineInfo | null;
}

export interface MoodDetectionRequest {
  text: string;
  useWebcam?: boolean;
  userId: string;
  imageData?: string;
  preferredLanguage?: string | null;
}

export interface MoodDetectionResponse {
  mood: MoodType;
  confidence: number;
  sources: Record<string, boolean | string | number>;
  entry: MoodEntry;
  originalText?: string | null;
  originalLanguage?: string | null;
  translatedText?: string | null;
  translatedLanguage?: string | null;
  localizedMessage?: string | null;
  localizedLanguage?: string | null;
  translationApplied?: boolean;
  crisis?: CrisisSummary | null;
}

export interface ChatMessageResponse {
  message: string;
  language: string;
  detectedLanguage?: string | null;
  translationApplied: boolean;
  peerSupportSuggested: boolean;
  crisisKeywords?: string[] | null;
  helpline?: HelplineInfo | null;
}

export interface SupportSMSRequest {
  phone?: string;
  message?: string;
  language?: string;
}

export interface SupportSMSResponse {
  success: boolean;
  detail: string;
}

export interface PeerMatch {
  matchId: string;
  displayName: string;
  language: string;
  availability: string;
  sharedExperiences: string[];
  timeZone?: string;
  avatarColor?: string;
  introduction?: string;
}

export interface PeerSupportResponse {
  sessionId: string;
  match: PeerMatch;
  originalIntro?: string | null;
  translatedIntro?: string | null;
}

export interface PeerChatMessage {
  sender: "user" | "peer" | "moderator";
  text: string;
  language: string;
  translatedFrom?: string | null;
  flagged?: boolean;
}

export interface PeerChatResponse {
  sessionId: string;
  userMessage: PeerChatMessage;
  peerMessage: PeerChatMessage;
  moderation?: string | null;
}
