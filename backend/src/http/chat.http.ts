import Router from "@koa/router";
import { Context } from "koa";
import { container } from "../config/container";
import { IChatService } from "../service/chat.service";
import { IModelProvider } from "../service/model.service";
import { TYPES } from "../types/di";
import { ChatRequestSchema } from "./schemas/chat";
import { success, failure, Result } from "../types/core";
import { ChatResponse, AvailableModels } from "../types/chat";

const chatController = async (ctx: Context) => {
  const chatService = container.get<IChatService>(TYPES.ChatService);

  const requestBody = ChatRequestSchema.parse((ctx.request as any).body);

  const result: Result<ChatResponse> = await chatService.chat(requestBody);
  ctx.body = result;
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
  router.get("/models", modelsController);

  return router;
};
