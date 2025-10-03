import { injectable } from "inversify";
import { container } from "../config/container";
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  Guardrail,
  WorkoutIntent,
  WorkoutPlan,
  ToolCall,
  Tool,
  DetailedExercise,
} from "../types/chat";
import { TYPES } from "../types/di";
import { IIntentService } from "./intent.service";
import { IModelProvider } from "./model.provider";
import { ToolService } from "./tool.service";

export interface IChatService {
  chat(request: ChatRequest): Promise<ChatResponse>;
}

@injectable()
export class ChatService implements IChatService {
  private readonly modelProvider: IModelProvider;
  private readonly toolService: ToolService;
  private readonly intentService: IIntentService;
  private readonly systemPrompt: string;

  constructor() {
    this.modelProvider = container.get<IModelProvider>(TYPES.ModelProvider);
    this.toolService = container.get<ToolService>(TYPES.ToolService);
    this.intentService = container.get<IIntentService>(TYPES.IntentService);
    this.systemPrompt = this.buildSystemPrompt();
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const sessionId = request.sessionId || this.generateSessionId();

      // STEP 1: Intent Detection
      const intentDetection = await this.intentService.detectIntent(
        request.message,
        request.conversationHistory
      );

      // STEP 2: Check guardrails first
      if (intentDetection.guardrail.violation) {
        return await this.handleGuardrailViolation(
          request,
          sessionId,
          intentDetection.guardrail
        );
      }

      // STEP 3: Handle based on intent
      if (
        !intentDetection.shouldCallTools &&
        intentDetection.intent.type == "clarification_needed"
      ) {
        // Clarification needed - ask for more fitness details
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
    request: ChatRequest,
    sessionId: string,
    guardrail: Guardrail
  ): Promise<ChatResponse> {
    // Handle general non-fitness queries only (injuries are now handled in workout generation)
    const message = `I'm a fitness coach AI focused specifically on exercise guidance and workout plans. I can't help with topics outside of fitness and exercise.

**I can help you with:**

*   Workout plans and routines
*   Exercise demonstrations and instructions
*   Fitness education and tips
*   Equipment recommendations
*   Training schedules

Feel free to ask me about workouts, exercises, or fitness goals!`;

    return {
      coachTalk: message,
      model: "guardrail",
      sessionId,
    };
  }

  private async handleClarification(
    sessionId: string,
    intent: WorkoutIntent
  ): Promise<ChatResponse> {
    const missingParams = intent.missingParams || [];
    let message =
      "I'd love to help you create a workout plan! Here's what I need to know:\n\n";

    if (missingParams.includes("duration")) {
      message +=
        "• **How much time** do you have? (e.g., 20 minutes, 45 minutes)\n";
    }
    if (missingParams.includes("equipment")) {
      message +=
        "• **What equipment** do you have access to? (dumbbells, barbell, bodyweight, etc.)\n";
    }
    if (missingParams.includes("targetMuscles")) {
      message +=
        "• **Which muscle groups** do you want to target? (chest, legs, arms, full body)\n";
    }

    message +=
      "\nLet me know these details and I'll create a perfect workout plan for you!";

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
    // Build structured workout prompt based on detected intent
    const workoutPrompt = this.buildStructuredWorkoutPrompt(intent);

    const messages: ChatMessage[] = [
      { role: "system", content: workoutPrompt },
      ...(request.conversationHistory || []),
      { role: "user", content: request.message },
    ];

    // Get available tools schema
    const availableTools = this.getAvailableTools();

    // Get response from model provider with tools
    const modelResponse = await this.modelProvider.chat(messages, {
      temperature: 0.7,
      maxTokens: 1000,
      model: request.model,
      tools: availableTools,
      toolChoice: "auto",
    });

    // console.log(modelResponse.toolCalls, modelResponse.toolChoice);

    // Handle tool calls if any
    if (modelResponse.toolCalls && modelResponse.toolCalls.length > 0) {
      const toolResults = await this.processToolCalls(modelResponse.toolCalls);

      // Add tool results to the conversation
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
      const finalResponse = await this.modelProvider.chat(messages, {
        temperature: 0.7,
        maxTokens: 800,
        model: request.model,
      });

      const { workoutPlan, coachTalk } = this.parseModelResponse(
        finalResponse.content
      );

      // Extract detailed exercises from tool results
      const detailedExercises: DetailedExercise[] = [];
      for (const toolResult of toolResults) {
        if (toolResult.result && Array.isArray(toolResult.result)) {
          detailedExercises.push(...toolResult.result);
        }
      }

      // Add confirmation question for workout plans
      const responseWithConfirmation = workoutPlan
        ? `${coachTalk}\n\n**How does this look? Want to adjust anything?**`
        : coachTalk;

      return {
        workoutPlan,
        detailedExercises,
        coachTalk: responseWithConfirmation,
        model: finalResponse.model,
        sessionId,
      };
    }

    // If no tool calls, parse direct response
    const { workoutPlan, coachTalk } = this.parseModelResponse(
      modelResponse.content
    );

    const responseWithConfirmation = workoutPlan
      ? `${coachTalk}\n\n**How does this look? Want to adjust anything?**`
      : coachTalk;

    return {
      workoutPlan,
      detailedExercises: [], // No exercises when no tool calls
      coachTalk: responseWithConfirmation,
      model: modelResponse.model,
      sessionId,
    };
  }

  private buildStructuredWorkoutPrompt(intent: WorkoutIntent): string {
    const params = intent.extractedParams || {};

    return `You are an AI fitness coach assistant creating structured workout plans with rich markdown formatting.

            DETECTED USER INTENT:
            - Type: ${intent.type}
            - Confidence: ${intent.confidence}
            - Extracted Parameters: ${JSON.stringify(params, null, 2)}

            AVAILABLE TOOLS:
            get_workout_exercises(targetMuscles?, bodyParts?, equipment?, search?, numExercises?) - Get filtered exercises from ExerciseDB

            WORKOUT PLAN CREATION PROCESS:
            1. Use the extracted parameters to call the get_workout_exercises tool
            2. Create a structured workout plan with real exercises
            3. If avoidMuscles is specified, MODIFY the exercises to avoid problematic areas
            4. Add injury safety warnings if injuryDescription is present
            5. Format the response using markdown for rich presentation
            6. Always end with: "How does this look? Want to adjust anything?"

            INJURY SAFETY HANDLING:
            - If avoidMuscles array exists, analyze exercises and substitute/modify unsafe ones
            - Add prominent safety warnings at the top of the workout
            - Suggest specific modifications: reduce range of motion, lower weights, alternative exercises
            - Always include: "⚠️ Listen to your body and stop if pain increases. Consult healthcare provider for persistent symptoms."

            RESPONSE FORMATTING REQUIREMENTS:
            - Use markdown headings (##, ###) to structure sections
            - Use **bold** for emphasis on important points
            - Use tables for workout frequency, session layout, and exercise details
            - Use > blockquotes for important rules or tips
            - Use bullet points (-) for instructions and lists
            - Use code blocks (\`\`\`json) for the structured workout plan
            - Use italic (*text*) for disclaimers

            EXAMPLE MARKDOWN STRUCTURE:

            ## [Workout Type] Blueprint

            *(Suitable for beginner-intermediate fitness level. Adjust weight, sets, or reps to match your current strength).*

            ### How Often?
            | Goal | Sessions/week | Sample Split |
            |---|---|---|
            | **General strength** | 2x/week | **Mon - Upper**, **Thur - Lower** |
            | **Build muscle** | 3x/week | **Mon - Upper**, **Wed - Lower**, **Fri - Upper** |

            ### Session Layout (≈45-60 min)
            | Phase | Time | What to Do |
            |---|---|---|
            | **Warm-up** | 5-10 min | Light cardio + dynamic drills |
            | **Main Lifts** | 30-35 min | 4-5 exercises covering major muscle groups |
            | **Cool-down** | 5-10 min | Static stretching and breathing |

            > **Recovery rule:** Give each muscle group at least **48 hours** before training it again.

            ### Your Custom [Workout Type] Plan
            Use the exercise data from tools to create exercises with sets, reps, and instructions.

            Always end with: "How does this look? Want to adjust anything?"

            Be encouraging, use proper markdown formatting, and customize based on the user's specific parameters.`;
  }

  private buildSystemPrompt(): string {
    return `You are an AI fitness coach assistant. Your role is to help users create personalized workout plans and provide fitness guidance.

            AVAILABLE TOOLS:
            You have access to real exercise data through the ExerciseDB filter API via this tool function:

            get_workout_exercises(targetMuscles?, bodyParts?, equipment?, search?, numExercises?) - Get filtered exercises from ExerciseDB

            WHEN TO USE TOOLS:
            - Always use this tool when users ask for exercises, workouts, or muscle-specific training
            - Extract workout parameters from user input and call the tool with appropriate filters
            - This single tool can filter by multiple muscles, body parts, equipment, and search terms

            WORKOUT PLAN CREATION PROCESS:
            1. Extract workout parameters from user input (target muscles, equipment, intensity, duration)
            2. Call get_workout_exercises with extracted parameters to get real exercise data
            3. Create a structured workout plan using the filtered exercises from ExerciseDB
            4. Provide motivational coaching guidance

            IMPORTANT:
            - You will receive tool call results in your conversation context
            - Use the exercise data from tool results to create comprehensive workout plans
            - Do NOT mention or reference the tool calls in your final response to the user
            - Only provide the workout plan JSON and motivational coach talk

            FORMATTING REQUIREMENTS:
            When presenting workout results, include BOTH:
            1. A structured JSON workout plan (using real exercise names and proper instructions)
            2. Clean motivational coach talk (without any tool call references)

            WORKOUT PLAN FORMAT:
            \`\`\`json
            {
              "exercises": [
                {
                  "name": "Exercise Name",
                  "sets": 3,
                  "reps": "10-15", 
                  "rest": "30-60s",
                  "instructions": "Detailed form instructions",
                  "targetMuscle": "primary muscle group"
                }
              ],
              "totalDuration": 20,
              "equipment": ["dumbbells"],
              "targetMuscles": ["chest", "triceps"],
              "instructions": "Complete workout guidance including warmup and cooldown"
            }
            \`\`\`

            GUIDELINES:
            - Always call tools when users request exercises or workouts
            - Use real exercise names and proper form descriptions from the API
            - Adapt sets/reps based on user fitness level
            - Include warm-up and cool-down recommendations
            - Encourage proper form over intensity
            - Be encouraging and supportive
            - Ask clarifying questions if workout parameters are unclear

            Respond in a friendly, motivational tone while being informative and safe.`;
  }

  private parseModelResponse(response: string): {
    workoutPlan?: WorkoutPlan;
    coachTalk: string;
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const workoutPlan = JSON.parse(jsonMatch[1]);
        // Remove the JSON from the coach talk
        const coachTalk = response
          .replace(/```json\s*[\s\S]*?\s*```/, "")
          .trim();
        return { workoutPlan, coachTalk };
      }
    } catch (error) {
      console.error("Failed to parse workout plan from response:", error);
    }

