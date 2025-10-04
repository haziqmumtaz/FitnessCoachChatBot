import { http } from "../../../api/client";
import type {
  ChatRequest,
  ChatResponse,
  AvailableModels,
  StreamEvent,
} from "../../../types/api";

export const chatApi = {
  // Send a chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await http.post<ChatResponse>("/chat", request);
    return response.data;
  },

  // Send a streaming chat message
  sendMessageStream: async (
    request: ChatRequest,
    onEvent: (event: StreamEvent) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> => {
    try {
      const response = await fetch(`${http.defaults.baseURL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              onComplete?.();
              return;
            }

            try {
              const event: StreamEvent = JSON.parse(data);
              onEvent(event);
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
      onError?.(error as Error);
    }
  },

  // Get available models
  getAvailableModels: async (): Promise<AvailableModels> => {
    const response = await http.get<AvailableModels>("/chat/models");
    return response.data;
  },
};
