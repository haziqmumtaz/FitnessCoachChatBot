import { useEffect, useRef, useState } from "react";
import tyson from "../../assets/tyson_logo.png";
import MarkdownRenderer from "../../components/MarkdownRenderer";
import QuickActionButton from "../../components/QuickActionButton";
import type { DetailedExercise } from "../../types/api";
import { condenseConversationHistory } from "../../utils/conversationCondenser";
import { useChat, useModels } from "./api";
import ExerciseCard from "./components/ExerciseCard";

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom hooks for chat and models
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();

  const { availableModels, selectedModel, setSelectedModel } = useModels();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(
      inputValue.trim(),
      selectedModel,
      condenseConversationHistory(messages)
    );
    setInputValue("");
  };

  const quickActions = [
    "Create a 30-minute upper body workout.",
    "Give me a 45-minute leg workout.",
    "Make a 60-minute full body workout.",
    "Plan a 20-minute ab workout.",
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
          padding: isMobile ? "1rem 1rem" : "1.5rem 2rem",
          borderBottom: "1px solid #55E37A",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          backgroundColor: "white",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.5rem" : "1rem",
          }}
        >
          <img
            src={tyson}
            alt="Tyson"
            style={{
              width: isMobile ? "60px" : "100px",
              height: isMobile ? "30px" : "50px",
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1rem" : "1.5rem",
                  fontWeight: "bold",
                  color: "#1a1a1a",
                  letterSpacing: "-0.025em",
                }}
              >
                Tyson Workout Assistant
              </h1>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            style={{
              padding: isMobile ? "0.375rem 0.75rem" : "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: isMobile ? "0.75rem" : "0.875rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "0.25rem" : "0.5rem",
              transition: "all 0.2s",
              backgroundColor: messages.length === 0 ? "#f3f4f6" : "#55E37A",
              color: messages.length === 0 ? "#9ca3af" : "#374151",
              border: "none",
              cursor: messages.length === 0 ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = "#C3E906";
              }
            }}
            onMouseLeave={(e) => {
              if (messages.length > 0) {
                e.currentTarget.style.backgroundColor = "#55E37A";
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
          paddingTop: isMobile ? "70px" : "100px", // Responsive padding
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
              gap: isMobile ? "1.5rem" : "2rem",
              padding: isMobile ? "1rem" : "2rem",
            }}
          >
            <img
              src={tyson}
              alt="Tyson"
              className="animate-slide-up-fade animate-delay-200"
              style={{
                width: isMobile ? "200px" : "300px",
                height: isMobile ? "100px" : "150px",
                objectFit: "cover",
              }}
            />
            <div
              className="animate-slide-up-fade animate-delay-300"
              style={{ textAlign: "center" }}
            >
              <p
                style={{
                  transition: "0.5s",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                Hi there!
              </p>
              <p
                style={{
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                I'm Tyson, your workout assistant.
              </p>
              <p
                style={{
                  fontSize: isMobile ? "0.9rem" : "1rem",
                }}
              >
                How can I help?
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  color: "rgba(0, 0, 0, 0.6)",
                }}
              >
                Try out some quick actions below
              </p>
            </div>

            {/* Quick action buttons */}
            <div
              className="animate-slide-up-fade animate-delay-400"
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                gap: isMobile ? "0.75rem" : "1rem",
                width: "100%",
                maxWidth: isMobile ? "100%" : "600px",
              }}
            >
              {quickActions.map((action, index) => (
                <QuickActionButton
                  key={index}
                  text={action}
                  onClick={() => sendQuickMessage(action)}
                  disabled={isLoading}
                  className={`animate-slide-up-fade animate-delay-${
                    500 + index * 100
                  }`}
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
            padding: isMobile ? "1rem" : "1.5rem 2rem",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "0.75rem" : "1rem",
            backgroundColor:
              messages.length > 0 ? "transparent" : "transparent",
          }}
        >
          {messages.map((message, index) => {
            return (
              <div
                key={index}
                className="animate-slide-up-fade"
                style={{
                  alignSelf:
                    message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: isMobile ? "90%" : "80%",
                  // animationDelay: `${index * 0.1}s`, // Stagger each message
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
                                  style={
                                    {
                                      // animationDelay: `${(index + 1) * 0.1}s`, // Stagger exercise cards
                                    }
                                  }
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
                // animationDelay: "0.1s", // Small delay for loading indicator
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
                  Tyson is thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {error && (
        <div
          className="animate-slide-up-fade"
          style={{
            padding: "0.75rem 2rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderTop: "1px solid rgba(239, 68, 68, 0.2)",
            color: "rgba(239, 68, 68, 0.8)",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            // animationDelay: "0.1s",
          }}
        >
          {error}
        </div>
      )}

      <div
        className="animate-slide-up-fade animate-delay-500"
        style={{
          padding: isMobile ? "1rem" : "1.5rem 2rem",
          backgroundColor: "white",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          flexShrink: 0,
          display: "flex",
          gap: isMobile ? "0.5rem" : "1rem",
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            backgroundColor: "white",
            border: "0.5px solid #55E37A",
            borderRadius: "0.5rem",
            color: "#374151",
            justifyContent: isMobile ? "start" : "center",
            padding: "0.5rem 0.75rem",
            fontSize: isMobile ? "0.75rem" : "0.875rem",
            cursor: "pointer",
            width: "auto",
          }}
        >
          {availableModels?.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, width: isMobile ? "100%" : "auto" }}
        >
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
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
                padding: isMobile ? "0.75rem 1rem" : "0.875rem 1rem",
                fontSize: isMobile ? "0.875rem" : "0.9rem",
                minWidth: 0,
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#55E37A";
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
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                fontSize: isMobile ? "16px" : "18px",
                cursor:
                  isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
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
