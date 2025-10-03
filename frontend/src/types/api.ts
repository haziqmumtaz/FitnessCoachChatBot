// Chat-related types
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
};

export type WorkoutExercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
  targetMuscle: string;
};

export type WorkoutPlan = {
  exercises: WorkoutExercise[];
  totalDuration: number;
  equipment: string[];
  targetMuscles: string[];
  instructions: string;
};

export type ChatRequest = {
  message: string;
  model?: string;
  conversationHistory?: ChatMessage[];
  sessionId?: string;
};

export type ChatResponse = {
  coachTalk: string;
  workoutPlan?: WorkoutPlan;
  model: string;
  sessionId: string;
  timestamp: string;
};

export type AvailableModels = {
  models: string[];
  defaultModel: string;
  timestamp: string;
};
