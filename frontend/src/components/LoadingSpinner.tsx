interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          border: "3px solid rgba(255, 255, 255, 0.1)",
          borderTop: "3px solid rgba(255, 255, 255, 0.8)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      {label && (
        <p
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: "1rem",
            margin: 0,
            textAlign: "center",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {label}
        </p>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
