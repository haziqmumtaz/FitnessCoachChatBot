import { injectable } from "inversify";
import OpenAI from "openai";
import config from "../config";
import { Model, modelConfigs, ModelConfig } from "../constants/models";
import {
  AvailableModels,
  ChatMessage,
  ModelProviderOptions,
  ModelProviderResponse,
} from "../types/chat";
import { failure, Result, success } from "../types/core";

export interface IModelProvider {
  chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<Result<ModelProviderResponse>>;
  getAvailableModels(): Promise<Result<AvailableModels>>;
}

@injectable()
export class ModelProvider implements IModelProvider {
  private readonly modelConfigs: Record<Model, ModelConfig>;

  constructor() {
    this.modelConfigs = modelConfigs;
  }

  async chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<Result<ModelProviderResponse>> {
    try {
      const modelName = options?.model;
      const modelConfig = this.modelConfigs[modelName as Model];

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
      const models = Object.keys(this.modelConfigs).filter(
        (model) => this.modelConfigs[model as Model].showInDropdown
      ) as Model[];
      const result: AvailableModels = {
        models,
        defaultModel: models[0],
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
