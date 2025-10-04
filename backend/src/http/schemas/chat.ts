import { z } from "zod";

// Chat Message Schema
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
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
  coachTalk: z.string().min(1),
  model: z.string(),
  sessionId: z.string(),
  requiresClarification: z.boolean().optional(),
  clarificationQuestion: z.string().optional(),
});

// Export types for use in other files
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
