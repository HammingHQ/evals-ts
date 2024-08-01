import type {
  MessageCreateParams,
  MessageCreateParamsNonStreaming,
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages.mjs";
import { ChatMessage, PromptContent, ToolChoice } from "../types";

export const DEFAULT_ANTHROPIC_MAX_TOKENS = 4096;

export function convertAnthropicToolChoice(
  input: ToolChoice,
):
  | MessageCreateParams.ToolChoiceAuto
  | MessageCreateParams.ToolChoiceAny
  | MessageCreateParams.ToolChoiceTool {
  switch (input.choice) {
    case "auto":
      return { type: "auto" };
    case "any":
      return { type: "any" };
    case "tool":
      return { type: "tool", name: input.functionName ?? "" };
    default:
      throw new Error("Invalid tool choice type");
  }
}

export function convertChatMessage(message: ChatMessage): MessageParam {
  switch (message.role) {
    case "user":
      return {
        role: "user",
        content: message.content,
      };
    case "assistant":
      return {
        role: "assistant",
        content: message.content,
      };
    default:
      throw new Error(`Unsupported role: ${message.role}`);
  }
}

export function createMessageParams(
  content: PromptContent,
): MessageCreateParamsNonStreaming {
  const systemMessage = content.chatMessages.find(
    (message) => message.role === "system",
  );
  const messages = content.chatMessages.filter(
    (message) => message.role !== "system",
  );
  return {
    model: content.languageModel,
    system: systemMessage?.content,
    messages: messages.map(convertChatMessage),
    max_tokens:
      content.promptSettings.maxTokens ?? DEFAULT_ANTHROPIC_MAX_TOKENS,
    top_p: content.promptSettings.topP,
    temperature: content.promptSettings.temperature,
    tools: content.tools ? (JSON.parse(content.tools) as Tool[]) : undefined,
    tool_choice:
      content.promptSettings.toolChoice && content.tools
        ? convertAnthropicToolChoice(content.promptSettings.toolChoice)
        : undefined,
  };
}
