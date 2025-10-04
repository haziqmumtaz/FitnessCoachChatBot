import { Container } from "inversify";
import { TYPES } from "../types/di";
import { ChatService, IChatService } from "../service/chat.service";
import { ModelProvider, IModelProvider } from "../service/model.service";
import { ToolService } from "../service/tool.service";
import { IntentService, IIntentService } from "../service/intent.service";
import { ApiRouter } from "../http";
import { Mountable } from "../types/core";

const container = new Container();

// Bind tool service
container.bind(TYPES.ToolService).to(ToolService);

// Bind intent service
container.bind<IIntentService>(TYPES.IntentService).to(IntentService);

// Bind model provider
container.bind<IModelProvider>(TYPES.ModelProvider).to(ModelProvider);

// Bind chat service
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind<Mountable>(TYPES.ApiRouter).to(ApiRouter);

export { container };
