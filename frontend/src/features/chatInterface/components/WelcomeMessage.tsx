import QuickActionButton from "../../../components/QuickActionButton";
import tyson from "../../../assets/tyson_logo.png";

interface WelcomeMessageProps {
  isLoading: boolean;
  isMobile: boolean;
  sendQuickMessage: (message: string) => void;
}

export const WelcomeMessage = ({
  isLoading,
  isMobile,
  sendQuickMessage,
}: WelcomeMessageProps) => {
  const quickActions = [
    "Create a 30-minute upper body workout.",
    "Give me a 45-minute leg workout.",
    "Make a 60-minute full body workout.",
    "Plan a 20-minute ab workout.",
  ];

  return (
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
  );
};
