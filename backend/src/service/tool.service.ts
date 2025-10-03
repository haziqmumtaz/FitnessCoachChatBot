import axios from "axios";
import { ExerciseDBExercise, ExerciseDBResponse } from "../types/chat";
import config from "../config";

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
        threshold: params.threshold || 0.7, // Default fuzzy threshold
      };

      console.log("queryparams", queryParams);

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

  /**
   * Convert ExerciseDB exercise to our WorkoutPlan exercise format
   */
  convertToWorkoutExercise(
    exercise: ExerciseDBExercise,
    sets: number = 3,
    reps: string = "10-15",
    rest: string = "30-60s"
  ): any {
    return {
      name: exercise.name,
      sets: sets,
      reps: reps,
      rest: rest,
      instructions: exercise.instructions.join(" "),
      targetMuscle: exercise.target,
      gifUrl: exercise.gifUrl,
      equipment: exercise.equipment,
      secondaryMuscles: exercise.secondaryMuscles,
    };
  }

  /**
   * Generate workout exercises using fuzzy search
   * Builds a search query from the provided parameters
   */
  async getWorkoutExercises(params: {
    targetMuscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    numExercises?: number;
    search?: string;
  }): Promise<ExerciseDBExercise[]> {
    try {
      // Build a comprehensive search query from all parameters
      const searchTerms: string[] = [];

      if (params.search) {
        searchTerms.push(params.search);
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

      // Create a single search query
      const searchQuery = searchTerms.join(" ");

      const exercises = await this.getFuzzySearchExercises({
        searchQuery: searchQuery,
        limit: params.numExercises || 8,
      });

      console.log("ExerciseDB response:", exercises.data.length);

      return exercises.data.slice(0, params.numExercises || 8);
    } catch (error: any) {
      console.error("Error generating workout exercises:", error.message);
      return [];
    }
  }
}
