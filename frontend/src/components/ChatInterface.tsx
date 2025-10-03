import { useState, useRef, useEffect } from "react";
import { chatApi } from "../api/chat";
import type { ChatMessage, WorkoutPlan } from "../types/api";
import MarkdownRenderer from "./MarkdownRenderer";

interface ChatInterfaceProps {
  className?: string;
}

const WorkoutPlanCard = ({ workoutPlan }: { workoutPlan: WorkoutPlan }) => (
  <div
    style={{
      background: "rgba(34, 197, 94, 0.1)",
      border: "1px solid rgba(34, 197, 94, 0.2)",
      borderRadius: "12px",
      padding: "1rem",
      marginTop: "0.5rem",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.75rem",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          background: "rgba(34, 197, 94, 0.2)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "0.5rem",
        }}
      >
        <span style={{ fontSize: "12px", color: "rgba(34, 197, 94, 0.8)" }}>
          💪
        </span>
      </div>
      <h4
        style={{
          margin: 0,
          color: "rgba(0, 0, 0, 0.9)",
          fontSize: "1rem",
          fontWeight: "600",
        }}
      >
        Workout Plan
      </h4>
    </div>

    <div style={{ marginBottom: "0.75rem" }}>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.8)",
          marginBottom: "0.5rem",
        }}
      >
        <span>⏱️ {workoutPlan.totalDuration} min</span>
        <span>🎯 {workoutPlan.targetMuscles.join(", ")}</span>
        <span>🏋️ {workoutPlan.equipment.join(", ") || "no equipment"}</span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "0.875rem",
          color: "rgba(0, 0, 0, 0.7)",
          lineHeight: 1.4,
        }}
      >
        {workoutPlan.instructions}
      </p>
    </div>

    <div>
      <h5
        style={{
          margin: "0 0 0.5rem 0",
          color: "rgba(0, 0, 0, 0.9)",
          fontSize: "0.875rem",
          fontWeight: "600",
        }}
      >
        Exercises:
      </h5>
      {workoutPlan.exercises.map((exercise, index) => (
        <div
          key={index}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "0.75rem",
            marginBottom: "0.5rem",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              minWidth: "32px",
              height: "32px",
              background: "rgba(34, 197, 94, 0.2)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            <h6
              style={{
                margin: "0 0 0.25rem 0",
                color: "rgba(0, 0, 0, 0.9)",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              {exercise.name}
            </h6>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.75rem",
                color: "rgba(0, 0, 0, 0.7)",
                marginBottom: "0.25rem",
              }}
            >
              <span>Sets: {exercise.sets}</span>
              <span>Reps: {exercise.reps}</span>
              <span>Rest: {exercise.rest}</span>
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "0.75rem",
                color: "rgba(0, 0, 0, 0.6)",
                lineHeight: 1.3,
              }}
            >
              {exercise.instructions}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionButton = ({
  text,
  onClick,
  disabled = false,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      background: disabled ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.9)",
      border: disabled
        ? "1px solid rgba(0, 0, 0, 0.05)"
        : "1px solid rgba(0, 0, 0, 0.15)",
      borderRadius: "8px",
      color: disabled ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.9)",
      padding: "0.5rem 0.75rem",
      fontSize: "0.875rem",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      whiteSpace: "nowrap",
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255, 255, 255, 1)";
        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
        e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.15)";
      }
    }}
  >
    {text}
  </button>
);

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(
    "openai/gpt-oss-120b"
  );
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelsData = await chatApi.getAvailableModels();
        setAvailableModels(modelsData.models);
        setSelectedModel(modelsData.defaultModel);
      } catch (err) {
        console.error("Failed to load models:", err);
      }
    };
    loadModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        message: inputValue.trim(),
        model: selectedModel,
        conversationHistory: messages,
        sessionId: sessionId || undefined,
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.coachTalk,
        timestamp: response.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (response.workoutPlan) {
        const workoutMessage: ChatMessage = {
          role: "assistant",
          content: `Workout Plan:\n\n${JSON.stringify(
            response.workoutPlan,
            null,
            2
          )}`,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, workoutMessage]);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to send message"
      );

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  };

  const quickActions = [
    "I want a 20 minute workout",
    "Create a beginner's routine",
    "Upper body exercise plan",
    "What equipment do I need?",
  ];

  const sendQuickMessage = (message: string) => {
    setInputValue(message);
  };

  const parseWorkoutPlan = (content: string): WorkoutPlan | null => {
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f5f5f5",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem 2rem",
          backgroundColor: "white",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Logo and title */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1
              style={{
                margin: 0,
                color: "rgba(0, 0, 0, 0.9)",
                fontSize: "1.5rem",
                fontWeight: "700",
                letterSpacing: "-0.2px",
              }}
            >
              FITNESS COACH AI
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.875rem",
                fontWeight: "400",
              }}
            >
              Your personal training assistant
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              background: "white",
              border: "1px solid rgba(0, 0, 0, 0.15)",
              borderRadius: "8px",
              color: "rgba(0, 0, 0, 0.8)",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model.replace("openai/", "").replace("gpt-", "GPT-")}
              </option>
            ))}
          </select>

          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            style={{
              background:
                messages.length === 0
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(255, 193, 7, 0.8)",
              border: "none",
              borderRadius: "8px",
              color:
                messages.length === 0
                  ? "rgba(0, 0, 0, 0.3)"
                  : "rgba(0, 0, 0, 0.8)",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: messages.length === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>↻</span>
            New chat
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Welcome message when no chat */}
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "2rem",
              padding: "2rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  color: "rgba(0, 0, 0, 0.8)",
                }}
              >
                Hi there! I'm your support assistant. How can I help?
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                Chat with your AI fitness coach
              </p>
            </div>

            {/* Quick action buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                width: "100%",
                maxWidth: "600px",
              }}
            >
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  text={action}
                  onClick={() => sendQuickMessage(action)}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
        )}

        {/* Messages section */}
        <div
          style={{
            flex: messages.length > 0 ? 1 : 0,
            overflowY: "auto",
            padding: "1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor:
              messages.length > 0 ? "transparent" : "transparent",
          }}
        >
          {messages.map((message, index) => {
            const workoutPlan = parseWorkoutPlan(message.content);
            return (
              <div
                key={index}
                style={{
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div
                  style={{
                    background:
                      message.role === "user"
                        ? "rgba(59, 130, 246, 0.1)"
                        : "white",
                    padding: "1rem 1.25rem",
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
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {workoutPlan ? (
                      <>
                        <MarkdownRenderer
                          content={message.content
                            .replace(/```json\s*[\s\S]*?\s*```/g, "")
                            .trim()}
                        />
                        {workoutPlan && (
                          <WorkoutPlanCard workoutPlan={workoutPlan} />
                        )}
                      </>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                  </div>
                  {message.timestamp && (
                    <div
                      style={{
                        color: "rgba(0, 0, 0, 0.4)",
                        fontSize: "0.75rem",
                        marginTop: "0.5rem",
                        textAlign: "right",
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
              <div
                style={{
                  background: "white",
                  padding: "1rem 1.25rem",
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
                  Coach is thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "0.75rem 2rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderTop: "1px solid rgba(239, 68, 68, 0.2)",
            color: "rgba(239, 68, 68, 0.8)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          padding: "1.5rem 2rem",
          backgroundColor: "white",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          flexShrink: 0,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: "rgba(0, 0, 0, 0.02)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "24px",
                color: "rgba(0, 0, 0, 0.8)",
                padding: "0.875rem 1rem",
                fontSize: "0.9rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(59, 130, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{
                background:
                  isLoading || !inputValue.trim()
                    ? "rgba(0, 0, 0, 0.05)"
                    : "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "50%",
                color: "white",
                width: "48px",
                height: "48px",
                fontSize: "18px",
                cursor:
                  isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
              ) : (
                "↗"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
