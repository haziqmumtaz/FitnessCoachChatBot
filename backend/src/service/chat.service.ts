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
import {
  buildStructuredWorkoutPrompt,
  buildFinalResponsePrompt,
  buildClarificationRequest,
  GUARDRAIL_VIOLATION_MESSAGE,
  FALLBACK_RESPONSE_MESSAGE,
} from "../constants/prompts";

export interface IChatService {
  chat(request: ChatRequest): Promise<ChatResponse>;
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

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const sessionId = request.sessionId || this.generateSessionId();

      const intentDetection = await this.intentService.detectIntent(
        request.message,
        request.conversationHistory
      );

      console.log("Intent detection:", intentDetection);

      if (intentDetection.guardrail.violation) {
        return await this.handleGuardrailViolation(sessionId);
      }

      if (intentDetection.intent.type == "clarification_needed") {
        return await this.handleClarification(
          sessionId,
          intentDetection.intent
        );
      }

      // STEP 4: Structured workout generation flow
      return await this.handleWorkoutGeneration(
        request,
        sessionId,
        intentDetection.intent
      );
    } catch (error) {
      console.error("Chat service error:", error);
      return this.generateFallbackResponse(
        request.sessionId || this.generateSessionId()
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
  ): Promise<ChatResponse> {
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

      const coachTalk = finalResponse.content;

      // Extract detailed exercises from tool results
      const detailedExercises: DetailedExercise[] = [];
      for (const toolResult of toolResults) {
        if (toolResult.result && Array.isArray(toolResult.result)) {
          detailedExercises.push(...toolResult.result);
        }
      }

      return {
        detailedExercises,
        coachTalk,
        model: finalResponse.model,
        sessionId,
      };
    }

    // If no tool calls, return direct response
    const coachTalk = modelResponse.content;

    return {
      detailedExercises: [], // No exercises when no tool calls
      coachTalk,
      model: modelResponse.model,
      sessionId,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  private generateFallbackResponse(sessionId: string): ChatResponse {
    return {
      coachTalk: FALLBACK_RESPONSE_MESSAGE,
      model: "fallback",
      sessionId,
    };
  }
}
