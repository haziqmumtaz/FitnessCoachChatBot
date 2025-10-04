import React, { useState } from "react";
import type { DetailedExercise } from "../../../types/api";
import { stringToTitleCase } from "../../../utils/string";

interface ExerciseCardProps {
  exercise: DetailedExercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "0.5rem",
        padding: "0.75rem",
        margin: "0.5rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "1px solid rgba(229, 231, 235, 0.8)",
        width: "100%",
        maxWidth: "300px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "1.125rem",
            fontWeight: "600",
            color: "#111827",
            flex: 1,
            lineHeight: "1.2",
          }}
        >
          {stringToTitleCase(exercise.name)}
        </h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          style={{
            backgroundColor: "#C3E906",
            border: "1px solid #C3E906",
            borderRadius: "0.25rem",
            padding: "0.125rem 0.375rem",
            fontSize: "0.75rem",
            color: "black",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#C3E906";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#C3E906";
          }}
        >
          {showInstructions ? "Hide" : "Steps"}
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
        <img
          src={exercise.gifUrl}
          alt={stringToTitleCase(exercise.name)}
          style={{
            width: "100%",
            maxWidth: "15rem",
            objectFit: "cover",
            margin: "0 auto",
            borderRadius: "0.375rem",
            boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.375rem",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.125rem",
            }}
          >
            Target
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#374151", lineHeight: "1.2" }}
          >
            {stringToTitleCase(exercise.targetMuscles.join(", "))}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: "600",
              color: "#6b7280",
              marginBottom: "0.125rem",
            }}
          >
            Equipment
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#374151", lineHeight: "1.2" }}
          >
            {stringToTitleCase(exercise.equipments.join(", "))}
          </div>
        </div>
      </div>

      {showInstructions && (
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "0.375rem",
            padding: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "0.375rem",
            }}
          >
            Instructions:
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: "1rem",
              fontSize: "0.8rem",
              lineHeight: "1.4",
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
    </div>
  );
};

export default ExerciseCard;
