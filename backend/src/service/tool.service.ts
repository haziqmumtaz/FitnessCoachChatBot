import axios from "axios";
import {
  ExerciseDBExercise,
  ExerciseDBResponse,
  Tool,
  ToolCall,
} from "../types/chat";

export class ToolService {
  private readonly exerciseDBBaseURL = "https://www.exercisedb.dev/api/v1";

  /**
   * Get exercises using ExerciseDB fuzzy search API
   * Uses fuzzy matching across all fields (name, muscles, equipment, body parts)
   */
  async getFuzzySearchExercises(params: {
    searchQuery: string;
    limit?: number;
    offset?: number;
    threshold?: number;
  }): Promise<ExerciseDBResponse> {
    try {
      const queryParams: any = {
        offset: params.offset || 0,
        limit: Math.min(params.limit || 10, 25), // API max is 25
        q: params.searchQuery,
        threshold: params.threshold || 0.5, // Default fuzzy threshold
      };

      const response = await axios.get(
        `${this.exerciseDBBaseURL}/exercises/search`,
        {
          params: queryParams,
        }
      );

      return response.data || {};
    } catch (error: any) {
      console.error(`Error fetching fuzzy search exercises:`, error.message);

      return {
        success: false,
        metadata: {
          totalPages: 0,
          totalExercises: 0,
          currentPage: 0,
          previousPage: null,
          nextPage: null,
        },
        data: [],
      };
    }
  }

  async getWorkoutExercises(params: {
    targetMuscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    numExercises?: number;
    search?: string;
    isVariationRequest?: boolean;
    previousExerciseContext?: string;
  }): Promise<ExerciseDBExercise[]> {
    try {
      const searchTerms: string[] = [];

      if (params.search) {
        searchTerms.push(params.search);
      }

      if (params.isVariationRequest) {
        searchTerms.push("variation", "alternative", "different");

        if (params.previousExerciseContext) {
          const previousMuscles = params.previousExerciseContext.toLowerCase();
          if (previousMuscles.includes("chest")) {
            searchTerms.push("upper body", "shoulders", "triceps");
          }
          if (previousMuscles.includes("legs")) {
            searchTerms.push("lower body", "glutes", "calves");
          }
        }
      }

      if (params.targetMuscles && params.targetMuscles.length > 0) {
        searchTerms.push(...params.targetMuscles);
      }

      if (params.bodyParts && params.bodyParts.length > 0) {
        searchTerms.push(...params.bodyParts);
      }

      if (params.equipment && params.equipment.length > 0) {
        searchTerms.push(...params.equipment);
      }

      const searchQuery = searchTerms.join(" ");

      const exercises = await this.getFuzzySearchExercises({
        searchQuery: searchQuery,
        limit: params.numExercises || 8,
      });

      return exercises.data.slice(0, params.numExercises || 8);
    } catch (error: any) {
      console.error("Error generating workout exercises:", error.message);
      return [];
    }
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
              isVariationRequest: {
                type: "boolean",
                description:
                  "Whether this is a request for exercise variations",
              },
              previousExerciseContext: {
                type: "string",
                description:
                  "Context about previously provided exercises for variation requests",
              },
            },
            required: [],
          },
        },
      },
    ];
  }

  async processToolCalls(
    toolCalls: ToolCall[]
  ): Promise<{ toolCallId: string; result: any }[]> {
    const results: { toolCallId: string; result: any }[] = [];

    for (const toolCall of toolCalls) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        let result;

        switch (toolCall.function.name) {
          case "get_workout_exercises":
            result = await this.getWorkoutExercises({
              targetMuscles: args.targetMuscles,
              bodyParts: args.bodyParts,
              equipment: args.equipment,
              numExercises: args.numExercises,
              search: args.search,
              isVariationRequest: args.isVariationRequest,
              previousExerciseContext: args.previousExerciseContext,
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
