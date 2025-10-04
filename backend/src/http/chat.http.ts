import Router from "@koa/router";
import { Context } from "koa";
import { container } from "../config/container";
import { IChatService } from "../service/chat.service";
import { IModelProvider } from "../service/model.service";
import { TYPES } from "../types/di";
import { ChatRequestSchema } from "./schemas/chat";

const chatController = async (ctx: Context) => {
  const chatService = container.get<IChatService>(TYPES.ChatService);

  const requestBody = ChatRequestSchema.parse((ctx.request as any).body);

  const response = await chatService.chat(requestBody);

  ctx.status = 200;
  ctx.body = response;
};

const modelsController = (ctx: Context) => {
  try {
    const modelProvider = container.get<IModelProvider>(TYPES.ModelProvider);
    const availableModels = (modelProvider as any).getAvailableModels?.() || [];

    ctx.status = 200;
    ctx.body = {
      models: availableModels,
      defaultModel: "openai/gpt-oss-120b",
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      error: "Failed to get available models",
      message: error.message,
    };
  }
};

export const createChatRouter = () => {
  const router = new Router({ prefix: "/chat" });

  router.post("/", chatController);
  router.get("/models", modelsController);

  return router;
};
