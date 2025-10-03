// ExerciseDB API constants - valid values that return actual data

export const AVAILABLE_MUSCLES = [
  "shins",
  "hands",
  "sternocleidomastoid",
  "soleus",
  "inner thighs",
  "lower abs",
  "grip muscles",
  "abdominals",
  "wrist extensors",
  "wrist flexors",
  "latissimus dorsi",
  "upper chest",
  "rotator cuff",
  "wrists",
  "groin",
  "brachialis",
  "deltoids",
  "feet",
  "ankles",
  "trapezius",
  "rear deltoids",
  "chest",
  "quadriceps",
  "back",
  "core",
  "shoulders",
  "ankle stabilizers",
  "rhomboids",
  "obliques",
  "lower back",
  "hip flexors",
  "levator scapulae",
  "abductors",
  "serratus anterior",
  "traps",
  "forearms",
  "delts",
  "biceps",
  "upper back",
  "spine",
  "cardiovascular system",
  "triceps",
  "adductors",
  "hamstrings",
  "glutes",
  "pectorals",
  "calves",
  "lats",
  "quads",
  "abs",
] as const;

export const AVAILABLE_EQUIPMENT = [
  "stepmill machine",
  "elliptical machine",
  "trap bar",
  "tire",
  "stationary bike",
  "wheel roller",
  "smith machine",
  "hammer",
  "skierg machine",
  "roller",
  "resistance band",
  "bosu ball",
  "weighted",
  "olympic barbell",
  "kettlebell",
  "upper body ergometer",
  "sled machine",
  "ez barbell",
  "dumbbell",
  "rope",
  "barbell",
  "band",
  "stability ball",
  "medicine ball",
  "assisted",
  "leverage machine",
  "cable",
  "body weight",
] as const;

export const AVAILABLE_BODY_PARTS = [
  "neck",
  "lower arms",
  "shoulders",
  "cardio",
  "upper arms",
  "chest",
  "lower legs",
  "back",
  "upper legs",
  "waist",
] as const;

// User-friendly mapping to ExerciseDB format
export const MUSCLE_MAPPING: Record<string, string> = {
  // Chest variations
  chest: "chest",
  "upper chest": "upper chest",
  pectorals: "pectorals",

  // Arms
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearms",
  arms: "upper arms",

  // Shoulders
  shoulders: "shoulders",
  deltoids: "deltoids",
  delts: "delts",
  "rear deltoids": "rear deltoids",

  // Back
  back: "back",
  "upper back": "upper back",
  "lower back": "lower back",
  lats: "lats",
  "latissimus dorsi": "latissimus dorsi",
  trapezius: "trapezius",
  traps: "traps",

  // Core
  core: "core",
  abs: "abs",
  abdominals: "abdominals",
  "lower abs": "lower abs",
  obliques: "obliques",
  waist: "waist",

  // Legs
  legs: "upper legs",
  quads: "quads",
  quadriceps: "quadriceps",
  hamstrings: "hamstrings",
  glutes: "glutes",
  calves: "calves",
  "lower legs": "lower legs",

  // Other
  neck: "neck",
  grip: "grip muscles",
};

export const EQUIPMENT_MAPPING: Record<string, string> = {
  // Free weights
  dumbbells: "dumbbell",
  dumbbell: "dumbbell",
  barbell: "barbell",
  "olympic barbell": "olympic barbell",
  kettlebell: "kettlebell",
  "trap bar": "trap bar",
  "ez bar": "ez barbell",

  // Machines
  cable: "cable",
  "smith machine": "smith machine",
  "leverage machine": "leverage machine",
  smith: "smith machine",

  // Bodyweight & bands
  "body weight": "body weight",
  bodyweight: "body weight",
  bands: "resistance band",
  "resistance band": "resistance band",
  band: "band",

  // Stability
  "stability ball": "stability ball",
  "bosu ball": "bosu ball",
  "medicine ball": "medicine ball",

  // Cardio
  "stationary bike": "stationary bike",
  elliptical: "elliptical machine",
  stepmill: "stepmill machine",
};

export const BODY_PART_MAPPING: Record<string, string> = {
  "upper arms": "upper arms",
  "lower arms": "lower arms",
  arms: "upper arms",
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  "upper legs": "upper legs",
  "lower legs": "lower legs",
  legs: "upper legs",
  waist: "waist",
  core: "waist",
  neck: "neck",
};

// Helper function to validate and map input values
export function validateAndMapMuscles(inputMuscles: string[]): string[] {
  return inputMuscles
    .map((muscle) => muscle.toLowerCase().trim())
    .map((muscle) => MUSCLE_MAPPING[muscle] || muscle)
    .filter((muscle) => AVAILABLE_MUSCLES.includes(muscle as any));
}

export function validateAndMapEquipment(inputEquipment: string[]): string[] {
  return inputEquipment
    .map((eq) => eq.toLowerCase().trim())
    .map((eq) => EQUIPMENT_MAPPING[eq] || eq)
    .filter((eq) => AVAILABLE_EQUIPMENT.includes(eq as any));
}

export function validateAndMapBodyParts(inputBodyParts: string[]): string[] {
  return inputBodyParts
    .map((part) => part.toLowerCase().trim())
    .map((part) => BODY_PART_MAPPING[part] || part)
    .filter((part) => AVAILABLE_BODY_PARTS.includes(part as any));
}
