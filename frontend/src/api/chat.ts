import { http } from "./client";
import type { ChatRequest, ChatResponse, AvailableModels } from "../types/api";

export const chatApi = {
  // Send a chat message
  sendMessage: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await http.post<ChatResponse>("/chat", request);
    return response.data;
  },

  // Get available models
  getAvailableModels: async (): Promise<AvailableModels> => {
    const response = await http.get<AvailableModels>("/chat/models");
    return response.data;
  },
};
