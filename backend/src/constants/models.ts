import config from "../config";
import { ModelInfo } from "../types/chat";

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
  info: ModelInfo;
};

export const modelConfigs: Record<Model, ModelConfig> = {
  "GPT OSS 120b": {
    name: "openai/gpt-oss-120b",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
    info: {
      id: "GPT OSS 120b",
      name: "GPT OSS 120b",
      provider: "OpenAI (via Groq)",
      description:
        "A powerful 120-billion parameter model optimized for complex reasoning and creative tasks.",
      fitnessStrengths: [
        "Excellent at creating detailed, personalized workout plans",
        "Strong understanding of exercise physiology and biomechanics",
        "Great at adapting workouts for different fitness levels",
        "Superior at explaining complex fitness concepts clearly",
        "Excellent for injury prevention advice and modifications",
      ],
      bestFor:
        "Complex workout planning, detailed fitness education, and personalized coaching",
    },
  },
  "Llama 3.3 Versatile": {
    name: "llama-3.3-70b-versatile",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
    info: {
      id: "Llama 3.3 Versatile",
      name: "Llama 3.3 Versatile",
      provider: "Meta (via Groq)",
      description:
        "Meta's latest versatile model with enhanced reasoning capabilities and multilingual support.",
      fitnessStrengths: [
        "Balanced performance across all fitness domains",
        "Excellent at creating structured workout routines",
        "Good understanding of progressive overload principles",
        "Strong at providing motivational and educational content",
        "Versatile for both beginners and advanced users",
      ],
      bestFor:
        "General fitness coaching, routine creation, and educational content",
    },
  },
  "Llama 3.1 Instant": {
    name: "llama-3.1-8b-instant",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: true,
    info: {
      id: "Llama 3.1 Instant",
      name: "Llama 3.1 Instant",
      provider: "Meta (via Groq)",
      description:
        "Lightweight, fast model optimized for quick responses and real-time interactions.",
      fitnessStrengths: [
        "Ultra-fast responses for quick workout questions",
        "Great for simple exercise demonstrations",
        "Efficient at providing quick form tips",
        "Perfect for rapid-fire Q&A sessions",
        "Lightweight and responsive for mobile use",
      ],
      bestFor: "Quick questions, simple workouts, and real-time assistance",
    },
  },
  "Llama Guard 4": {
    name: "meta-llama/llama-guard-4-12b",
    provider: "groq",
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: config.groqApiKey || "",
    showInDropdown: false,
    info: {
      id: "Llama Guard 4",
      name: "Llama Guard 4",
      provider: "Meta (via Groq)",
      description:
        "Specialized model for content moderation and safety filtering.",
      fitnessStrengths: [
        "Content safety and moderation",
        "Ensuring appropriate fitness advice",
        "Filtering harmful or dangerous recommendations",
      ],
      bestFor: "Content moderation and safety checks",
    },
  },
  "DeepSeek Chat": {
    name: "deepseek-chat",
    provider: "deepseek",
    baseURL: "https://api.deepseek.com/",
    apiKey: config.deepSeekApiKey || "",
    showInDropdown: true,
    info: {
      id: "DeepSeek Chat",
      name: "DeepSeek Chat",
      provider: "DeepSeek",
      description:
        "Advanced reasoning model with strong mathematical and logical capabilities.",
      fitnessStrengths: [
        "Excellent at calculating precise workout metrics",
        "Strong logical reasoning for program progression",
        "Great at analyzing workout data and statistics",
        "Superior understanding of periodization",
        "Excellent for technical fitness questions",
      ],
      bestFor:
        "Data-driven workouts, precise calculations, and technical fitness advice",
    },
  },
  "Gemini 2.0 Flash": {
    name: "gemini-2.0-flash",
    provider: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: config.geminiApiKey || "",
    showInDropdown: true,
    info: {
      id: "Gemini 2.0 Flash",
      name: "Gemini 2.0 Flash",
      provider: "Google",
      description:
        "Google's multimodal model with native understanding of images, videos, and text.",
      fitnessStrengths: [
        "Native multimodal capabilities for exercise demonstrations",
        "Excellent at understanding form from descriptions",
        "Great for visual exercise explanations",
        "Strong integration with Google's knowledge base",
        "Excellent for comprehensive fitness education",
      ],
      bestFor:
        "Visual learning, comprehensive fitness education, and multimodal interactions",
    },
  },
};
