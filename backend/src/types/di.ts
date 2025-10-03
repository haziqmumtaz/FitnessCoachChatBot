export const TYPES = {
  ChatService: Symbol.for("ChatService"),
  ModelProvider: Symbol.for("ModelProvider"),
  ApiRouter: Symbol.for("Router"),
  ToolService: Symbol.for("ToolService"),
  IntentService: Symbol.for("IntentService"),
} as const;

export type DITypes = typeof TYPES;
