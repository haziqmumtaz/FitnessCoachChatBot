import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { condenseConversationHistory } from "../../utils/conversationCondenser";
import { useChat, useModels } from "./api";
import { MessagesSection } from "./components/MessagesSection";
import { WelcomeMessage } from "./components/WelcomeMessage";

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // Custom hooks for chat and models
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  const { availableModels, selectedModel, setSelectedModel } = useModels();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setInputValue("");

    await sendMessage(
      inputValue.trim(),
      selectedModel,
      condenseConversationHistory(messages)
    );
  };

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
      <Header messages={messages} isMobile={isMobile} clearChat={clearChat} />

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
          <WelcomeMessage
            isLoading={isLoading}
            isMobile={isMobile}
            sendQuickMessage={sendQuickMessage}
          />
        )}

        {/* Messages section */}
        <MessagesSection
          messages={messages}
          isLoading={isLoading}
          streamingStatus={null}
          isMobile={isMobile}
        />
      </div>

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
