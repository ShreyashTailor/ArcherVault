import { z } from "zod";

export interface User {
  id: string;
  username: string;
  password: string;
  validUntil: string;
  isAdmin: boolean;
}

export interface Subject {
  id: string;
  name: string;
  chapterCount?: number;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
}

export interface Content {
  id: string;
  chapterId: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  url?: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  contentId: string;
  question: string;
  options: string;
  correctAnswer: number;
  imageUrl?: string;
  orderIndex: number;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'pdf' | 'book' | 'note';
  category?: string;
}

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  razorpayLink: string;
}

export interface Settings {
  id: string;
  supportEmail: string;
  updatedAt: string;
}

export interface Update {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  validUntil: z.string(),
  isAdmin: z.boolean().default(false),
});

export const insertSubjectSchema = z.object({
  name: z.string().min(1),
});

export const insertChapterSchema = z.object({
  subjectId: z.string(),
  name: z.string().min(1),
  orderIndex: z.number().default(0),
});

export const insertContentSchema = z.object({
  chapterId: z.string(),
  type: z.enum(['video', 'pdf', 'quiz']),
  title: z.string().min(1),
  url: z.string().optional(),
  orderIndex: z.number().default(0),
});

export const insertQuizQuestionSchema = z.object({
  contentId: z.string(),
  question: z.string().min(1),
  options: z.string(),
  correctAnswer: z.number().min(0),
  imageUrl: z.string().optional(),
  orderIndex: z.number().default(0),
});

export const insertResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  type: z.enum(['pdf', 'book', 'note']),
  category: z.string().optional(),
});

export const insertPlanSchema = z.object({
  name: z.string().min(1),
  durationMonths: z.number().min(1),
  price: z.number().min(1),
  razorpayLink: z.string().url(),
});

export const insertSettingsSchema = z.object({
  supportEmail: z.string().email(),
});

export const insertUpdateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
