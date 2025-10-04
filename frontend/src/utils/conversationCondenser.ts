import type { ChatMessage } from "../types/api";

export const condenseConversationHistory = (
  messages: ChatMessage[]
): ChatMessage[] => {
  if (!messages || messages.length === 0) {
    return [];
  }

  // Take last 3 messages and condense them
  const recentMessages = messages.slice(-3);
  const condensedMessages: ChatMessage[] = [];

  for (const message of recentMessages) {
    if (message.role === "user") {
      // Keep user messages as-is but truncate if too long
      const condensedContent =
        message.content.length > 100
          ? message.content.substring(0, 100) + "..."
          : message.content;
      condensedMessages.push({
        ...message,
        content: condensedContent,
      });
    } else if (message.role === "assistant") {
      // Extract only key information from assistant responses
      const condensedContent = extractKeyInfoFromAssistantMessage(
        message.content
      );
      if (condensedContent) {
        condensedMessages.push({
          ...message,
          content: condensedContent,
        });
      }
    }
  }

  return condensedMessages;
};

/**
 * Extracts only essential information from assistant messages
 * Focuses on workout-related content to maintain context while reducing size
 */
const extractKeyInfoFromAssistantMessage = (content: string): string | null => {
  const lines = content.split("\n");
  const keyInfo: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Look for workout type, muscle groups, equipment, duration, exercise details
    if (
      trimmedLine.includes("workout") ||
      trimmedLine.includes("exercises") ||
      trimmedLine.includes("muscle") ||
      trimmedLine.includes("equipment") ||
      trimmedLine.includes("minute") ||
      trimmedLine.includes("duration") ||
      trimmedLine.includes("sets") ||
      trimmedLine.includes("reps") ||
      trimmedLine.match(/^\d+\./) || // Exercise lists (1., 2., etc.)
      trimmedLine.includes("##") || // Headers
      trimmedLine.includes("###") // Subheaders
    ) {
      // Truncate long lines
      const shortLine =
        trimmedLine.length > 80
          ? trimmedLine.substring(0, 80) + "..."
          : trimmedLine;
      keyInfo.push(shortLine);
    }
  }

  // Return condensed info or null if nothing relevant found
  return keyInfo.length > 0 ? keyInfo.join(" | ") : null;
};
