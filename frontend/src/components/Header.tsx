import type { ChatMessage } from "../types/api";
import tyson from "../assets/tyson_logo.png";

interface HeaderProps {
  messages: ChatMessage[];
  isMobile: boolean;
  clearChat: () => void;
}

export const Header = ({ messages, isMobile, clearChat }: HeaderProps) => {
  return (
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
  );
};
