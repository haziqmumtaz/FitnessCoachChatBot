import { injectable } from "inversify";
import { container } from "../config/container";
import { ChatMessage, IntentDetectionResponse } from "../types/chat";
import { TYPES } from "../types/di";
import { IModelProvider } from "./model.provider";

export interface IIntentService {
  detectIntent(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<IntentDetectionResponse>;
}

@injectable()
export class IntentService implements IIntentService {
  private readonly modelProvider: IModelProvider;

  constructor() {
    this.modelProvider = container.get<IModelProvider>(TYPES.ModelProvider);
  }

  async detectIntent(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<IntentDetectionResponse> {
    try {
      const intentPrompt = this.buildIntentDetectionPrompt();

      const messages: ChatMessage[] = [
        { role: "system", content: intentPrompt },
        ...(conversationHistory || []).slice(-3), // Use last 3 messages for context
        { role: "user", content: message },
      ];

      const response = await this.modelProvider.chat(messages, {
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        maxTokens: 500,
      });

      return this.parseIntentResponse(response.content);
    } catch (error: any) {
      console.error("Intent detection error:", error.message);
      return this.getDefaultIntent();
    }
  }

  private buildIntentDetectionPrompt(): string {
    return `You are classifying messages for a fitness coach AI and extracting exercise parameters.

FITNESS keywords: workout, exercise, chest, legs, arms, abs, gym, training, plan, routine
NON-FITNESS keywords: coding, error, food, eat, homework, math

VALID EXERCISEDB VALUES you need to map the users provided values against and replace (use these exact values):
Muscles: chest, biceps, triceps, deltoids, latissimus dorsi, quadriceps, hamstrings, glutes, calves, abs, core, trapezius, rhomboids, obliques, lower back, upper back, forearms, pectorals, lats, quads, inner thighs, outer thighs, hip flexors, rotator cuff, shins, hands, feet, ankles, wrists, grip muscles, neck, cardiovascular system

Body Parts: chest, upper arms, lower arms, shoulders, upper legs, lower legs, back, waist, neck, cardio

Equipment: dumbbell, barbell, body weight, kettlebell, cable, leverage machine, resistance band, stability ball, medicine ball, ez barbell, olympic barbell, bosu ball, roller, sled machine, tire, hammer, rope, smith machine, stationary bike, elliptical machine, stepmill machine, skierg machine, trap bar, wheel roller, weighted, assisted, upper body ergometer

PARAMETER EXTRACTION RULES:
- Extract muscles, body parts, equipment from user query
- Map to exact ExerciseDB values (case-insensitive)
- "dumbbells" → "dumbbell", "upper body" → ["chest", "upper arms", "shoulders"]
- "leg day" → ["quadriceps", "hamstrings", "glutes", "calves"]
- "chest workout" → ["chest"]
- If injury mentioned, add to avoidMuscles: "knee hurts" → avoidMuscles: ["quads", "calves"]

Classify this message and return ONLY valid JSON:

For FITNESS messages:
{
  "intent": {
    "type": "workout_generation" | "exercise_lookup" | "clarification_needed",
    "confidence": 1.0,
    "extractedParams": {
      "targetMuscles": ["chest", "biceps"],
      "bodyParts": ["upper arms", "chest"],
      "equipment": ["dumbbell", "barbell"],
      "duration": 20,
      "intensity": "intermediate",
      "numExercises": 5,
      "avoidMuscles": ["knee", "quads"]
    },
    "missingParams": ["duration", "equipment"]
  },
  "shouldCallTools": true,
  "guardrail": {
    "violation": false,
    "reason": ""
  }
}

INTENT TYPES (FITNESS-RELATED ONLY)

"workout_generation" → User wants a complete workout plan (e.g., "20 min dumbbell chest workout", "upper body plan").

"exercise_lookup" → User wants a list of exercises (e.g., "show me barbell back exercises").

"clarification_needed" → The request is fitness-related, but critical parameters are missing (e.g., "upper body plan" with no duration/equipment).

For NON-FITNESS messages:  
{"guardrail":{"violation":true,"reason":"Not fitness-related"},"shouldCallTools":false}

Examples:
"upper body workout" → FITNESS
"leg day but my knee hurts" → FITNESS (with note: user mentions injury and avoidMuscles is extracted)
"fix error js" → NOT FITNESS

Only return the JSON, nothing else.`;
  }

  private parseIntentResponse(response: string): IntentDetectionResponse {
    try {
      // Extract JSON from response
      const jsonMatch =
        response.match(/```json\s*([\s\S]*?)\s*```/) ||
        response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];

        const parsedIntent = JSON.parse(jsonString);

        return {
          intent: parsedIntent.intent,
          shouldCallTools: parsedIntent.shouldCallTools,
          guardrail: parsedIntent.guardrail || { violation: false, reason: "" },
        };
      }
    } catch (error) {
      console.error("JSON parsing failed:", error);
      console.error("Raw response:", response);
    }

    console.log("Falling back to default intent");
    return this.getDefaultIntent();
  }

  private getDefaultIntent(): IntentDetectionResponse {
    return {
      intent: {
        type: "workout_generation",
        confidence: 0.5,
      },
      shouldCallTools: false,
      guardrail: {
        violation: true,
        reason: "Could not parse intent, defaulting to rejection",
      },
    };
  }
}
