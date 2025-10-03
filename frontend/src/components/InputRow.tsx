import { type KeyboardEvent } from "react";

interface InputRowProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function InputRow({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: InputRowProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1rem",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="\d*"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Enter book ID (e.g. 1524)"
        style={{
          flex: 1,
          padding: "1rem 1.25rem",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          fontSize: "1.1rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          color: "#2d3748",
          outline: "none",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          fontWeight: "500",
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          padding: "1rem 1.5rem",
          backgroundColor: disabled
            ? "rgba(156, 163, 175, 0.8)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          background: disabled
            ? "rgba(156, 163, 175, 0.8)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "1.1rem",
          fontWeight: "600",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.3s ease",
          boxShadow: disabled ? "none" : "0 6px 20px rgba(102, 126, 234, 0.4)",
          transform: disabled ? "none" : "translateY(0)",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(102, 126, 234, 0.6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 6px 20px rgba(102, 126, 234, 0.4)";
          }
        }}
      >
        Fetch
      </button>
    </div>
  );
}
