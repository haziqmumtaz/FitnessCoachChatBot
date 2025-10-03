// Chat-related types
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  detailedExercises?: DetailedExercise[];
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
  workoutPlan?: WorkoutPlan;
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
