import "dotenv/config";

const config = {
  port: process.env.PORT || 3001,
  groqApiKey: process.env.GROQ_API_KEY,
  deepSeekApiKey: process.env.DEEPSEEK_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  defaultModel: process.env.DEFAULT_MODEL || "GPT OSS 120b",
};

export default config;
