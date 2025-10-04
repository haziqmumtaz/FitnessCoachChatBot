import { useRef, useEffect } from "react";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import type { DetailedExercise, ChatMessage } from "../../../types/api";
import ExerciseCard from "./ExerciseCard";

interface MessagesSectionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  streamingStatus?: string | null;
  isMobile: boolean;
}

export const MessagesSection = ({
  messages,
  isLoading,
  streamingStatus,
  isMobile,
}: MessagesSectionProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      style={{
        flex: messages.length > 0 ? 1 : 0,
        overflowY: "auto",
        padding: isMobile ? "1rem" : "1.5rem 2rem",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? "0.75rem" : "1rem",
        backgroundColor: "transparent",
      }}
    >
      {messages.map((message, index) => {
        return (
          <div
            key={index}
            className="animate-slide-up-fade"
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: isMobile ? "90%" : "80%",
            }}
          >
            <div
              style={{
                background: message.role === "user" ? "#C3E906" : "white",
                padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
                borderRadius: "16px",
                border:
                  message.role === "user"
                    ? "1px solid rgba(59, 130, 246, 0.2)"
                    : "1px solid rgba(0, 0, 0, 0.1)",
                boxShadow:
                  message.role === "user"
                    ? "none"
                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "0.875rem" : "0.95rem",
                  lineHeight: "1.5",
                }}
              >
                <MarkdownRenderer content={message.content} />

                {/* Show detailed exercises */}
                {message.detailedExercises &&
                  message.detailedExercises.length > 0 && (
                    <div style={{ marginTop: "1rem" }}>
                      <h4
                        style={{
                          margin: "0 0 0.75rem 0",
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: "rgba(0, 0, 0, 0.9)",
                        }}
                      >
                        Exercise Details
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: isMobile
                            ? "1fr"
                            : "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: isMobile ? "0.75rem" : "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        {message.detailedExercises.map(
                          (exercise: DetailedExercise, index: number) => (
                            <div
                              key={exercise.exerciseId || index}
                              className="animate-slide-up-fade"
                            >
                              <ExerciseCard exercise={exercise} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div
          className="animate-slide-up-fade"
          style={{
            alignSelf: "flex-start",
            maxWidth: isMobile ? "90%" : "80%",
          }}
        >
          <div
            style={{
              background: "white",
              padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
              borderRadius: "16px",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.9rem",
                fontStyle: "italic",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(0, 0, 0, 0.2)",
                  borderTop: "2px solid rgba(0, 0, 0, 0.6)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              {streamingStatus || "Tyson is thinking..."}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
