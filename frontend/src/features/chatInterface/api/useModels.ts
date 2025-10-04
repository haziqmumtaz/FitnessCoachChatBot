import { useState, useEffect } from "react";
import { chatApi } from "./chat";
import type { ModelInfo } from "../../../types/api";

export const useModels = () => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("GPT OSS 120b");
  const [modelInfo, setModelInfo] = useState<Record<string, ModelInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const modelsData = await chatApi.getAvailableModels();
        setAvailableModels(modelsData.models);
        setSelectedModel(modelsData.defaultModel);
        setModelInfo(modelsData.modelInfo);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load models:", err);
        setError(err.message || "Failed to load models");
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();
  }, []);

  return {
    availableModels,
    selectedModel,
    setSelectedModel,
    modelInfo,
    isLoading,
    error,
  };
};
