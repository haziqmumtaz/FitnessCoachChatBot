export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface WorkoutPlan {
  exercises: Exercise[];
  totalDuration: number;
  equipment: string[];
  targetMuscles: string[];
  instructions: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
  equipment?: string;
  targetMuscle: string;
}

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
  workoutPlan?: WorkoutPlan;
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

export interface Tool {
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
}

export interface ToolChoice {
  type: "function";
  function: {
    name: string;
  };
}

// ExerciseDB API Types
export interface ExerciseDBExercise {
  id: string;
  name: string;
  gifUrl: string;
  target: string;
  bodyPart: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface ExerciseDBResponse {
  success: boolean;
  metadata: {
    totalPages: number;
    totalExercises: number;
    currentPage: number;
    previousPage: number | null;
    nextPage: number | null;
  };
  data: ExerciseDBExercise[];
}

// Intent Detection Types
export interface WorkoutIntent {
  type: "workout_generation" | "exercise_lookup" | "clarification_needed";
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
  };
  missingParams?: string[];
}

export interface Guardrail {
  violation: boolean;
  reason: string;
}

export interface IntentDetectionResponse {
  intent: WorkoutIntent;
  shouldCallTools: boolean;
  guardrail: Guardrail;
}
