interface ErrorBannerProps {
  message: string;
  description?: string;
}

export function ErrorBanner({ message, description }: ErrorBannerProps) {
  return (
    <div
      style={{
        backgroundColor: "rgba(254, 226, 226, 0.95)",
        border: "2px solid rgba(248, 113, 113, 0.3)",
        borderRadius: "12px",
        padding: "1.25rem",
        margin: "1rem 0",
        color: "#dc2626",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
        backdropFilter: "blur(10px)",
        textAlign: "center",
        fontWeight: "500",
        fontSize: "1rem",
      }}
    >
      {message}
      {description && <p>{description}</p>}
    </div>
  );
}
