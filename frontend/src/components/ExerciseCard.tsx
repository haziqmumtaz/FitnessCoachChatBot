import React, { useState } from "react";
import type { DetailedExercise } from "../types/api";

interface ExerciseCardProps {
  exercise: DetailedExercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "0.75rem",
        padding: "1rem",
        margin: "0.75rem 0",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(229, 231, 235, 0.8)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#111827",
            flex: 1,
          }}
        >
          {exercise.name}
        </h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "0.375rem",
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
            color: "#1d4ed8",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#dbeafe";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#eff6ff";
          }}
        >
          {showInstructions ? "Hide Steps" : "Show Steps"}
        </button>
      </div>

      {/* Exercise GIF */}
      <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
        <img
          src={exercise.gifUrl}
          alt={exercise.name}
          style={{
            width: "100%",
            maxWidth: "20rem",
            margin: "0 auto",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>

      {/* Exercise Details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        {/* Target Muscles */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Target Muscles
          </div>
          <div style={{ fontSize: "0.875rem", color: "#374151" }}>
            {exercise.targetMuscles.join(", ")}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Equipment
          </div>
          <div style={{ fontSize: "0.875rem", color: "#374151" }}>
            {exercise.equipments.join(", ")}
          </div>
        </div>

        {/* Body Parts */}
        <div>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Body Parts
          </div>
          <div style={{ fontSize: "0.875rem", color: "#374151" }}>
            {exercise.bodyParts.join(", ")}
          </div>
        </div>
      </div>

      {/* Secondary Muscles */}
      {exercise.secondaryMuscles.length > 0 && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            Secondary Muscles
          </div>
          <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            {exercise.secondaryMuscles.join(", ")}
          </div>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && (
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            marginTop: "0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "0.5rem",
            }}
          >
            Step-by-Step Instructions:
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.25rem",
              fontSize: "0.875rem",
              lineHeight: "1.6",
              color: "#374151",
            }}
          >
            {exercise.instructions.map((instruction, index) => (
              <li key={index} style={{ marginBottom: "0.25rem" }}>
                {instruction.replace(/^Step:\d+\s*/, "")}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Workout Details (if available) */}
      {(exercise.sets || exercise.reps || exercise.rest) && (
        <div
          style={{
            backgroundColor: "#f0fdf4",
            borderRadius: "0.375rem",
            padding: "0.5rem",
            marginTop: "0.75rem",
            border: "1px solid #bbf7d0",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#166534",
              marginBottom: "0.25rem",
            }}
          >
            Workout Details
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            {exercise.sets && (
              <span>
                <strong>Sets:</strong> {exercise.sets}
              </span>
            )}
            {exercise.reps && (
              <span>
                <strong>Reps:</strong> {exercise.reps}
              </span>
            )}
            {exercise.rest && (
              <span>
                <strong>Rest:</strong> {exercise.rest}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
