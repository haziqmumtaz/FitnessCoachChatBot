import React from "react";

interface QuickActionButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  text,
  onClick,
  disabled = false,
  className,
}) => (
  <button
    className={className}
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

export default QuickActionButton;
