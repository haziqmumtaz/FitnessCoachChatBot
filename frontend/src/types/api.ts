// Chat-related types
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  detailedExercises?: DetailedExercise[];
};

export type ChatRequest = {
  message: string;
  model?: string;
  conversationHistory?: ChatMessage[];
  sessionId?: string;
};

export type DetailedExercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  sets?: number;
  reps?: string;
  rest?: string;
};

export type ChatResponse = {
  coachTalk: string;
  detailedExercises?: DetailedExercise[];
  model: string;
  sessionId: string;
  timestamp: string;
};

export type AvailableModels = {
  models: string[];
  defaultModel: string;
  timestamp: string;
};

export type StreamEventType =
  | "intent_detected"
  | "tools_calling"
  | "tools_executed"
  | "final_response"
  | "error";

export type StreamEvent = {
  type: StreamEventType;
  data: any;
  sessionId: string;
};
