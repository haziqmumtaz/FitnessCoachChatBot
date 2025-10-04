import { injectable } from "inversify";
import { container } from "../config/container";
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  DetailedExercise,
  WorkoutIntent,
} from "../types/chat";
import { TYPES } from "../types/di";
import { IIntentService } from "./intent.service";
import { IModelProvider } from "./model.service";
import { ToolService } from "./tool.service";
import { Result, success, failure } from "../types/core";
import {
  buildStructuredWorkoutPrompt,
  buildFinalResponsePrompt,
  buildClarificationRequest,
  GUARDRAIL_VIOLATION_MESSAGE,
  FALLBACK_RESPONSE_MESSAGE,
} from "../constants/prompts";

export interface IChatService {
  chat(request: ChatRequest): Promise<Result<ChatResponse>>;
}

@injectable()
export class ChatService implements IChatService {
  private readonly modelProvider: IModelProvider;
  private readonly toolService: ToolService;
  private readonly intentService: IIntentService;

  constructor() {
    this.modelProvider = container.get<IModelProvider>(TYPES.ModelProvider);
    this.toolService = container.get<ToolService>(TYPES.ToolService);
    this.intentService = container.get<IIntentService>(TYPES.IntentService);
  }

  async chat(request: ChatRequest): Promise<Result<ChatResponse>> {
    try {
      const sessionId = request.sessionId || this.generateSessionId();

      const intentResult = await this.intentService.detectIntent(
        request.message,
        request.conversationHistory
      );

      if ("error" in intentResult) {
        return failure(
          "Failed to detect intent",
          "INTENT_DETECTION_ERROR",
          intentResult.error
        );
      }

      const intentDetection = intentResult;
      console.log("Intent detection:", intentDetection);

      if (intentDetection.guardrail.violation) {
        return success(await this.handleGuardrailViolation(sessionId));
      }

      // STEP 4: Structured workout generation flow
      const workoutResult = await this.handleWorkoutGeneration(
        request,
        sessionId,
        intentDetection.intent
      );

      console.log(workoutResult);

      if ("error" in workoutResult) {
        return failure(
          "Failed to generate workout",
          "WORKOUT_GENERATION_ERROR",
          workoutResult.error
        );
      }

      return success(workoutResult);
    } catch (error: any) {
      console.error("Chat service error:", error);
      return failure(
        "Internal chat service error",
        "CHAT_SERVICE_ERROR",
        error.message
      );
    }
  }

  private async handleGuardrailViolation(
    sessionId: string
  ): Promise<ChatResponse> {
    // Handle general non-fitness queries only (injuries are now handled in workout generation)
    return {
      coachTalk: GUARDRAIL_VIOLATION_MESSAGE,
      model: "guardrail",
      sessionId,
    };
  }

  private async handleClarification(
    sessionId: string,
    intent: WorkoutIntent
  ): Promise<ChatResponse> {
    const missingParams = intent.missingParams || [];
    const message = buildClarificationRequest(missingParams);

    return {
      coachTalk: message,
      model: "clarification",
      sessionId,
    };
  }

  private async handleWorkoutGeneration(
    request: ChatRequest,
    sessionId: string,
    intent: WorkoutIntent
  ): Promise<Result<ChatResponse>> {
    try {
      const workoutPrompt = buildStructuredWorkoutPrompt(intent);

      const messages: ChatMessage[] = [
        { role: "system", content: workoutPrompt },
        ...(request.conversationHistory || []), // Use condensed history from frontend
        { role: "user", content: request.message },
      ];

      const availableTools = this.toolService.getAvailableTools();

      // Get response from model provider with tools
      const modelResponse = await this.modelProvider.chat(messages, {
        temperature: 0.7,
        maxTokens: 1000,
        model: request.model,
        tools: availableTools,
        toolChoice: "auto",
      });

      if ("error" in modelResponse) {
        return failure(
          "Failed to get model response",
          "MODEL_ERROR",
          modelResponse.error
        );
      }

      if (modelResponse.toolCalls && modelResponse.toolCalls.length > 0) {
        const toolResults = await this.toolService.processToolCalls(
          modelResponse.toolCalls
        );

        for (const toolResult of toolResults) {
          messages.push({
            role: "assistant",
            content: `Here are the exercise results:\n${JSON.stringify(
              toolResult.result,
              null,
              2
            )}`,
          });
        }

        // Get final structured response after tool execution
        const finalResponse = await this.modelProvider.chat(
          [
            { role: "system", content: buildFinalResponsePrompt(intent) },
            ...messages.slice(1), // Skip the original system prompt
          ],
          {
            temperature: 0.5,
            maxTokens: 800,
            model: request.model,
          }
        );

        if ("error" in finalResponse) {
          return failure(
            "Failed to get final response",
            "FINAL_RESPONSE_ERROR",
            finalResponse.error
          );
        }

        const coachTalk = finalResponse.content;

        // Extract detailed exercises from tool results
        const detailedExercises: DetailedExercise[] = [];
        for (const toolResult of toolResults) {
          if (toolResult.result && Array.isArray(toolResult.result)) {
            detailedExercises.push(...toolResult.result);
          }
        }

        return success({
          detailedExercises,
          coachTalk,
          model: finalResponse.model,
          sessionId,
        });
      }

      // If no tool calls, return direct response
      const coachTalk = modelResponse.content;

      return success({
        detailedExercises: [], // No exercises when no tool calls
        coachTalk,
        model: modelResponse.model,
        sessionId,
      });
    } catch (error: any) {
      console.error("Workout generation error:", error);
      return failure(
        "Workout generation failed",
        "WORKOUT_ERROR",
        error.message
      );
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }
}
