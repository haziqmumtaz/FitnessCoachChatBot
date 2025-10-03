import { injectable, inject } from "inversify";
import { ToolService } from "./tool.service";
import { TYPES } from "../types/di";
import {
  ToolCall,
  ModelProviderOptions,
  ChatMessage,
  Tool,
} from "../types/chat";

export interface IToolOrchestrator {
  processToolCalls(toolCalls: ToolCall[]): Promise<any[]>;
  getAvailableTools(): Tool[];
}

@injectable()
export class ToolOrchestrator implements IToolOrchestrator {
  private readonly toolService: ToolService;

  constructor(@inject(TYPES.ToolService) toolService: ToolService) {
    this.toolService = toolService;
  }

  async processToolCalls(toolCalls: ToolCall[]): Promise<any[]> {
    const results = [];

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
          result: { error: error.message },
        });
      }
    }

    return results;
  }

  getAvailableTools(): Tool[] {
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
}
