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
    return `You are classifying messages for a fitness coach AI.

        FITNESS keywords: workout, exercise, chest, legs, arms, abs, gym, training, plan, routine
        NON-FITNESS keywords: coding, error, food, eat, homework, math

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
                        "numExercises": 5
                        },
                        "missingParams": ["duration", "equipment"]
                        "avoidMuscles": ["knee", "quads"]
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
