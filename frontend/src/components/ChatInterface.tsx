import { useState, useRef, useEffect } from "react";
import { chatApi } from "../api/chat";
import type { ChatMessage } from "../types/api";
import MarkdownRenderer from "./MarkdownRenderer";
import ExerciseCard from "./ExerciseCard";
import { condenseConversationHistory } from "../utils/conversationCondenser";
import QuickActionButton from "./QuickActionButton";

interface ChatInterfaceProps {
  className?: string;
}

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
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        message: inputValue.trim(),
        model: selectedModel,
        conversationHistory: condenseConversationHistory(messages),
        sessionId: sessionId || undefined,
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.coachTalk,
        detailedExercises: response.detailedExercises,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to send message"
      );

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble processing your request. Please try again.",
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
    "I want a 20 minute full body workout",
    "Create a beginner's routine",
    "Upper body exercise plan",
    "What equipment do I need?",
  ];

  const sendQuickMessage = (message: string) => {
    setInputValue(message);
  };

  return (
    <div
      className={className}
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: "1.5rem 2rem",
          backgroundColor: "white",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1a1a1a",
                letterSpacing: "-0.025em",
              }}
            >
              Tyson Training Coach
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#666666",
                fontWeight: "normal",
              }}
            >
              Your personal training assistant
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              color: "#374151",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {availableModels?.map((model) => (
              <option key={model} value={model}>
                {model.replace("openai/", "").replace("gpt-", "GPT-")}
              </option>
            ))}
          </select>

          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              backgroundColor: messages.length === 0 ? "#f3f4f6" : "#fef3c7",
              color: messages.length === 0 ? "#9ca3af" : "#374151",
              border: "none",
              cursor: messages.length === 0 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = "#fde68a";
              }
            }}
            onMouseLeave={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = "#fef3c7";
              }
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
              <p style={{ transition: "0.5s" }}>Hi there!</p>
              <p>I'm Tyson, your fitness coach assistant.</p>
              <p>How can I help?</p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                Try out some quick actions below
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
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: "0.5rem",
                              justifyContent: "center",
                            }}
                          >
                            {message.detailedExercises.map(
                              (exercise, index) => (
                                <ExerciseCard
                                  key={exercise.exerciseId || index}
                                  exercise={exercise}
                                />
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
                  Tyson is thinking...
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
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(63, 50, 50, 0.8)",
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
