import { injectable } from "inversify";
import OpenAI from "openai";
import {
  ModelProviderResponse,
  ModelProviderOptions,
  ChatMessage,
  AvailableModels,
} from "../types/chat";
import { Result, success, failure } from "../types/core";
import config from "../config";

export interface IModelProvider {
  chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<Result<ModelProviderResponse>>;
  getAvailableModels(): Promise<Result<AvailableModels>>;
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
        name: "llama-3.3-70b-versatile",
        provider: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      "llama-3.3-versatile": {
        name: "llama-3.3-70b-versatile",
        provider: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      "llama-3.1-instant": {
        name: "llama-3.1-8b-instant",
        provider: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKey: config.groqApiKey || "",
      },
      deepseek: {
        name: "deepseek-chat",
        provider: "deepseek",
        baseURL: "https://api.deepseek.com/",
        apiKey: config.deepSeekApiKey || "",
      },
      gemini: {
        name: "gemini-2.0-flash",
        provider: "gemini",
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: config.geminiApiKey || "",
      },
    };
  }

  async chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<Result<ModelProviderResponse>> {
    try {
      const modelName = options?.model || config.defaultModel;
      const modelConfig = this.modelConfigs[modelName];

      if (!modelConfig) {
        return failure(
          `Model ${modelName} not supported`,
          "MODEL_NOT_SUPPORTED"
        );
      }

      if (!modelConfig.apiKey) {
        return failure(
          `API key not configured for model ${modelName}`,
          "API_KEY_MISSING"
        );
      }

      const client = new OpenAI({
        apiKey: modelConfig.apiKey,
        baseURL: modelConfig.baseURL,
      });

      const response = await client.chat.completions.create({
        model: modelConfig.name,
        messages: messages as any, // Type assertion for OpenAI compatibility
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
        stream: false,
        tools: options?.tools,
        tool_choice: options?.toolChoice,
      });

      const choice = response.choices[0];
      if (!choice || !choice.message) {
        return failure("No response from model", "NO_RESPONSE");
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

      const result: ModelProviderResponse = {
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

      return success(result);
    } catch (error: any) {
      console.error("Model provider error:", error);
      return failure("Model provider error", "MODEL_ERROR", error.message);
    }
  }

  async getAvailableModels(): Promise<Result<AvailableModels>> {
    try {
      const models = Object.keys(this.modelConfigs);
      const result: AvailableModels = {
        models,
        defaultModel: config.defaultModel,
      };
      return success(result);
    } catch (error: any) {
      console.error("Error getting available models:", error);
      return failure(
        "Failed to get available models",
        "MODELS_ERROR",
        error.message
      );
    }
  }
}
