import { useState } from "react";
import { chatApi } from "./chat";
import type { ChatMessage, StreamEvent } from "../../../types/api";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);

  const sendMessage = async (
    message: string,
    model: string,
    conversationHistory: ChatMessage[]
  ) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        message: message.trim(),
        model,
        conversationHistory,
        sessionId: sessionId || undefined,
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.coachTalk,
        detailedExercises: response.detailedExercises,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to send message"
      );

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageStream = async (
    message: string,
    model: string,
    conversationHistory: ChatMessage[]
  ) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    setStreamingStatus(null);

    // Add a temporary assistant message for streaming updates
    const tempAssistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      detailedExercises: [],
    };
    setMessages((prev) => [...prev, tempAssistantMessage]);

    try {
      await chatApi.sendMessageStream(
        {
          message: message.trim(),
          model,
          conversationHistory,
          sessionId: sessionId || undefined,
        },
        (event: StreamEvent) => {
          if (!sessionId && event.sessionId) {
            setSessionId(event.sessionId);
          }

          switch (event.type) {
            case "intent_detected":
              setStreamingStatus(event.data.message);
              break;
            case "tools_calling":
              setStreamingStatus(event.data.message);
              break;
            case "tools_executed":
              setStreamingStatus("Processing exercise data...");
              break;
            case "final_response":
              setStreamingStatus(null);
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage.role === "assistant") {
                  lastMessage.content = event.data.coachTalk;
                  lastMessage.detailedExercises =
                    event.data.detailedExercises || [];
                }
                return updated;
              });
              break;
            case "error":
              setError(event.data.message);
              setStreamingStatus(null);
              setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                if (lastMessage.role === "assistant") {
                  lastMessage.content =
                    "Sorry, I'm having trouble processing your request. Please try again.";
                }
                return updated;
              });
              break;
          }
        },
        (error: Error) => {
          setError(error.message);
          setStreamingStatus(null);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === "assistant") {
              lastMessage.content =
                "Sorry, I'm having trouble processing your request. Please try again.";
            }
            return updated;
          });
        },
        () => {
          setIsLoading(false);
          setStreamingStatus(null);
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to send message");
      setStreamingStatus(null);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content =
            "Sorry, I'm having trouble processing your request. Please try again.";
        }
        return updated;
      });
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setStreamingStatus(null);
  };

  return {
    messages,
    isLoading,
    error,
    sessionId,
    streamingStatus,
    sendMessage,
    sendMessageStream,
    clearChat,
  };
};
