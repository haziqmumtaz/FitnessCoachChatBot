import Router from "@koa/router";
import { Context } from "koa";
import { container } from "../config/container";
import { IChatService } from "../service/chat.service";
import { IModelProvider } from "../service/model.service";
import { TYPES } from "../types/di";
import { ChatRequestSchema } from "./schemas/chat";
import { success, failure, Result } from "../types/core";
import { ChatResponse, AvailableModels, StreamEvent } from "../types/chat";

const chatController = async (ctx: Context) => {
  const chatService = container.get<IChatService>(TYPES.ChatService);

  const requestBody = ChatRequestSchema.parse((ctx.request as any).body);

  const result: Result<ChatResponse> = await chatService.chat(requestBody);
  ctx.body = result;
};

const chatStreamController = async (ctx: Context) => {
  const chatService = container.get<IChatService>(TYPES.ChatService);

  const requestBody = ChatRequestSchema.parse((ctx.request as any).body);

  // Set up Server-Sent Events
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Set status to 200 to avoid 404
  ctx.status = 200;

  try {
    const stream = chatService.chatStream(requestBody);

    for await (const event of stream) {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      ctx.res.write(data);
    }

    ctx.res.write("data: [DONE]\n\n");
    ctx.res.end();
  } catch (error: any) {
    console.error("Stream error:", error);
    const errorEvent: StreamEvent = {
      type: "error",
      data: { message: "Stream error", error: error.message },
      sessionId: requestBody.sessionId || "unknown",
    };
    ctx.res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    ctx.res.write("data: [DONE]\n\n");
    ctx.res.end();
  }
};

const modelsController = async (ctx: Context) => {
  const modelProvider = container.get<IModelProvider>(TYPES.ModelProvider);
  const result: Result<AvailableModels> =
    await modelProvider.getAvailableModels();
  ctx.body = result;
};

export const createChatRouter = () => {
  const router = new Router({ prefix: "/chat" });

  router.post("/", chatController);
  router.post("/stream", chatStreamController);
  router.get("/models", modelsController);

  return router;
};
