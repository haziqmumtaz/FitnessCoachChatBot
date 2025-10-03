import { z } from "zod";

// Chat Message Schema
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
  timestamp: z.string().optional(),
});

// Exercise Schema
export const ExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().min(1).max(10),
  reps: z.string().min(1),
  rest: z.string().min(1),
  instructions: z.string().min(1),
  equipment: z.string().optional(),
  targetMuscle: z.string().min(1),
});

// Workout Plan Schema
export const WorkoutPlanSchema = z.object({
  exercises: z.array(ExerciseSchema).min(1).max(20),
  totalDuration: z.number().min(3).max(120),
  equipment: z.array(z.string()).min(0).max(10),
  targetMuscles: z.array(z.string()).min(1).max(10),
  instructions: z.string().min(1),
});

// Workout Parameters Schema
export const WorkoutParametersSchema = z.object({
  duration: z.number().min(3).max(120).optional(),
  equipment: z.string().optional(),
  targetMuscle: z.string().optional(),
  intensity: z.enum(["beginner", "intermediate", "advanced"]).optional(),
});

// Chat Request Schema
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  model: z.string().optional(),
  conversationHistory: z.array(ChatMessageSchema).optional(),
  sessionId: z.string().optional(),
});

// Chat Response Schema
export const ChatResponseSchema = z.object({
  workoutPlan: WorkoutPlanSchema.optional(),
  coachTalk: z.string().min(1),
  model: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  requiresClarification: z.boolean().optional(),
  clarificationQuestion: z.string().optional(),
});

// Model Provider Options Schema
export const ModelProviderOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  stream: z.boolean().optional(),
});

// Model Provider Response Schema
export const ModelProviderResponseSchema = z.object({
  content: z.string(),
  model: z.string(),
  usage: z
    .object({
      promptTokens: z.number(),
      completionTokens: z.number(),
      totalTokens: z.number(),
    })
    .optional(),
});

// Export types for use in other files
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type WorkoutPlan = z.infer<typeof WorkoutPlanSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type ModelProviderOptions = z.infer<typeof ModelProviderOptionsSchema>;
export type ModelProviderResponse = z.infer<typeof ModelProviderResponseSchema>;
