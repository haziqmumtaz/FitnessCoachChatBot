export type LLMRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
  role: LLMRole;
  content: string;
};

export interface DetailedExercise {
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
}

export interface ChatRequest {
  message: string;
  model?: string;
  conversationHistory?: ChatMessage[];
  sessionId?: string;
}

export interface ChatResponse {
  detailedExercises?: DetailedExercise[];
  coachTalk: string;
  model: string;
  sessionId: string;
  requiresClarification?: boolean;
  clarificationQuestion?: string;
}

export interface WorkoutParameters {
  duration?: number;
  equipment?: string;
  targetMuscle?: string;
  intensity?: "beginner" | "intermediate" | "advanced";
}

export interface ModelProviderResponse {
  content: string;
  model: string;
  toolCalls?: ToolCall[];
  toolChoice?: ToolChoice;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ModelProviderOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  model?: string;
  tools?: Tool[];
  toolChoice?: "auto" | "none" | ToolChoice;
}

export type Tool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
};

export type ToolChoice = {
  type: "function";
  function: {
    name: string;
  };
};

export type ExerciseDBExercise = {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
};

export type ExerciseDBResponse = {
  success: boolean;
  metadata: {
    totalPages: number;
    totalExercises: number;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
  };
  data: ExerciseDBExercise[];
};

export type IntentType =
  | "workout_generation"
  | "exercise_lookup"
  | "clarification_needed"
  | "exercise_variation";

// Intent Detection Types
export type WorkoutIntent = {
  type: IntentType;
  confidence: number;
  extractedParams?: {
    targetMuscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    duration?: number;
    intensity?: "beginner" | "intermediate" | "advanced";
    numExercises?: number;
    avoidMuscles?: string[];
    injuryDescription?: string;
    isVariationRequest?: boolean;
    previousExerciseContext?: string;
  };
  missingParams?: string[];
};

export type Guardrail = {
  violation: boolean;
  reason: string;
};

export type IntentDetectionResponse = {
  intent: WorkoutIntent;
  shouldCallTools: boolean;
  guardrail: Guardrail;
};
