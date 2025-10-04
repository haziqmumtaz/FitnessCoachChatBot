import config from "../config";

export type Model =
  | "GPT OSS 120b"
  | "Llama 3.3 Versatile"
  | "Llama 3.1 Instant"
  | "Llama Guard 4"
  | "DeepSeek Chat"
  | "Gemini 2.0 Flash";

export type ModelConfig = {
  name: string;
  provider: string;
  baseURL?: string;
  apiKey: string;
  showInDropdown?: boolean;
};

export const modelConfigs: Record<Model, ModelConfig> = {
  "GPT OSS 120b": {
    name: "openai/gpt-oss-120b",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
  },
  "Llama 3.3 Versatile": {
    name: "llama-3.3-70b-versatile",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
  },
  "Llama 3.1 Instant": {
    name: "llama-3.1-8b-instant",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
  },
  "Llama Guard 4": {
    name: "meta-llama/llama-guard-4-12b",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: false,
  },
  "DeepSeek Chat": {
    name: "deepseek-chat",
    provider: "deepseek",
    baseURL: "https://api.deepseek.com/",
    apiKey: config.deepSeekApiKey || "",
    showInDropdown: true,
  },
  "Gemini 2.0 Flash": {
    name: "gemini-2.0-flash",
    provider: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: config.geminiApiKey || "",
    showInDropdown: true,
  },
};
