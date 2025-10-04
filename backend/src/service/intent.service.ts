import { injectable } from "inversify";
import { container } from "../config/container";
import { ChatMessage, IntentDetectionResponse } from "../types/chat";
import { TYPES } from "../types/di";
import { IModelProvider } from "./model.service";
import { Result, success, failure } from "../types/core";
import { INTENT_DETECTION_PROMPT } from "../constants/prompts";

export interface IIntentService {
  detectIntent(
    message: string,
    conversationHistory?: ChatMessage[]
  ): Promise<Result<IntentDetectionResponse>>;
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
  ): Promise<Result<IntentDetectionResponse>> {
    try {
      const intentPrompt = INTENT_DETECTION_PROMPT;

      const messages: ChatMessage[] = [
        { role: "system", content: intentPrompt },
        ...(conversationHistory || []), // Use condensed history from frontend
        { role: "user", content: message },
      ];

      const modelResponse = await this.modelProvider.chat(messages, {
        model: "Llama 3.3 Versatile",
        temperature: 0.0,
        maxTokens: 300,
      });

      if ("error" in modelResponse) {
        return failure(
          "Failed to get model response",
          "MODEL_ERROR",
          modelResponse.error
        );
      }

      const parsedIntent = this.parseIntentResponse(modelResponse.content);
      return success(parsedIntent);
    } catch (error: any) {
      console.error("Intent detection error:", error.message);
      return failure("Intent detection failed", "INTENT_ERROR", error.message);
    }
  }

  private parseIntentResponse(response: string): IntentDetectionResponse {
    try {
      // Clean the response and extract JSON
      let jsonString = response.trim();

      // Remove any markdown code blocks
      jsonString = jsonString.replace(/```json\s*|\s*```/g, "");

      // Try to find JSON object
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }

      const parsedIntent = JSON.parse(jsonString);

      // Validate required fields
      if (!parsedIntent.intent || parsedIntent.shouldCallTools === undefined) {
        throw new Error("Invalid intent structure");
      }

      // Apply 4-minute per exercise rule if duration is specified
      if (parsedIntent.intent?.extractedParams?.duration) {
        const duration = parsedIntent.intent.extractedParams.duration;
        parsedIntent.intent.extractedParams.numExercises = Math.floor(
          duration / 4
        );
      } else if (!parsedIntent.intent?.extractedParams?.numExercises) {
        // Default to 5 exercises if no duration specified
        parsedIntent.intent.extractedParams =
          parsedIntent.intent.extractedParams || {};
        parsedIntent.intent.extractedParams.numExercises = 5;
      }

      return {
        intent: parsedIntent.intent,
        shouldCallTools: parsedIntent.shouldCallTools,
        guardrail: parsedIntent.guardrail || { violation: false, reason: "" },
      };
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