    // If no JSON found or parsing failed, return the full response as coach talk
    return { coachTalk: response };
  }

  private generateFallbackResponse(sessionId: string): ChatResponse {
    return {
      coachTalk:
        "I'm having trouble processing your request right now. Please try again in a moment, or let me know if you'd like help with a specific workout!",
      model: "fallback",
      sessionId,
    };
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        type: "function",
        function: {
          name: "get_workout_exercises",
          description:
            "Get filtered exercises for a workout plan using ExerciseDB filter endpoint",
          parameters: {
            type: "object",
            properties: {
              targetMuscles: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of target muscle groups (e.g., ['chest', 'biceps', 'triceps'])",
              },
              bodyParts: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of body parts (e.g., ['upper arms', 'chest', 'back'])",
              },
              equipment: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of available equipment (e.g., ['dumbbell', 'barbell', 'body weight'])",
              },
              search: {
                type: "string",
                description:
                  "Optional search term (e.g., 'chest workout', 'beginner routine')",
              },
              numExercises: {
                type: "integer",
                description: "Number of exercises to return (default: 8)",
              },
            },
            required: [],
          },
        },
      },
    ];
  }

  private async processToolCalls(
    toolCalls: ToolCall[]
  ): Promise<{ toolCallId: string; result: any }[]> {
    const results: { toolCallId: string; result: any }[] = [];

    for (const toolCall of toolCalls) {
      try {
        console.log(
          `Processing tool call: ${toolCall.function.name} with args: ${toolCall.function.arguments}`
        );

        const args = JSON.parse(toolCall.function.arguments);
        let result;

        switch (toolCall.function.name) {
          case "get_workout_exercises":
            result = await this.toolService.getWorkoutExercises({
              targetMuscles: args.targetMuscles,
              bodyParts: args.bodyParts,
              equipment: args.equipment,
              numExercises: args.numExercises,
              search: args.search,
            });
            break;

          default:
            result = { error: `Unknown tool: ${toolCall.function.name}` };
        }

        results.push({
          toolCallId: toolCall.id,
          result: result,
        });
      } catch (error: any) {
        console.error(
          `Error processing tool call ${toolCall.function.name}:`,
          error.message
        );
        results.push({
          toolCallId: toolCall.id,
          result: { error: `Failed to execute tool: ${error.message}` },
        });
      }
    }

    return results;
  }
}
