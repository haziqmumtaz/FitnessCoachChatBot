import { injectable } from "inversify";
import OpenAI from "openai";
import {
  ModelProviderResponse,
  ModelProviderOptions,
  ChatMessage,
} from "../types/chat";
import config from "../config";

export interface IModelProvider {
  chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<ModelProviderResponse>;
  stream?(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): AsyncIterator<ModelProviderResponse>;
}

interface ModelConfig {
  name: string;
  provider: string;
  baseURL?: string;
  apiKey: string;
}

@injectable()
export class ModelProvider implements IModelProvider {
  private readonly modelConfigs: Record<string, ModelConfig>;

  constructor() {
    this.modelConfigs = {
      "openai/gpt-oss-120b": {
        name: "openai/gpt-oss-120b",
        provider: "openai",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      "llama-3.3-70b-versatile": {
        name: "llama-3.3-70b-versatile",
        provider: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      "llama-3.1-8b-instant": {
        name: "llama-3.1-8b-instant",
        provider: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      "deepseek-chat": {
        name: "deepseek-chat",
        provider: "deepseek",
        baseURL: "https://api.deepseek.com/",
        apiKey: config.deepSeekApiKey || "",
      },
    };
  }

  async chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<ModelProviderResponse> {
    const modelName = options?.model || config.defaultModel;
    const modelConfig = this.modelConfigs[modelName];

    if (!modelConfig) {
      throw new Error(`Model ${modelName} not supported`);
    }

    if (!modelConfig.apiKey) {
      throw new Error(`API key not configured for model ${modelName}`);
    }

    const client = new OpenAI({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.baseURL,
    });

    const response = await client.chat.completions.create({
      model: modelConfig.name,
      messages: messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
      stream: false,
      tools: options?.tools,
      tool_choice: options?.toolChoice,
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error("No response from model");
    }

    // Extract tool calls if any
    const toolCalls = choice.message.tool_calls?.map((toolCall) => ({
      id: toolCall.id,
      type: toolCall.type as "function",
      function: {
        name: (toolCall as any).function.name,
        arguments: (toolCall as any).function.arguments,
      },
    }));

    return {
      content: choice.message.content || "",
      model: modelConfig.name,
      toolCalls: toolCalls,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  getAvailableModels(): string[] {
    return Object.keys(this.modelConfigs);
  }
}
