import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { ModelSelectionModal } from "../../components/ModelSelectionModal";
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
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);

  // Custom hooks for chat and models
  const { messages, isLoading, sendMessage, clearChat } = useChat();

  const {
    selectedModel,
    setSelectedModel,
    modelInfo,
    isLoading: modelsLoading,
    error: modelsError,
  } = useModels();

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

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setIsModelModalOpen(false);
  };

  const handleModelDropdownClick = () => {
    setIsModelModalOpen(true);
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
          paddingTop: isMobile ? "70px" : "100px",
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
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, width: isMobile ? "100%" : "auto" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              width: "100%",
            }}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isLoading
                  ? "Tyson is thinking..."
                  : "Ask Tyson for workout help..."
              }
              disabled={isLoading}
              rows={3}
              style={{
                flex: 1,
                background: isLoading
                  ? "rgba(0, 0, 0, 0.05)"
                  : "rgba(0, 0, 0, 0.02)",
                border: isLoading
                  ? "1px solid rgba(0, 0, 0, 0.15)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                color: isLoading ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.8)",
                padding: isMobile ? "0.75rem 1rem" : "1rem 1.25rem",
                fontSize: isMobile ? "0.875rem" : "0.9rem",
                minWidth: 0,
                outline: "none",
                transition: "all 0.2s ease",
                resize: "vertical",
                minHeight: "60px",
                maxHeight: "120px",
                fontFamily: "inherit",
                lineHeight: "1.5",
                cursor: isLoading ? "not-allowed" : "text",
              }}
              onFocus={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = "#55E37A";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(85, 227, 122, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isLoading
                  ? "rgba(0, 0, 0, 0.15)"
                  : "rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(0, 0, 0, 0.5)",
                  flexDirection: "row",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <p>
                  <span>Selected AI Model: {selectedModel}.</span>
                </p>
                <p
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={handleModelDropdownClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                    e.currentTarget.style.borderColor = "#C3E906";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#55E37A";
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#55E37A" }}>
                    Change?
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                style={{
                  background:
                    isLoading || !inputValue.trim()
                      ? "rgba(0, 0, 0, 0.4)"
                      : "#55E37A",
                  border: "none",
                  borderRadius: "8px",
                  color:
                    isLoading || !inputValue.trim()
                      ? "rgba(255, 255, 255, 0.6)"
                      : "#111827",
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  cursor:
                    isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputValue.trim()) {
                    e.currentTarget.style.backgroundColor = "#C3E906";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && inputValue.trim()) {
                    e.currentTarget.style.backgroundColor = "#55E37A";
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    Sending...
                  </>
                ) : (
                  <>
                    Send
                    <span style={{ fontSize: "0.75rem" }}>↗</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ModelSelectionModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onSelectModel={handleModelSelect}
        currentModel={selectedModel}
        modelInfo={modelInfo}
        isLoading={modelsLoading}
        error={modelsError}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
