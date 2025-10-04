import { useState, useEffect } from "react";
import type { ModelInfo } from "../types/api";

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelId: string) => void;
  currentModel: string;
  modelInfo: Record<string, ModelInfo>;
  isLoading?: boolean;
  error?: string | null;
}

export const ModelSelectionModal = ({
  isOpen,
  onClose,
  onSelectModel,
  currentModel,
  modelInfo,
  isLoading = false,
  error = null,
}: ModelSelectionModalProps) => {
  const [selectedModel, setSelectedModel] = useState<string>(currentModel);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Handle responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initial screen size
    checkScreenSize();

    // Add resize listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (!isOpen) return null;

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleConfirm = () => {
    onSelectModel(selectedModel);
    onClose();
  };

  const selectedModelInfo = modelInfo[selectedModel];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isVisible ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
        transition: "background-color 0.3s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: isMobile ? "12px" : "16px",
          width: "100%",
          maxWidth: isMobile ? "95vw" : "900px",
          maxHeight: isMobile ? "95vh" : "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          opacity: isVisible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          margin: isMobile ? "1rem" : "0",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: isMobile ? "1rem 1.5rem" : "1.5rem 2rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: isMobile ? "1.25rem" : "1.5rem",
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              Choose Your AI Model
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0 0",
                color: "#6b7280",
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                display: isMobile ? "none" : "block",
              }}
            >
              Select the AI model that best fits your fitness coaching needs
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0.5rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Error State */}
        {error ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color: "#ef4444",
              }}
            >
              ⚠️
            </div>
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Unable to Load Models
            </h3>
            <p
              style={{
                margin: "0 0 2rem 0",
                color: "#6b7280",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                maxWidth: "400px",
              }}
            >
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#55E37A",
                color: "#111827",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#C3E906";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#55E37A";
              }}
            >
              Reload Page
            </button>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #e5e7eb",
                borderTop: "3px solid #55E37A",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "1rem",
              }}
            ></div>
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#111827",
              }}
            >
              Loading Models...
            </h3>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              Please wait while we fetch the available AI models
            </p>
          </div>
        ) : (
          /* Normal State */
          <div
            style={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div
              style={{
                width: isMobile ? "100%" : "300px",
                height: isMobile ? "200px" : "auto",
                borderRight: isMobile ? "none" : "1px solid #e5e7eb",
                borderBottom: isMobile ? "1px solid #e5e7eb" : "none",
                overflowY: "auto",
                backgroundColor: "#f9fafb",
              }}
            >
              {Object.entries(modelInfo).map(([modelId, model], index) => (
                <div
                  key={modelId}
                  onClick={() => handleSelect(modelId)}
                  style={{
                    padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem",
                    cursor: "pointer",
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor:
                      selectedModel === modelId ? "white" : "transparent",
                    borderRight: isMobile
                      ? "none"
                      : selectedModel === modelId
                      ? "3px solid #55E37A"
                      : "3px solid transparent",
                    borderLeft:
                      isMobile && selectedModel === modelId
                        ? "3px solid #55E37A"
                        : "3px solid transparent",
                    transition: "all 0.2s ease",
                    transform: isVisible
                      ? "translateX(0)"
                      : "translateX(-20px)",
                    opacity: isVisible ? 1 : 0,
                    animationDelay: `${index * 0.1}s`,
                    animation: isVisible
                      ? `slideInFromLeft 0.4s ease-out ${index * 0.1}s both`
                      : "none",
                    width: "auto",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedModel !== modelId) {
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedModel !== modelId) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div
                    style={{
                      fontWeight: selectedModel === modelId ? "600" : "500",
                      fontSize: isMobile ? "0.8rem" : "0.875rem",
                      color: "#111827",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {model.name}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                      color: "#6b7280",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {model.provider}
                  </div>
                </div>
              ))}
            </div>

            {/* Model Details */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? "1.5rem" : "2rem",
                width: "auto",
                minHeight: isMobile ? "300px" : "auto",
              }}
            >
              {selectedModelInfo && (
                <div
                  style={{
                    transform: isVisible ? "translateX(0)" : "translateX(20px)",
                    opacity: isVisible ? 1 : 0,
                    transition: "all 0.4s ease-out 0.2s",
                  }}
                >
                  <div
                    style={{
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: isMobile ? "1.1rem" : "1.25rem",
                        fontWeight: "bold",
                        color: "#111827",
                      }}
                    >
                      {selectedModelInfo.name}
                    </h3>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        color: "#6b7280",
                        fontSize: isMobile ? "0.8rem" : "0.875rem",
                      }}
                    >
                      {selectedModelInfo.provider}
                    </p>
                    <p
                      style={{
                        margin: "0 0 1.5rem 0",
                        color: "#374151",
                        lineHeight: "1.6",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      {selectedModelInfo.description}
                    </p>
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <h4
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      🏋️ Fitness AI Strengths
                    </h4>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: isMobile ? "1rem" : "1.25rem",
                        color: "#374151",
                        lineHeight: "1.6",
                        fontSize: isMobile ? "0.8rem" : "0.9rem",
                      }}
                    >
                      {selectedModelInfo.fitnessStrengths.map(
                        (strength, index) => (
                          <li key={index} style={{ marginBottom: "0.5rem" }}>
                            {strength}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div style={{ marginBottom: "2rem" }}>
                    <h4
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: isMobile ? "0.9rem" : "1rem",
                        fontWeight: "600",
                        color: "#111827",
                      }}
                    >
                      🎯 Best For
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "#374151",
                        lineHeight: "1.6",
                        padding: isMobile ? "0.5rem 0.75rem" : "0.75rem 1rem",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "8px",
                        borderLeft: "4px solid #55E37A",
                        fontSize: isMobile ? "0.8rem" : "0.9rem",
                      }}
                    >
                      {selectedModelInfo.bestFor}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - only show in normal state */}
        {!error && !isLoading && (
          <div
            style={{
              padding: isMobile ? "1rem 1.5rem" : "1.5rem 2rem",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f9fafb",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "1rem" : "0",
            }}
          >
            <div
              style={{
                fontSize: isMobile ? "0.8rem" : "0.875rem",
                color: "#6b7280",
                textAlign: isMobile ? "center" : "left",
              }}
            >
              Current selection: <strong>{selectedModelInfo?.name}</strong>
            </div>
            <div
              style={{
                display: "flex",
                gap: isMobile ? "0.75rem" : "1rem",
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "stretch" : "flex-end",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: isMobile ? "0.75rem 1rem" : "0.5rem 1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: isMobile ? "0.9rem" : "0.875rem",
                  fontWeight: "500",
                  flex: isMobile ? 1 : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: isMobile ? "0.75rem 1rem" : "0.5rem 1rem",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#55E37A",
                  color: "#111827",
                  cursor: "pointer",
                  fontSize: isMobile ? "0.9rem" : "0.875rem",
                  fontWeight: "600",
                  flex: isMobile ? 1 : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#C3E906";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#55E37A";
                }}
              >
                Select Model
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(20px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
