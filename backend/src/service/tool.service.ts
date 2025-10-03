import axios from "axios";
import { ExerciseDBExercise, ExerciseDBResponse } from "../types/chat";
import config from "../config";
import {
  validateAndMapMuscles,
  validateAndMapEquipment,
  validateAndMapBodyParts,
} from "../constants/exercisedb";

export class ToolService {
  private readonly exerciseDBBaseURL = "https://www.exercisedb.dev/api/v1";

  /**
   * Get filtered exercises using the ExerciseDB filter endpoint
   * Example: /api/v1/exercises/filter?offset=0&limit=10&search=chest%20workout&muscles=chest%2Ctriceps&equipment=dumbbell%2Cbarbell&bodyParts=upper%20arms%2Cchest&sortBy=name&sortOrder=desc
   */
  async getFilteredExercises(params: {
    search?: string;
    muscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    limit?: number;
    offset?: number;
  }): Promise<ExerciseDBResponse> {
    try {
      const queryParams: any = {
        offset: params.offset || 0,
        limit: params.limit || 10,
        sortBy: "name",
        sortOrder: "asc",
      };

      // Add optional filters
      if (params.search) {
        queryParams.search = params.search;
      }

      if (params.muscles && params.muscles.length > 0) {
        queryParams.muscles = params.muscles.join(",");
      }

      if (params.bodyParts && params.bodyParts.length > 0) {
        queryParams.bodyParts = params.bodyParts.join(",");
      }

      if (params.equipment && params.equipment.length > 0) {
        queryParams.equipment = params.equipment.join(",");
      }

      const response = await axios.get(
        `${this.exerciseDBBaseURL}/exercises/filter`,
        {
          params: queryParams,
        }
      );

      return response.data || {};
    } catch (error: any) {
      console.error(`Error fetching filtered exercises:`, error.message);

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
   * Generate workout exercises using the filter endpoint
   */
  async getWorkoutExercises(params: {
    targetMuscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    numExercises?: number;
    search?: string;
  }): Promise<ExerciseDBExercise[]> {
    try {
      // Validate and map user input to ExerciseDB format
      const muscles = params.targetMuscles
        ? validateAndMapMuscles(params.targetMuscles)
        : undefined;

      const bodyParts = params.bodyParts
        ? validateAndMapBodyParts(params.bodyParts)
        : undefined;

      const equipment = params.equipment
        ? validateAndMapEquipment(params.equipment)
        : undefined;

      const exercises = await this.getFilteredExercises({
        search: params.search,
        muscles,
        bodyParts,
        equipment,
        limit: params.numExercises || 8,
      });

      console.log("Mapped parameters:", {
        originalParams: params,
        muscles,
        bodyParts,
        equipment,
      });
      console.log("ExerciseDB response:", exercises.data.length);

      return exercises.data.slice(0, params.numExercises || 8);
    } catch (error: any) {
      console.error("Error generating workout exercises:", error.message);
      return [];
    }
  }
}
